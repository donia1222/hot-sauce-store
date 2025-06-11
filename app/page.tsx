"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CulinaryInspiration } from "@/components/culinary-inspiration"
import { SpecialOffers } from "@/components/special-offers"
import { ProductsGrid } from "@/components/products-grid"
import { PairingSuggestions } from "@/components/pairing-suggestions"
import { ShoppingCartComponent } from "@/components/shopping-cart"
import { CheckoutPage } from "@/components/checkout-page"

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

interface CartItem extends Product {
  quantity: number
}

export default function PremiumHotSauceStore() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [purchasedItems, setPurchasedItems] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState<"store" | "checkout">("store")

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item))
      }
      return [...prevCart, { ...product, quantity }]
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

  const goToCheckout = () => {
    setCurrentPage("checkout")
    setIsCartOpen(false)
  }

  const backToStore = () => {
    setCurrentPage("store")
    setCart([]) // Limpiar carrito después de completar pedido
  }

  if (currentPage === "checkout") {
    return <CheckoutPage cart={cart} onBackToStore={backToStore} />
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header cartItemsCount={getTotalItems()} onCartOpen={() => setIsCartOpen(true)} />

      <HeroSection />




      <SpecialOffers />

      <ProductsGrid onAddToCart={addToCart} purchasedItems={purchasedItems} onMarkAsPurchased={markAsPurchased} />
      <CulinaryInspiration />
      <PairingSuggestions />

      <ShoppingCartComponent
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cart={cart}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        onGoToCheckout={goToCheckout}
      />
    </div>
  )
}
