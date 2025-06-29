"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Flame, Star, ShoppingCart, Minus, Plus, MapPin, Award, Info } from "lucide-react"
import { ShoppingCartComponent } from "./shopping-cart"
import { CheckoutPage } from "@/components/checkout-page"

// Actualizar la interfaz para incluir category
interface Product {
  id?: number
  name: string
  description: string
  price: number
  image?: string
  image_url?: string
  heatLevel: number
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
  heat_level: number
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

interface ProductsGridProps {
  onAddToCart?: (product: Product, quantity: number) => void
  purchasedItems?: Set<number>
  onMarkAsPurchased?: (productId: number) => void
}

export default function ProductsGridCompact({
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [stats, setStats] = useState({ hot_sauces: 0, bbq_sauces: 0, total_products: 0 })
  const [cartCount, setCartCount] = useState(0)
  const [animatingProducts, setAnimatingProducts] = useState<Set<number>>(new Set())
  const [cartBounce, setCartBounce] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentView, setCurrentView] = useState<"products" | "checkout" | "success">("products")
  const cartRef = useRef<HTMLDivElement>(null)

  const API_BASE_URL = "https://web.lweb.ch/shop"

  // Cargar productos desde la API
  useEffect(() => {
    loadProducts()
  }, [])

  // Escuchar eventos del chat para abrir modales específicos
  useEffect(() => {
    const handleOpenProductModal = (event: any) => {
      const { productId, productData } = event.detail
      console.log(`🎯 Recibido evento para abrir modal del producto ${productId}:`, productData)
      
      // Buscar el producto real en nuestra lista de productos
      const realProduct = products.find(p => p.id === productId)
      if (realProduct) {
        console.log(`✅ Producto encontrado en la lista:`, realProduct)
        setSelectedProduct(realProduct)
      } else {
        console.log(`⚠️ Producto no encontrado en la lista, usando datos del chat`)
        // Convertir los datos del chat al formato de Product
        const chatProduct: Product = {
          id: productData.id,
          name: productData.name,
          description: `Información detallada sobre ${productData.name}`,
          price: productData.price,
          image_url: productData.image,
          heatLevel: productData.heatLevel,
          rating: 4.5, // Valor por defecto
          badge: productData.badge,
          origin: 'USA', // Valor por defecto
          category: 'bbq-sauce'
        }
        setSelectedProduct(chatProduct)
      }
    }

    window.addEventListener('openProductModal', handleOpenProductModal)
    return () => {
      window.removeEventListener('openProductModal', handleOpenProductModal)
    }
  }, [products])

  // Animación escalonada
  useEffect(() => {
    if (products.length > 0) {
      setVisibleProducts(new Set())
      const timer = setTimeout(() => {
        const filteredProducts = getFilteredProducts()
        filteredProducts.forEach((_, index) => {
          setTimeout(() => {
            setVisibleProducts((prev) => new Set([...prev, index]))
          }, index * 50)
        })
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [products, activeTab])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError("")

      const categoryParam = activeTab !== "all" ? `&category=${activeTab}` : ""
      const response = await fetch(`${API_BASE_URL}/get_products.php?${categoryParam}`)
      const data: ApiResponse = await response.json()

      if (data.success) {
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

  const getFilteredProducts = () => {
    switch (activeTab) {
      case "hot-sauce":
        return products.filter(
          (product) =>
            product.category === "hot-sauce" || (!product.category && product.name.toLowerCase().includes("hot sauce")),
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

  const renderHeatLevel = (level: number, size: "sm" | "lg" = "sm") => {
    const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4"
    return Array.from({ length: 5 }, (_, i) => (
      <Flame
        key={i}
        className={`${iconSize} transition-colors duration-300 ${
          i < level ? "text-red-500 fill-red-500" : "text-gray-300"
        }`}
      />
    ))
  }

  const renderStars = (rating: number, size: "sm" | "lg" = "sm") => {
    const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4"
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${iconSize} transition-all duration-300 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ))
  }

  const updateQty = (id: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 1
      const next = Math.min(10, Math.max(1, current + delta))
      return { ...prev, [id]: next }
    })
  }

  const getQty = (id: number) => quantities[id] ?? 1

  // Funciones del carrito - EXACTAMENTE COMO ESTABAN
  const addToCartHandler = (product: any) => {
    const cartItem: CartItem = {
      id: product.id!,
      name: product.name,
      price: product.price,
      image: product.image_url || "/placeholder.svg",
      description: product.description,
      heatLevel: product.heatLevel,
      rating: product.rating,
      badge: product.badge,
      origin: product.origin,
      quantity: 1,
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === cartItem.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === cartItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevCart, cartItem]
    })
  }

  const removeFromCartHandler = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
      }
      return prevCart.filter((item) => item.id !== productId)
    })

