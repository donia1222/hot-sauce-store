"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flame, Star, ShoppingCart, Minus, Plus, Sparkles, MapPin, Award } from "lucide-react"

// Actualizar la interfaz para incluir category
interface Product {
  id?: number
  name: string
  description: string
  price: number
  image?: string
  image_url?: string
  heatLevel: number // Changed from heat_level to heatLevel for consistency
  rating: number
  badge: string
  origin: string
  category?: string
  created_at?: string
  updated_at?: string
}

// API Response interface (snake_case from API)
interface ApiProduct {
  id?: number
  name: string
  description: string
  price: number
  image?: string
  image_url?: string
  heat_level: number // API uses snake_case
  rating: number
  badge: string
  origin: string
  category?: string
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

interface ProductsGridProps {
  onAddToCart?: (product: Product, quantity: number) => void
  purchasedItems?: Set<number>
  onMarkAsPurchased?: (productId: number) => void
}

export default function ProductsGridCombined({
  onAddToCart = () => {},
  purchasedItems = new Set(),
  onMarkAsPurchased = () => {},
}: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [visibleProducts, setVisibleProducts] = useState<Set<number>>(new Set())
  const [addedItems, setAddedItems] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState({ hot_sauces: 0, bbq_sauces: 0, total_products: 0 })

  const API_BASE_URL = "https://web.lweb.ch/shop"

  // Cargar productos desde la API
  useEffect(() => {
    loadProducts()
  }, [])

  // Animación escalonada
  useEffect(() => {
    if (products.length > 0) {
      setVisibleProducts(new Set()) // Reset visibility
      const timer = setTimeout(() => {
        const filteredProducts = getFilteredProducts()
        filteredProducts.forEach((_, index) => {
          setTimeout(() => {
            setVisibleProducts((prev) => new Set([...prev, index]))
          }, index * 100)
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [products, activeTab])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError("")

      // Usar el nuevo parámetro de categoría
      const categoryParam = activeTab !== "all" ? `&category=${activeTab}` : ""
      const response = await fetch(`${API_BASE_URL}/get_products.php?${categoryParam}`)
      const data: ApiResponse = await response.json()

      if (data.success) {
        // Convert snake_case to camelCase for consistency
        const normalizedProducts: Product[] = data.products.map((product: ApiProduct) => ({
          ...product,
          heatLevel: product.heat_level || 0,
        }))
        setProducts(normalizedProducts)
        if (data.stats) {
          setStats(data.stats)
        }
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

  // Filtrar productos por categoría usando la nueva columna category
  const getFilteredProducts = () => {
    switch (activeTab) {
      case "hot-sauce":
        return products.filter(
          (product) =>
            product.category === "hot-sauce" || (!product.category && product.name.toLowerCase().includes("hot sauce")), // Solo legacy hot sauces
        )
      case "bbq-sauce":
        return products.filter(
          (product) =>
            product.category === "bbq-sauce" ||
            (!product.category &&
              (product.name.toLowerCase().includes("barbecue") || product.name.toLowerCase().includes("bbq"))),
        )
      default:
        return products
    }
  }

  const renderHeatLevel = (level: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Flame
        key={i}
        className={`w-4 h-4 transition-colors duration-300 ${
          i < level ? "text-red-500 fill-red-500" : "text-gray-300"
        }`}
      />
    ))

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-all duration-300 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400 animate-twinkle" : "text-gray-300"
        }`}
        style={{ animationDelay: `${i * 100}ms` }}
      />
    ))

  const updateQty = (id: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 1
      const next = Math.min(10, Math.max(1, current + delta))
      return { ...prev, [id]: next }
    })
  }

  const getQty = (id: number) => quantities[id] ?? 1

  const handleAddToCart = (product: Product) => {
    onAddToCart(product, getQty(product.id!))
    onMarkAsPurchased(product.id!)

    setAddedItems((prev) => new Set([...prev, product.id!]))
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(product.id!)
        return newSet
      })
    }, 2000)
  }

  const renderProductCard = (product: Product, index: number) => (
    <Card
      key={product.id}
      className={`group relative bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-700 rounded-2xl overflow-hidden ${
        visibleProducts.has(index) ? "animate-slide-up opacity-100" : "opacity-0 translate-y-8"
      } ${addedItems.has(product.id!) ? "animate-success-pulse" : "hover:-translate-y-3 hover:rotate-1"}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Efecto de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

      <CardContent className="p-0 overflow-hidden rounded-t-2xl">
        <div className="relative">
          <img
            src={product.image_url || "/placeholder.svg?height=200&width=300"}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=200&width=300"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Badges con indicador de categoría */}
        <Badge
          className={`absolute top-4 left-4 font-semibold shadow-sm animate-bounce-in ${
            product.category === "bbq-sauce"
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
        >
          {product.badge}
        </Badge>
        <Badge
          variant="outline"
          className="absolute top-4 right-4 bg-white/90 border-gray-200 text-gray-700 font-medium animate-bounce-in animation-delay-100"
        >
          <MapPin className="w-3 h-3 mr-1" />
          {product.origin}
        </Badge>

        {/* Indicador de categoría */}
        <div className="absolute top-12 left-4">
          <Badge
            variant="outline"
            className={`text-xs ${
              product.category === "bbq-sauce"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {product.category === "bbq-sauce" ? "🔥 BBQ" : "🌶️ Hot Sauce"}
          </Badge>
        </div>

        {/* Indicador de nivel de picante flotante */}
        <div className="absolute bottom-4 right-4 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex">{renderHeatLevel(product.heatLevel)}</div>
        </div>
      </CardContent>

      <CardContent className="px-6 py-4">
        <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-red-600 transition-colors duration-300">
          {product.name}
        </h4>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>

        {/* Rating y nivel de picante */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(product.rating)}</div>
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
          </div>
          <div className="text-xs text-gray-500 font-medium">Schärfe-Level</div>
        </div>

        {/* Cantidad y precio */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-gray-900 animate-price-update">
            {(product.price * getQty(product.id!)).toFixed(2)} CHF
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden hover:bg-gray-200 transition-colors duration-300">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateQty(product.id!, -1)}
              className="px-3 hover:bg-red-200 text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="px-4 py-2 font-semibold text-gray-800 min-w-[3rem] text-center animate-bounce-subtle">
              {getQty(product.id!)}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateQty(product.id!, 1)}
              className="px-3 hover:bg-red-200 text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <Button
          onClick={() => handleAddToCart(product)}
          disabled={purchasedItems.has(product.id!)}
          className={`w-full font-semibold py-3 rounded-lg transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            purchasedItems.has(product.id!) || addedItems.has(product.id!)
              ? "bg-green-600 hover:bg-green-700 animate-success"
              : product.category === "bbq-sauce"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 animate-gradient-shift"
                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-pink-600 animate-gradient-shift"
          } disabled:opacity-50 disabled:cursor-not-allowed text-white`}
        >
          <ShoppingCart className={`w-4 h-4 mr-2 ${addedItems.has(product.id!) ? "animate-bounce" : ""}`} />
          {purchasedItems.has(product.id!) || addedItems.has(product.id!) ? "✓ Hinzugefügt" : "In Warenkorb"}
        </Button>
      </CardFooter>
    </Card>
  )

  if (loading) {
    return (
      <section className="py-24 px-6 bg-gradient-to-br from-slate-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-24 px-6 bg-gradient-to-br from-slate-50 via-white to-red-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Error al cargar productos</p>
            <p className="text-sm">{error}</p>
            <Button onClick={loadProducts} className="mt-4" variant="outline">
              Reintentar
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const filteredProducts = getFilteredProducts()

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-slate-50 via-white to-red-50 relative overflow-hidden">
      {/* Elementos flotantes de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-16 w-3 h-3 bg-red-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-64 right-24 w-2 h-2 bg-orange-400 rounded-full animate-float-delayed opacity-50"></div>
        <Sparkles className="absolute top-80 left-1/3 w-5 h-5 text-red-300 animate-spin-slow opacity-30" />
        <Sparkles className="absolute bottom-80 right-1/3 w-4 h-4 text-orange-300 animate-spin-slow opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            Premium Sauce Collection
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            SMOKEHOUSE
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
              HOT SAUCE & BBQ
            </span>
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handverlesene Hot Sauces und BBQ-Saucen aus unserer Premium-Kollektion
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-red-600 to-orange-600 mx-auto mt-6 rounded-full animate-expand"></div>
        </div>



        {/* Tabs para filtrar productos */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white shadow-lg rounded-xl p-1">

            <TabsTrigger
              value="hot-sauce"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-semibold transition-all duration-300"
            >
              🌶️ Hot Sauce
            </TabsTrigger>
            <TabsTrigger
              value="bbq-sauce"
              className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white font-semibold transition-all duration-300"
            >
              🔥 BBQ Sauce
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-8">
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {activeTab === "hot-sauce" && "🌶️ Hot Sauce Kollektion"}
                {activeTab === "bbq-sauce" && "🔥 BBQ Sauce Kollektion"}
                {activeTab === "all" && "🍖 Komplette Sauce Kollektion"}
              </h4>
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? "Produkt" : "Produkte"} verfügbar
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => renderProductCard(product, index))}
            </div>

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Keine Produkte in dieser Kategorie gefunden</p>
                <Button onClick={() => setActiveTab("all")} className="mt-4" variant="outline">
                  Alle Produkte anzeigen
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(-180deg); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes success-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
        }
        
        @keyframes expand {
          from { width: 0; }
          to { width: 8rem; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        .animate-success-pulse {
          animation: success-pulse 1s ease-in-out;
        }
        
        .animate-expand {
          animation: expand 1s ease-out 0.8s forwards;
          width: 0;
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        
        .animation-delay-100 {
          animation-delay: 100ms;
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
    </section>
  )
}
