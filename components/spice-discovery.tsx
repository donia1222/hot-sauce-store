"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Star, ShoppingCart, Sparkles, Target, Award } from "lucide-react"
import FireThermometer from "./fire-thermometer"

interface Product {
  id?: number
  name: string
  description: string
  price: number
  image?: string
  image_url?: string
  heatLevel: number
  rating: number
  badge?: string
  origin?: string
  category?: string
  stock?: number
}

// API Response interface (snake_case from API)
interface ApiProduct {
  id?: number
  name: string
  description: string
  price: number
  image?: string
  image_url?: string
  heat_level: number
  rating: number
  badge: string
  origin: string
  category?: string
  stock?: number
  created_at?: string
  updated_at?: string
}

interface ApiResponse {
  success: boolean
  products: ApiProduct[]
  total?: number
  stats?: {
    total_products: number
    hot_sauces: number
    bbq_sauces: number
  }
  error?: string
}

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  description: string
  heatLevel: number
  rating: number
  badge?: string
  origin?: string
  quantity: number
}

interface SpiceDiscoveryProps {
  products?: Product[]
  onAddToCart?: (product: Product, quantity?: number) => void
  className?: string
}

export default function SpiceDiscovery({ 
  products = [],
  onAddToCart = () => {},
  className = ""
}: SpiceDiscoveryProps) {
  const [selectedHeatLevel, setSelectedHeatLevel] = useState(1)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [userProfile, setUserProfile] = useState({
    tolerance: 1,
    preferences: [] as string[],
    experienceLevel: "Anfänger"
  })
  const [apiProducts, setApiProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  
  // Local states for visual feedback only
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())
  const [animatingProducts, setAnimatingProducts] = useState<Set<number>>(new Set())

  const API_BASE_URL = "https://web.lweb.ch/shop"

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError("")

        const response = await fetch(`${API_BASE_URL}/get_products.php`)
        const data: ApiResponse = await response.json()

        if (data.success) {
          const normalizedProducts: Product[] = data.products.map((product: ApiProduct) => ({
            ...product,
            heatLevel: product.heat_level || 0,
            stock: product.stock || 0,
            badge: product.badge || "SALSA",
            origin: product.origin || "Desconocido"
          }))
          setApiProducts(normalizedProducts)
        } else {
          throw new Error(data.error || "Error al cargar productos")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar productos")
        console.error("Error loading products:", err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Initial recommendations when products load
  useEffect(() => {
    if (apiProducts.length > 0) {
      updateRecommendations(selectedHeatLevel)
    }
  }, [apiProducts])



  // Update recommendations when heat level changes - simplified
  const updateRecommendations = (heatLevel: number) => {
    const availableProducts = apiProducts.length > 0 ? apiProducts : products
    
    if (availableProducts.length > 0) {
      // Filter products by heat level
      const filtered = availableProducts.filter(product => product.heatLevel === heatLevel)
      
      // Sort by rating and stock availability
      const sorted = filtered.sort((a, b) => {
        if ((a.stock || 0) === 0 && (b.stock || 0) > 0) return 1
        if ((a.stock || 0) > 0 && (b.stock || 0) === 0) return -1
        return b.rating - a.rating
      })

      setRecommendedProducts(sorted.slice(0, 3)) // Show top 3
      setShowRecommendations(true)      
      // Update user profile
      setUserProfile(prev => ({
        ...prev,
        tolerance: heatLevel,
        experienceLevel: heatLevel <= 2 ? "Anfänger" : 
                        heatLevel <= 3 ? "Fortgeschritten" : "Experte"
      }))
    }
  }

  const handleHeatLevelChange = useCallback((level: number) => {
    setSelectedHeatLevel(level)
    updateRecommendations(level)
  }, [apiProducts, products])

  const handleProductRecommend = useCallback((products: Product[]) => {
    // This is now handled by updateRecommendations, so we can leave it empty
    // or use it for additional logic if needed
  }, [])


  // Handle purchase - only use main cart
  const handlePurchase = (product: Product, event?: React.MouseEvent) => {
    if ((product.stock || 0) === 0 || !product.id) return

    // Add to main cart through parent
    onAddToCart(product, 1)
    
    // Visual feedback only
    setAddedItems((prev) => new Set([...prev, product.id!]))

    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(product.id!)
        return newSet
      })
    }, 2000)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-all duration-300 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  const renderProductCard = (product: Product, index: number) => {
    const isOutOfStock = (product.stock || 0) === 0
    
    return (
      <Card 
        key={product.id || index}
        className={`group bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 hover:border-red-500/50 transition-all duration-500 overflow-hidden ${
          showRecommendations ? 'animate-slide-up opacity-100' : 'opacity-0'
        }`}
        style={{ animationDelay: `${index * 150}ms` }}
      >
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <img
                src={product.image_url || product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
              {product.badge && (
                <Badge className={`absolute -top-2 -right-2 text-xs px-2 py-1 ${
                  product.category === "bbq-sauce" ? "bg-amber-500" : "bg-red-500"
                } text-white border-0`}>
                  {product.badge}
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-lg line-clamp-1 group-hover:text-red-400 transition-colors">
                {product.name}
              </h4>
              
              <p className="text-gray-400 text-sm line-clamp-2 mb-2 leading-relaxed">
                {product.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex">{renderStars(product.rating)}</div>
                  <span className="text-gray-400 text-sm">{product.rating}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: product.heatLevel }, (_, i) => (
                    <Flame key={i} className="w-3 h-3 text-red-500 fill-red-500" />
                  ))}
                </div>
              </div>



            </div>
          </div>
        </CardContent>
      </Card>
    )
  }



  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-red-500/30 mb-4">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-semibold">Persönliche Entdeckung</span>
        </div>
        
        <h2 className="text-4xl font-black text-white mb-2">
          Finde deine <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">perfekte Sauce</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Nutze unseren intelligenten Messer, um Saucen zu entdecken, die perfekt zu deiner Schärfe-Toleranz passen
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">
              Lade Produkte von der API...
            </h4>
            <p className="text-gray-500">
              Hole die besten Saucen von {API_BASE_URL}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !loading && (
        <Card className="bg-gradient-to-r from-red-900/50 via-red-800/50 to-red-900/50 border-red-700">
          <CardContent className="p-8 text-center">
            <Flame className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-red-300 mb-2">
              Fehler beim Laden der Produkte
            </h4>
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Erneut versuchen
            </button>
          </CardContent>
        </Card>
      )}

      {/* Fire Thermometer */}
      {!loading && !error && (
        <FireThermometer 
          onHeatLevelChange={handleHeatLevelChange}
          onProductRecommend={handleProductRecommend}
          products={apiProducts.length > 0 ? apiProducts : products}
        />
      )}

      {/* User Profile & Recommendations */}
      {!loading && !error && showRecommendations && (
        <div className="space-y-6">

    

          {/* Product Recommendations */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Empfohlene Saucen für dich
              </h3>
              <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                {recommendedProducts.length} gefunden
              </Badge>
            </div>

            {recommendedProducts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedProducts.map((product, index) => renderProductCard(product, index))}
              </div>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Flame className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-300 mb-2">
                    Keine Saucen für dieses Level verfügbar
                  </h4>
                  <p className="text-gray-500">
                    Versuche ein anderes Level oder komm später wieder
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}


      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

      `}</style>
    </div>
  )
}