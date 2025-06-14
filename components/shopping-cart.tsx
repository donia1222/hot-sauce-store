"use client"

import { ShoppingCart, Plus, Minus, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

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

interface ShoppingCartProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  onAddToCart: (product: Product) => void
  onRemoveFromCart: (productId: number) => void
  onGoToCheckout: () => void
}

export function ShoppingCartComponent({
  isOpen,
  onOpenChange,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onGoToCheckout,
}: ShoppingCartProps) {
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-900 border-orange-500/20">
        <SheetHeader>
          <SheetTitle className="text-orange-400 text-xl">Einkaufswagen</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Ihr Warenkorb ist leer</p>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg border border-orange-500/20"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-white line-clamp-2">{item.name}</h3>
                    <p className="text-orange-400 font-bold">{item.price.toFixed(2)} CHF</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-8 h-8 bg-red-600 hover:bg-red-700 border-red-500"
                      onClick={() => onRemoveFromCart(item.id)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center text-white font-bold">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-8 h-8 bg-green-600 hover:bg-green-700 border-green-500"
                      onClick={() => onAddToCart(item)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="border-t border-orange-500/20 pt-6">
                <div className="flex justify-between items-center text-xl font-bold mb-4">
                  <span className="text-white">Total:</span>
                  <span className="text-orange-400">{getTotalPrice().toFixed(2)} CHF</span>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={onGoToCheckout}
                    disabled={cart.length === 0}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 text-lg"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Zur Kasse gehen
                  </Button>
                  <p className="text-xs text-gray-400 text-center">Sichere Zahlung mit PayPal</p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
