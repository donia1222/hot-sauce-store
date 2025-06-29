"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CulinaryInspiration } from "@/components/culinary-inspiration"
import ProductsGridCombined from "@/components/products-grid"
import { PairingSuggestions } from "@/components/pairing-suggestions"
import { ShoppingCartComponent } from "@/components/shopping-cart"
import { CheckoutPage } from "@/components/checkout-page"
import { Footer } from "@/components/footer"
import { Admin } from "@/components/admin"
import  Bot  from "@/components/bot"
import { ConstructionNotice } from "./construction-notice" 

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  heatLevel: number
  rating: number
  badge?: string
  origin?: string
}

interface ComboOffer {
  id: string
  name: string
  description: string
  originalPrice: number
  offerPrice: number
  discount: number
  products: string[]
  image: string
  heatLevel: number
  rating: number
  badge: string
  origin: string
}

interface CartItem extends Product {
  quantity: number
  isCombo?: boolean
  comboId?: string
  originalPrice?: number
  discount?: number
}

export default function PremiumHotSauceStore() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [purchasedItems, setPurchasedItems] = useState<Set<number>>(new Set())
  const [purchasedCombos, setPurchasedCombos] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState<"store" | "checkout" | "admin">("store")

  // 💾 Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    // Verificar si el carrito debe ser limpiado después de un pago exitoso
    const shouldClearCart = localStorage.getItem('cart-should-be-cleared')
    if (shouldClearCart === 'true') {
      localStorage.removeItem('cart-should-be-cleared')
      localStorage.removeItem('cantina-cart')
      setCart([])
      return // No cargar carrito si debe ser limpiado
    }

    const savedCart = localStorage.getItem("cantina-cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }

    // 🎉 Verificar si hay un pago exitoso reciente
    const lastPayment = localStorage.getItem("last-payment")
    if (lastPayment) {
      try {
        const paymentInfo = JSON.parse(lastPayment)
        // Si el pago fue hace menos de 5 minutos, mostrar mensaje
        const paymentTime = new Date(paymentInfo.timestamp)
        const now = new Date()
        const diffMinutes = (now.getTime() - paymentTime.getTime()) / (1000 * 60)

        if (diffMinutes < 5 && paymentInfo.status === "completed") {
          // Mostrar notificación de pago exitoso
          setTimeout(() => {}, 1000)
        }
      } catch (error) {
        console.error("Error checking last payment:", error)
      }
    }
  }, [])


  // 🔄 Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cantina-cart", JSON.stringify(cart))
    }
  }, [cart])

  // 🧹 Verificar si el carrito debe ser limpiado (cuando se navega de vuelta desde success)
  useEffect(() => {
    const checkClearCart = () => {
      const shouldClearCart = localStorage.getItem('cart-should-be-cleared')
      if (shouldClearCart === 'true') {
        localStorage.removeItem('cart-should-be-cleared')
        setTimeout(() => {
          clearCart()
        }, 100) // Pequeño delay para evitar conflictos
      }
    }

    // Verificar cuando se carga la página y cuando se cambia el foco
    checkClearCart()
    window.addEventListener('focus', checkClearCart)
    
    return () => {
      window.removeEventListener('focus', checkClearCart)
    }
  }, [])

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id && !item.isCombo)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id && !item.isCombo ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prevCart, { ...product, quantity }]
    })
  }

  // Nueva función para añadir combos al carrito
  const addComboToCart = (offer: ComboOffer, quantity = 1) => {
    // Convertir combo a formato de producto para el carrito
    const comboAsProduct: CartItem = {
      id: Number.parseInt(offer.id.replace("combo", "")) + 1000, // ID único para combos
      name: offer.name,
      price: offer.offerPrice,
      image: offer.image,
      description: offer.description,
      heatLevel: offer.heatLevel,
      rating: offer.rating,
      badge: offer.badge,
      origin: offer.origin,
      quantity,
      isCombo: true,
      comboId: offer.id,
      originalPrice: offer.originalPrice,
      discount: offer.discount,
    }

    setCart((prevCart) => {
      const existingCombo = prevCart.find((item) => item.comboId === offer.id)
      if (existingCombo) {
        return prevCart.map((item) =>
          item.comboId === offer.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prevCart, comboAsProduct]
    })
  }

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
      }
      return prevCart.filter((item) => item.id !== productId)
    })
  }

  // 🗑️ Nueva función para limpiar el carrito completamente
  const clearCart = () => {
    setCart([])
    localStorage.removeItem("cantina-cart") // También limpiar localStorage
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const markAsPurchased = (productId: number) => {
    setPurchasedItems((prev) => new Set([...prev, productId]))
    setTimeout(() => {
      setPurchasedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }, 3000)
  }

  const markComboAsPurchased = (comboId: string) => {
    setPurchasedCombos((prev) => new Set([...prev, comboId]))
    setTimeout(() => {
      setPurchasedCombos((prev) => {
        const newSet = new Set(prev)
        newSet.delete(comboId)
        return newSet
      })
    }, 3000)
  }

  const goToCheckout = () => {
    setCurrentPage("checkout")
    setIsCartOpen(false)
  }

  const backToStore = () => {
    setCurrentPage("store")
    // No limpiar carrito aquí automáticamente - se limpia cuando el pago se confirma
  }

  // 🔐 Funciones para el admin
  const goToAdmin = () => {
    console.log("Navigating to admin panel...")
    setCurrentPage("admin")
    setIsCartOpen(false)
  }

  const backFromAdmin = () => {
    console.log("Returning from admin panel...")
    setCurrentPage("store")
  }

  // 📊 Renderizar página de admin
  if (currentPage === "admin") {
    return <Admin onClose={backFromAdmin} />
  }

  // 🛒 Renderizar página de checkout
  if (currentPage === "checkout") {
    return (
      <CheckoutPage
        cart={cart}
        onBackToStore={backToStore}
        onClearCart={clearCart} // Pasar función para limpiar carrito
      />
    )
  }

  // 🏪 Renderizar página principal del store
  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Construction Notice Modal */}
      <ConstructionNotice />

      <Header  onAdminOpen={goToAdmin} />
               <div id="Chat" className="w-full relative" data-aos="fade-up" data-aos-delay="1200">
            <Bot />
          </div>
      <HeroSection />



      <section id="offers">
  <ProductsGridCombined />
      </section>

      <CulinaryInspiration />
      <PairingSuggestions />

      <ShoppingCartComponent
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cart={cart}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onGoToCheckout={goToCheckout}
        onClearCart={clearCart} // Pasar función para limpiar carrito
      />

      <Footer />
    </div>
  )
}
