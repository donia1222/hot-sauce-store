"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Star, ShoppingCart, Minus, Plus } from "lucide-react"

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

const sauces = [
  {
    id: 1,
    name: "Honey Barbecue Sauce",
    flavor: "Süß & Rauchig",
    description: "Eine perfekte Mischung aus natürlichem Honig und rauchigen Gewürzen, die jeden Grillabend veredelt",
    image: "r1.png",
    color: "from-amber-600 to-orange-700",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50",
    price: 14.0,
    heatLevel: 3,
    rating: 4.9,
    badge: "Süß",
    origin: "USA",
  },
  {
    id: 2,
    name: "Oh My Garlic",
    flavor: "Intensiver Knoblauch",
    description: "Für Knoblauch-Liebhaber - eine Geschmacksexplosion, die Ihr Fleisch transformiert",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3d80ed726ed156b5aa0d206db2ccc3891007f6fe85080889f79989c913ede8f6.jpeg-ctV8YfEMX1U7QwZsSCG2gq5sDsdpjm.webp",
    color: "from-stone-600 to-amber-700",
    bgColor: "bg-gradient-to-br from-stone-50 to-amber-50",
    price: 14.0,
    heatLevel: 4,
    rating: 4.8,
    badge: "Intensiv",
    origin: "Premium",
  },
  {
    id: 3,
    name: "Carolina-Style BBQ",
    flavor: "Carolina-Stil",
    description: "Traditionelles Südstaaten-Rezept, international preisgekrönt",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/568a4add4d961a12a4f870c513148755a0c890f1d400808d3120ed9af4181343.jpeg-bJCgIXnACGcryBfMqQehBQRlSpgVaY.webp",
    color: "from-yellow-600 to-amber-700",
    bgColor: "bg-gradient-to-br from-yellow-50 to-amber-50",
    price: 14.0,
    heatLevel: 4,
    rating: 4.9,
    badge: "Preisgekrönt",
    origin: "Carolina",
  },
  {
    id: 4,
    name: "Coffee BBQ Sauce",
    flavor: "Kaffee & Gewürze",
    description: "Eine einzigartige Kombination aus geröstetem Kaffee und geheimen Gewürzen für anspruchsvolle Gaumen",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1565863979.jpg-Pk5yoHlY9ut3Ps8lH35MjtSdGW5BLj.webp",
    color: "from-amber-800 to-stone-800",
    bgColor: "bg-gradient-to-br from-amber-50 to-stone-50",
    price: 14.0,
    heatLevel: 3,
    rating: 4.7,
    badge: "Gourmet",
    origin: "Handwerk",
  },
  {
    id: 5,
    name: "Chipotle Barbecue",
    flavor: "Scharf Geräuchert",
    description: "Das perfekte Gleichgewicht zwischen Chipotle-Schärfe und traditionellem Rauchgeschmack",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/980ba511dce874ec5ab60f463bdc4ac626cab1821f77078ed9b73987781ae67d.jpeg-9cnZkwXheoa7FZe6WZry5dIHGRvT8r.webp",
    color: "from-red-700 to-amber-800",
    bgColor: "bg-gradient-to-br from-red-50 to-amber-50",
    price: 14.0,
    heatLevel: 5,
    rating: 4.8,
    badge: "Scharf",
    origin: "Mexiko",
  },
  {
    id: 6,
    name: "Pineapple Papaya BBQ",
    flavor: "Tropisch Fruchtig",
    description: "Tropische Aromen, die Ihre Sinne in ein kulinarisches Paradies entführen",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/b8325b8eededbf657bc081b327a9ae37a0bcb2b7ebaba3df7ab289126870b663.jpeg-As6qPfHwjfrENZLqRkPALbZGY0Cnr0.webp",
    color: "from-orange-600 to-amber-700",
    bgColor: "bg-gradient-to-br from-orange-50 to-amber-50",
    price: 14.0,
    heatLevel: 2,
    rating: 4.6,
    badge: "Tropisch",
    origin: "Karibik",
  },
]

interface PremiumSaucesProps {
  onAddToCart?: (product: Product, quantity: number) => void
  purchasedItems?: Set<number>
  onMarkAsPurchased?: (productId: number) => void
}