    // Actualizar contador del carrito
    setCartCount((prev) => Math.max(0, prev - 1))
  }

  const clearCartHandler = () => {
    setCart([])
    setCartCount(0)
  }

  const goToCheckoutHandler = () => {
    setIsCartOpen(false)
    setCurrentView("checkout")
  }

  const handleOrderComplete = () => {
    setCurrentView("success")
    clearCartHandler()
  }

  const handleBackToProducts = () => {
    setCurrentView("products")
  }

  const handlePurchase = (product: Product, event?: React.MouseEvent) => {
    // Obtener la posición del elemento que se está animando
    const target = event?.currentTarget as HTMLElement
    const rect = target?.getBoundingClientRect()
    const cartRect = cartRef.current?.getBoundingClientRect()

    // Crear elemento de animación mejorado
    if (rect && cartRect) {
      const flyingElement = document.createElement("div")
      flyingElement.className = "flying-product-enhanced"
      flyingElement.innerHTML = `
      <div style="
        position: relative;
        width: 80px; 
        height: 80px; 
        background: linear-gradient(135deg, #ef4444, #f97316);
        border-radius: 16px;
        padding: 8px;
        box-shadow: 0 20px 40px rgba(239, 68, 68, 0.4);
        border: 3px solid white;
      ">
        <img src="${product.image_url || "/placeholder.svg"}" alt="${product.name}" 
             style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" />
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #7c2d12;
          font-size: 12px;
          font-weight: 900;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.5);
        ">+1</div>
        <div style="
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          border-radius: 16px;
          animation: shimmer 1s ease-in-out;
        "></div>
      </div>
    `

      // Posicionar el elemento
      flyingElement.style.position = "fixed"
      flyingElement.style.left = `${rect.left + rect.width / 2 - 40}px`
      flyingElement.style.top = `${rect.top + rect.height / 2 - 40}px`
      flyingElement.style.zIndex = "10000"
      flyingElement.style.pointerEvents = "none"
      flyingElement.style.transition = "all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"

      document.body.appendChild(flyingElement)

      // Crear efecto de trail/estela
      const trail = document.createElement("div")
      trail.className = "flying-trail"
      trail.style.position = "fixed"
      trail.style.left = `${rect.left + rect.width / 2 - 2}px`
      trail.style.top = `${rect.top + rect.height / 2 - 2}px`
      trail.style.width = "4px"
      trail.style.height = "4px"
      trail.style.background = "linear-gradient(45deg, #ef4444, #f97316)"
      trail.style.borderRadius = "50%"
      trail.style.zIndex = "9999"
      trail.style.boxShadow = "0 0 20px #ef4444"
      trail.style.transition = "all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"

      document.body.appendChild(trail)

      // Animar hacia el carrito con efecto más dramático
      setTimeout(() => {
        flyingElement.style.left = `${cartRect.left + cartRect.width / 2 - 40}px`
        flyingElement.style.top = `${cartRect.top + cartRect.height / 2 - 40}px`
        flyingElement.style.transform = "scale(0.2) rotate(360deg)"
        flyingElement.style.opacity = "0"

        trail.style.left = `${cartRect.left + cartRect.width / 2 - 2}px`
        trail.style.top = `${cartRect.top + cartRect.height / 2 - 2}px`
        trail.style.transform = "scale(3)"
        trail.style.opacity = "0"
      }, 100)

      // Limpiar después de la animación
      setTimeout(() => {
        if (document.body.contains(flyingElement)) {
          document.body.removeChild(flyingElement)
        }
        if (document.body.contains(trail)) {
          document.body.removeChild(trail)
        }
      }, 1300)
    }

    // Resto de la función permanece igual...
    setAnimatingProducts((prev) => new Set([...prev, product.id!]))

    setTimeout(() => {
      onAddToCart(product, getQty(product.id!))
      onMarkAsPurchased(product.id!)
      addToCartHandler(product)
      setCartCount((prev) => prev + getQty(product.id!))
      setCartBounce(true)
      setTimeout(() => setCartBounce(false), 600)
      setAddedItems((prev) => new Set([...prev, product.id!]))
      setAnimatingProducts((prev) => {
        const newSet = new Set(prev)
        newSet.delete(product.id!)
        return newSet
      })

      setTimeout(() => {
        setAddedItems((prev) => {
          const newSet = new Set(prev)
          newSet.delete(product.id!)
          return newSet
        })
      }, 2000)
    }, 200)
  }

  // Componente del carrito flotante - EXACTAMENTE IGUAL
  const FloatingCart = () => (
    <div
      ref={cartRef}
      onClick={() => setIsCartOpen(true)}
      className={`fixed top-4 right-8 z-50 group cursor-pointer transition-all duration-500 ${
        cartBounce ? "animate-cart-bounce" : ""
      }`}
    >
      {/* Glow effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300 scale-110"></div>

      {/* Main cart button */}
      <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-orange-600 rounded-xl p-3 shadow-xl border border-red-400/30 group-hover:scale-105 transition-all duration-300">
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>

        {/* Cart icon with pulse effect */}
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-white drop-shadow-lg" />

          {/* Animated pulse ring when items are added */}
          {cartCount > 0 && <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping"></div>}

          {/* Count badge */}
          {cartCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-red-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-black shadow-lg border-2 border-white animate-pulse">
              {cartCount > 99 ? "99+" : cartCount}
            </div>
          )}
        </div>

        {/* Floating particles effect */}
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-bounce opacity-80"></div>
        <div
          className="absolute -bottom-0.5 -left-0.5 w-1 h-1 bg-orange-300 rounded-full animate-bounce opacity-60"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Tooltip */}
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap backdrop-blur-sm">
        {cartCount > 0 ? `${cartCount} Artikel im Warenkorb` : "Warenkorb öffnen"}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
      </div>
    </div>
  )

  // Componente del modal de información detallada
  const ProductDetailModal = ({ product }: { product: Product }) => (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-gray-900 bg-white">{product.name}</DialogTitle>
      </DialogHeader>

      <div className="grid md:grid-cols-2 gap-6 bg-white text-gray-900 p-4 rounded-lg">
        {/* Imagen grande */}
        <div className="relative">
          <img
            src={product.image_url || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=300&width=300"
            }}
          />
          <Badge
            className={`absolute top-3 left-3 text-sm px-3 py-1 font-medium shadow-lg ${
              product.category === "bbq-sauce" ? "bg-amber-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {product.badge}
          </Badge>
        </div>

        {/* Información detallada */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Herkunft: {product.origin}</span>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Beschreibung</h4>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Bewertung</h4>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(product.rating, "lg")}</div>
                <span className="font-medium text-gray-700">{product.rating}/5</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Schärfegrad</h4>
              <div className="flex items-center gap-1">
                <div className="flex">{renderHeatLevel(product.heatLevel, "lg")}</div>
                <span className="text-sm text-gray-600 ml-2">{product.heatLevel}/5</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {(product.price * getQty(product.id!)).toFixed(2)} CHF
              </div>
              <div className="text-sm text-gray-500">Einzelpreis: {product.price.toFixed(2)} CHF</div>
            </div>

            {/* Controles de cantidad */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQty(product.id!, -1)}
                className="px-3 py-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="px-4 py-2 font-semibold text-lg text-gray-900">{getQty(product.id!)}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQty(product.id!, 1)}
                className="px-3 py-2 bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Botón de compra */}
            <Button
              onClick={(e) => handlePurchase(product, e)}
              disabled={purchasedItems.has(product.id!)}
              className={`w-full font-semibold py-3 rounded-lg transition-all duration-500 shadow-md hover:shadow-lg ${
                purchasedItems.has(product.id!) || addedItems.has(product.id!)
                  ? "bg-green-600 hover:bg-green-700"
                  : product.category === "bbq-sauce"
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-pink-600"
              } disabled:opacity-50 disabled:cursor-not-allowed text-white`}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {purchasedItems.has(product.id!) || addedItems.has(product.id!) ? "Gekauft" : "In den Warenkorb"}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  )

  // MEJORADO: Tarjeta de producto con mejor diseño para pantallas grandes
  const renderEnhancedProductCard = (product: Product, index: number) => {
    return (
      <Card
        key={product.id}
        className={`group relative bg-white border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-500 rounded-xl overflow-hidden ${
          visibleProducts.has(index) ? "animate-slide-in opacity-100" : "opacity-0 translate-y-4"
        } ${addedItems.has(product.id!) ? "animate-success-glow" : ""} ${
          animatingProducts.has(product.id!) ? "animate-compress" : ""
        }`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <CardContent className="p-4 lg:p-6">
          {/* MEJORADO: Layout que cambia según el tamaño de pantalla */}
          <div className="flex gap-4 lg:gap-6">
            {/* MEJORADO: Imagen más grande en pantallas grandes */}
            <div className="relative w-20 h-20 lg:w-32 lg:h-32 flex-shrink-0">
              <img
                src={product.image_url || "/placeholder.svg?height=128&width=128"}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500 shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=128&width=128"
                }}
              />
              
              <Badge
                className={`absolute -top-1 -right-1 lg:-top-2 lg:-right-2 text-xs px-1.5 py-0.5 lg:px-2 lg:py-1 font-medium shadow-sm ${
                  product.category === "bbq-sauce" ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {product.badge}
              </Badge>
            </div>

            {/* MEJORADO: Contenido principal con mejor espaciado */}
            <div className="flex-1 min-w-0">
                   <h4 className="text-lg lg:text-xl xl:text-2xl font-bold text-red-800 line-clamp-1 lg:line-clamp-2 group-hover:text-red-600 transition-colors duration-300 flex-1 mr-2">
                  {product.name}
                </h4>
              {/* MEJORADO: Header con título y precio mejor distribuidos */}
              <div className="flex items-start justify-between mb-2 lg:mb-3">
           
                <div className="text-lg lg:text-xl xl:text-1xl font-bold text-gray-600 flex-shrink-0">{product.price.toFixed(2)} CHF</div>
              </div>

              {/* MEJORADO: Descripción visible en pantallas grandes */}
              <p className="hidden lg:block text-gray-600 text-sm xl:text-base mb-3 xl:mb-4 line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              {/* MEJORADO: Rating y origen con mejor espaciado */}
              <div className="flex items-center justify-between mb-3 lg:mb-4 text-sm">
                <div className="flex items-center gap-1 lg:gap-2">
                  <div className="flex">{renderStars(product.rating)}</div>
                  <span className="text-gray-600 ml-1 font-medium">{product.rating}</span>
                  {/* MEJORADO: Heat level visible en pantallas grandes */}
                  <div className="hidden lg:flex items-center gap-1 ml-3">
                    <div className="flex">{renderHeatLevel(product.heatLevel)}</div>
                    <span className="text-gray-600 ml-1 text-xs">{product.heatLevel}/5</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="font-medium text-xs lg:text-sm">{product.origin}</span>
                </div>
              </div>

              {/* MEJORADO: Botones con ancho apropiado y mejor diseño */}
              <div className="flex items-center gap-2 lg:gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-auto min-w-[100px] lg:min-w-[120px] text-sm bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900 font-medium"
                      onClick={() => setSelectedProduct(product)}
                      data-product-modal={product.id}
                    >
                      <Info className="w-4 h-4 mr-1" />
                      Mehr Info
                    </Button>
                  </DialogTrigger>
                  {selectedProduct && <ProductDetailModal product={selectedProduct} />}
                </Dialog>

                <Button
                  onClick={(e) => handlePurchase(product, e)}
                  disabled={purchasedItems.has(product.id!) || animatingProducts.has(product.id!)}
                  size="sm"
                  className={`w-auto min-w-[120px] lg:min-w-[150px] font-semibold transition-all duration-500 shadow-md hover:shadow-lg ${
                    purchasedItems.has(product.id!) || addedItems.has(product.id!)
                      ? "bg-green-600 hover:bg-green-700"
                      : product.category === "bbq-sauce"
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-pink-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed text-white`}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  {purchasedItems.has(product.id!) || addedItems.has(product.id!)
                    ? "✓ Gekauft"
                    : animatingProducts.has(product.id!)
                      ? "Wird hinzugefügt..."
                      : "Kaufen"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Página de éxito - EXACTAMENTE IGUAL
  const SuccessPage = () => (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bestellung erfolgreich!</h1>
        <p className="text-gray-600 mb-6">Vielen Dank für Ihre Bestellung. Sie erhalten eine Bestätigungs-E-Mail.</p>
        <Button onClick={handleBackToProducts} className="bg-red-500 hover:bg-red-600 text-white">
          Weiter einkaufen
        </Button>
      </div>
    </div>
  )

  // NAVEGACIÓN EXACTAMENTE IGUAL - NO CAMBIADA
  if (currentView === "checkout") {
    return <CheckoutPage cart={cart} onBackToStore={handleBackToProducts} onClearCart={clearCartHandler} />
  }

  if (currentView === "success") {
    return <SuccessPage />
  }

  if (loading) {
    return (
      <section className="py-12 px-4 bg-white min-h-screen">
        <div className="max-w-4xl lg:max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Produkte werden geladen...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 px-4 bg-white min-h-screen">
        <div className="max-w-4xl lg:max-w-7xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Fehler beim Laden der Produkte</p>
            <p className="text-sm">{error}</p>
            <Button onClick={loadProducts} className="mt-4" variant="outline">
              Erneut versuchen
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const filteredProducts = getFilteredProducts()

  return (
    <>
      <FloatingCart />
      <ShoppingCartComponent
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cart={cart}
        onAddToCart={addToCartHandler}
        onRemoveFromCart={removeFromCartHandler}
        onGoToCheckout={goToCheckoutHandler}
        onClearCart={clearCartHandler}
      />
      <section className="py-12 px-4 bg-white min-h-screen">
        {/* MEJORADO: Container más ancho para pantallas grandes */}
        <div className="max-w-4xl lg:max-w-7xl mx-auto">
          {/* MEJORADO: Header con mejor tipografía */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-sm font-medium mb-4 lg:mb-6">
              <Award className="w-4 h-4" />
              Premium Kollektion
            </div>
            <h3 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-3 lg:mb-4">
              SMOKEHOUSE
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
                SAUCES
              </span>
            </h3>
            <p className="text-gray-600 lg:text-lg xl:text-xl max-w-xl lg:max-w-2xl mx-auto">Premium Saucen für wahre Kenner ausgewählt</p>
          </div>

          {/* MEJORADO: Tabs con mejor diseño */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8 lg:mb-10">
            <TabsList className="grid w-full max-w-md lg:max-w-lg mx-auto grid-cols-3 bg-white shadow-lg lg:shadow-xl rounded-xl lg:rounded-2xl p-1 lg:p-2 lg:h-14">
              <TabsTrigger
                value="all"
                className="rounded-lg lg:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-semibold lg:font-bold transition-all duration-300 text-sm lg:text-base lg:h-10"
              >
                Alle
              </TabsTrigger>
              <TabsTrigger
                value="hot-sauce"
                className="rounded-lg lg:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white font-semibold lg:font-bold transition-all duration-300 text-sm lg:text-base lg:h-10"
              >
                🌶️ Hot
              </TabsTrigger>
              <TabsTrigger
                value="bbq-sauce"
                className="rounded-lg lg:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white font-semibold lg:font-bold transition-all duration-300 text-sm lg:text-base lg:h-10"
              >
                🔥 BBQ
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6 lg:mt-8">
              <div className="text-center mb-6 lg:mb-8">
                <p className="text-gray-600 text-sm lg:text-lg">
                  {filteredProducts.length} {filteredProducts.length === 1 ? "Produkt" : "Produkte"} verfügbar
                </p>
              </div>

              {/* MEJORADO: Grid con mejor espaciado pero manteniendo 2 columnas en tablet */}
              <div className="grid gap-4 lg:gap-6 xl:gap-8 md:grid-cols-2">
                {filteredProducts.map((product, index) => renderEnhancedProductCard(product, index))}
              </div>

              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-12 lg:py-16">
                  <p className="text-gray-500 lg:text-lg mb-6">Keine Produkte in dieser Kategorie gefunden</p>
                  <Button onClick={() => setActiveTab("all")} className="mt-4" variant="outline" size="lg">
                    Alle anzeigen
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* MEJORADO: CSS con mejor responsividad */}
        <style jsx>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes success-glow {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
            }
          }

          @keyframes compress {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(0.95);
            }
            100% {
              transform: scale(1);
            }
          }

          @keyframes cart-bounce {
            0%, 100% {
              transform: scale(1) rotate(0deg);
            }
            25% {
              transform: scale(1.1) rotate(-5deg);
            }
            50% {
              transform: scale(1.2) rotate(5deg);
            }
            75% {
              transform: scale(1.1) rotate(-2deg);
            }
          }

          @keyframes shimmer {
            0% {
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0;
            }
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out forwards;
          }
          
          .animate-slide-in {
            animation: slide-in 0.4s ease-out forwards;
          }
          
          .animate-success-glow {
            animation: success-glow 1s ease-in-out;
          }

          .animate-compress {
            animation: compress 0.3s ease-in-out;
          }

          .animate-cart-bounce {
            animation: cart-bounce 0.6s ease-in-out;
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

          .flying-product-enhanced {
            transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            filter: drop-shadow(0 10px 30px rgba(239, 68, 68, 0.5));
          }

          .flying-trail {
            transition: all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}</style>
      </section>
    </>
  )
}