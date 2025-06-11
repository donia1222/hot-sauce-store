"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Minus, Star, Flame, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

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

const products: Product[] = [
  {
    id: 1,
    name: "Big Red's Hot Sauce - Big Yella",
    price: 14.16,
    image: "/images/big-yella.webp",
    description: "Goldgelbe Schärfe mit sonnigem Geschmack und intensivem Kick",
    heatLevel: 4,
    rating: 4.8,
    badge: "Sonnig",
    origin: "USA",
  },
  {
    id: 2,
    name: "Big Red's Hot Sauce - Heat Wave",
    price: 12.84,
    image: "/images/heat-wave.webp",
    description: "Eine Hitzewelle aus roten Chilis für wahre Schärfe-Liebhaber",
    heatLevel: 5,
    rating: 4.9,
    badge: "Hitzewelle",
    origin: "Premium",
  },
  {
    id: 3,
    name: "Big Red's Hot Sauce - Green Chili",
    price: 11.24,
    image: "/images/green-chili.webp",
    description: "Frische grüne Chilis mit authentischem mexikanischem Geschmack",
    heatLevel: 3,
    rating: 4.7,
    badge: "Frisch",
    origin: "Mexiko",
  },
  {
    id: 4,
    name: "Big Red's Hot Sauce - Original Sauce",
    price: 13.24,
    image: "/images/original-sauce.webp",
    description: "Die legendäre Originalrezept seit Generationen unverändert",
    heatLevel: 4,
    rating: 4.6,
    badge: "Klassiker",
    origin: "Original",
  },
  {
    id: 5,
    name: "A La Diabla Hot Sauce",
    price: 15.73,
    image: "/images/a-la-diabla.webp",
    description: "Teuflisch scharfe Familienrezeptur mit reichem, würzigem Geschmack",
    heatLevel: 5,
    rating: 4.9,
    badge: "Teuflisch",
    origin: "Familienrezept",
  },
  {
    id: 6,
    name: "Big Red's Hot Sauce - Habanero",
    price: 14.93,
    image: "/images/habanero.webp",
    description: "Authentische Habanero-Chilis für den ultimativen Schärfe-Genuss",
    heatLevel: 5,
    rating: 4.8,
    badge: "Habanero",
    origin: "Karibik",
  },
]


interface ProductsGridProps {
  onAddToCart: (product: Product, quantity: number) => void
  purchasedItems: Set<number>
  onMarkAsPurchased: (productId: number) => void
}

export function ProductsGrid({ onAddToCart, purchasedItems, onMarkAsPurchased }: ProductsGridProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const renderHeatLevel = (level: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Flame
        key={i}
        className={`w-5 h-5 transition-transform transform-gpu duration-300 ${
          i < level ? "text-red-500 animate-pulse" : "text-gray-500"
        } hover:scale-110`}
      />
    ))

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 transition-colors duration-300 ${
          i < Math.floor(rating)
            ? "text-yellow-300 drop-shadow-lg"
            : "text-gray-400"
        }`}
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

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Sparkles className="inline-block w-8 h-8 text-red-500 animate-bounce" />
          <h3 className="inline-block mx-4 text-5xl font-extrabold text-gray-900 drop-shadow-lg">
            Unsere Premium-Saucen
          </h3>
          <Sparkles className="inline-block w-8 h-8 text-red-500 animate-bounce" />
          <p className="mt-4 text-lg text-gray-600">
            Handverlesene Hot Sauces mit modernem Flair und einzigartigen Aromen.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="relative bg-white bg-opacity-60 backdrop-blur-md border border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transform transition-transform duration-500 hover:-translate-y-2"
            >
              <CardContent className="p-0 overflow-hidden rounded-t-3xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                />
                <Badge
                  className="absolute top-4 left-4 bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold px-3 py-1 rounded-full shadow-md"
                >
                  {product.badge}
                </Badge>
                <Badge
                  className="absolute top-4 right-4 bg-white text-sm font-semibold text-gray-800 px-2 py-1 rounded-full"
                >
                  {product.origin}
                </Badge>
              </CardContent>
              <CardContent className="px-6 py-4">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h4>
                <p className="text-gray-700 text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="flex space-x-1">{renderHeatLevel(product.heatLevel)}</div>
                    <span className="text-xs text-gray-500">Schärfe-Level</span>
                  </div>
                  <div className="text-right">
                    <div className="flex justify-end space-x-1">{renderStars(product.rating)}</div>
                    <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-red-600 mb-4">
                  {(product.price * getQty(product.id)).toFixed(2)} CHF
                </div>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden w-max">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateQty(product.id, -1)}
                    className="px-3"
                  >
                    <Minus />
                  </Button>
                  <span className="px-4 font-medium">{getQty(product.id)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => updateQty(product.id, 1)}
                    className="px-3"
                  >
                    <Plus />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="px-6 pb-6 pt-0">
                <Button
                  onClick={() => {
                    onAddToCart(product, getQty(product.id))
                    onMarkAsPurchased(product.id)
                  }}
                  disabled={purchasedItems.has(product.id)}
                  className="w-full py-3 font-semibold rounded-full text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-pink-600 transition-colors duration-300"
                >
                  <ShoppingCart className="w-5 h-5 inline-block mr-2" />
                  {purchasedItems.has(product.id) ? "✓ Hinzugefügt" : "In den Warenkorb"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}