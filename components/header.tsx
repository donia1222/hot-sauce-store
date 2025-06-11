"use client"
import { ShoppingCart, Crown, Zap, MapPin, Home, Package, Gift, ChefHat, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeaderProps {
  cartItemsCount: number
  onCartOpen: () => void
}

export function Header({ cartItemsCount, onCartOpen }: HeaderProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const navItems = [
    { id: "hero", label: "Startseite", icon: Home },
    { id: "offers", label: "Angebote", icon: Gift },
    { id: "recipes", label: "Rezepte", icon: ChefHat },
    { id: "pairing", label: "Food Pairing", icon: Heart },
  ]

  return (
    <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-black/95 backdrop-blur-xl shadow-2xl sticky top-0 z-50 border-b border-orange-400/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-full shadow-lg">
                <Crown className="w-8 h-8 text-white" />
                <Zap className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent tracking-tight">
                FEUER KÖNIGREICH
              </h1>
           
      
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-orange-400/30"
                >
                  <Icon className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Mobile Navigation Toggle */}
          <div className="flex items-center space-x-3">
            <div className="lg:hidden">
  
            </div>

            {/* Cart Button */}
            <Button
              size="lg"
              className="relative bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={onCartOpen}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />

              {cartItemsCount > 0 && (
                <Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs px-2 py-1 rounded-full animate-bounce shadow-lg border-2 border-white">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Animated Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 opacity-60">
        <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
      </div>
    </header>
  )
}