export function PremiumSaucesSlideshow({
  onAddToCart = () => {},
  purchasedItems = new Set(),
  onMarkAsPurchased = () => {},
}: PremiumSaucesProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const updateQty = (id: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 1
      const next = Math.min(10, Math.max(1, current + delta))
      return { ...prev, [id]: next }
    })
  }

  const getQty = (id: number) => quantities[id] ?? 1

  const renderHeatLevel = (level: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Flame
        key={i}
        className={`w-5 h-5 transition-transform transform-gpu duration-300 ${
          i < level ? "text-orange-600 animate-pulse" : "text-stone-400"
        } hover:scale-110`}
      />
    ))

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 transition-colors duration-300 ${
          i < Math.floor(rating) ? "text-amber-500 drop-shadow-lg" : "text-stone-300"
        }`}
      />
    ))

  return (
    <div className="min-h-screen transition-all duration-1000 bg-gradient-to-br from-red-50/30 via-rose-50/20 to-pink-50/30">
      {/* Header */}
      <div className="text-center pt-12 pb-8">
        <div className="mb-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-800 via-stone-700 to-amber-900 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            🔥 SMOKEHOUSE BBQ 🔥
          </h1>
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent flex-1 max-w-32"></div>
            <span className="text-2xl font-bold text-amber-800">PREMIUM SAUCEN</span>
            <div className="h-px bg-gradient-to-r from-transparent via-amber-600 to-transparent flex-1 max-w-32"></div>
          </div>
        </div>
        <p className="text-lg text-stone-700 max-w-2xl mx-auto px-4 font-medium">
          Authentische Grillsaucen aus der Räucherkammer - Handwerklich geräuchert & perfekt gewürzt
        </p>
        <div className="w-32 h-2 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 mx-auto mt-6 rounded-full transition-all duration-1000 shadow-lg"></div>
      </div>

      {/* GRID DE SALSAS PREMIUM */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-stone-800 mb-4">🍖 Unsere komplette BBQ-Kollektion</h3>
          <p className="text-lg text-stone-600">
            Entdecken Sie alle handwerklich geräucherten Saucen aus unserer Smokehouse
          </p>
        </div>

        {/* SCROLL LATERAL DE SALSAS PREMIUM */}
        <div className="relative">
          {/* Contenedor con scroll horizontal */}
          <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 px-4 snap-x snap-mandatory">
            {sauces.map((sauce) => (
              <div
                key={sauce.id}
                className="flex-shrink-0 w-80 bg-gradient-to-br from-white via-stone-50 to-amber-50 border-2 border-stone-200 rounded-3xl shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2 overflow-hidden snap-center"
              >
                {/* Image Section */}
                <div className="relative p-0 overflow-hidden rounded-t-3xl">
                  <img
                    src={sauce.image || "/placeholder.svg"}
                    alt={sauce.name}
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-600 to-orange-700 text-white font-bold px-3 py-1 rounded-full shadow-lg border border-amber-200">
                    {sauce.badge}
                  </Badge>
                  <Badge className="absolute top-4 right-4 bg-stone-100 text-stone-800 font-semibold px-2 py-1 rounded-full shadow-md text-sm border border-stone-300">
                    {sauce.origin}
                  </Badge>
                </div>

                {/* Content Section */}
                <div className="px-6 py-4">
                  <h4 className="text-xl font-bold text-stone-800 mb-2 line-clamp-1">{sauce.name}</h4>
                  <p
                    className={`text-base font-semibold bg-gradient-to-r ${sauce.color} bg-clip-text text-transparent mb-3`}
                  >
                    {sauce.flavor}
                  </p>
                  <p className="text-stone-600 text-sm mb-4 line-clamp-2">{sauce.description}</p>

                  {/* Heat Level & Rating */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="flex space-x-1 mb-1">{renderHeatLevel(sauce.heatLevel)}</div>
                      <span className="text-xs text-stone-500 font-medium">Schärfe</span>
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end space-x-1 mb-1">{renderStars(sauce.rating)}</div>
                      <span className="text-xs text-stone-500 font-medium">{sauce.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Quantity and Price in same row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center border-2 border-stone-300 rounded-lg overflow-hidden bg-white shadow-sm">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQty(sauce.id, -1)}
                        className="px-2 hover:bg-stone-100 text-stone-600"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="px-3 font-bold text-stone-700">{getQty(sauce.id)}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateQty(sauce.id, 1)}
                        className="px-2 hover:bg-stone-100 text-stone-600"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-2xl font-extrabold text-amber-700 drop-shadow-sm">
                      {(sauce.price * getQty(sauce.id)).toFixed(2)} CHF
                    </div>
                  </div>

                  {/* Footer with Button */}
                  <Button
                    onClick={() => {
                      const product: Product = {
                        id: sauce.id,
                        name: sauce.name,
                        price: sauce.price,
                        image: sauce.image,
                        description: sauce.description,
                        heatLevel: sauce.heatLevel,
                        rating: sauce.rating,
                        badge: sauce.badge,
                        origin: sauce.origin,
                      }
                      onAddToCart(product, getQty(sauce.id))
                      onMarkAsPurchased(sauce.id)
                    }}
                    disabled={purchasedItems.has(sauce.id)}
                    className="w-full py-2 font-bold rounded-full text-white bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500 shadow-lg text-sm"
                  >
                    <ShoppingCart className="w-4 h-4 inline-block mr-2" />
                    {purchasedItems.has(sauce.id) ? "✓ Hinzugefügt" : "In Warenkorb"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-amber-100 via-stone-100 to-orange-100 rounded-2xl p-8 border-2 border-amber-200 shadow-lg">
            <h4 className="text-2xl font-bold text-stone-800 mb-4">🔥 Finden Sie nicht Ihren BBQ-Favoriten?</h4>
            <p className="text-stone-600 mb-6">
              Entdecken Sie unsere komplette Smokehouse-Kollektion mit mehr Varianten und Grill-Spezialitäten
            </p>
            <Button
              onClick={() => {
                const offersSection = document.getElementById("offers")
                if (offersSection) {
                  offersSection.scrollIntoView({ behavior: "smooth" })
                }
              }}
              className="px-8 py-3 bg-gradient-to-r from-amber-700 to-orange-800 text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-amber-600 shadow-lg"
            >
              Mehr BBQ-Produkte entdecken
            </Button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
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
