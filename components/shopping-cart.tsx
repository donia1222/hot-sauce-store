"use client"

import { ShoppingCart, Plus, Minus, Shield, X } from "lucide-react"
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
  onClearCart: () => void
}

export function ShoppingCartComponent({
  isOpen,
  onOpenChange,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onGoToCheckout,
  onClearCart,
}: ShoppingCartProps) {
  const MINIMUM_ORDER_AMOUNT = 50

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const isMinimumOrderMet = () => {
    return getTotalPrice() >= MINIMUM_ORDER_AMOUNT
  }

  const getRemainingAmount = () => {
    return Math.max(0, MINIMUM_ORDER_AMOUNT - getTotalPrice())
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-900 border-orange-500/20">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-orange-400 text-xl">Einkaufswagen</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-white hover:bg-gray-800 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
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

                {/* Minimum order warning */}
                {!isMinimumOrderMet() && cart.length > 0 && (
                  <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-3 mb-4">
                    <p className="text-yellow-300 text-sm text-center font-semibold">
                      ⚠️ Mindestbestellwert: {MINIMUM_ORDER_AMOUNT} CHF
                    </p>
                    <p className="text-yellow-200 text-xs text-center mt-1">
                      Noch {getRemainingAmount().toFixed(2)} CHF bis zum kostenlosen Versand
                    </p>
                  </div>
                )}

                {/* Free shipping confirmation */}
                {isMinimumOrderMet() && cart.length > 0 && (
                  <div className="bg-green-900/50 border border-green-600 rounded-lg p-3 mb-4">
                    <p className="text-green-300 text-sm text-center font-semibold">
                      ✅ Kostenloser Versand aktiviert!
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={onGoToCheckout}
                    disabled={cart.length === 0 || !isMinimumOrderMet()}
                    className={`w-full font-bold py-3 text-lg ${
                      isMinimumOrderMet()
                        ? "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                        : "bg-gray-600 text-gray-300 cursor-not-allowed hover:bg-gray-600"
                    }`}
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    {isMinimumOrderMet() ? "Zur Kasse gehen" : `Mindestens ${MINIMUM_ORDER_AMOUNT} CHF erforderlich`}
                  </Button>

                  {/* Clear cart button */}
                  <Button
                    onClick={onClearCart}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    🗑️ Warenkorb leeren
                  </Button>

                  <p className="text-xs text-gray-400 text-center">
                    {isMinimumOrderMet()
                      ? "✅ Kostenloser Versand • Sichere Zahlung mit PayPal"
                      : `Kostenloser Versand ab ${MINIMUM_ORDER_AMOUNT} CHF • Sichere Zahlung mit PayPal`}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
