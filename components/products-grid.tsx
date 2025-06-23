"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Star, ShoppingCart, Minus, Plus, Sparkles, Gift, Package } from "lucide-react"

interface Product {
  id: number
  name: string
  price: number
  image: string
  description: string
  heatLevel: number
  rating: number
  badge: string
  origin: string
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

const products: Product[] = [
  {
    id: 1,
    name: "Big Red's Hot Sauce - Big Yella",
    price: 14.9,
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

const comboOffers: ComboOffer[] = [
  {
    id: "combo1",
    name: "🔥 Schärfe-Trio Klassik",
    description: "Big Yella + Heat Wave + Green Chili",
    originalPrice: 38.24,
    offerPrice: 29.9,
    discount: 22,
    products: ["Big Red's Big Yella", "Big Red's Heat Wave", "Big Red's Green Chili"],
    image: "/R-IND-SMOKEYHAB.png",
    heatLevel: 4,
    rating: 4.8,
    badge: "COMBO DEAL",
    origin: "3er-Pack",
  },
  {
    id: "combo2",
    name: "🌶️ Extreme Heat Pack",
    description: "Heat Wave + A La Diabla + Habanero",
    originalPrice: 43.5,
    offerPrice: 34.9,
    discount: 20,
    products: ["Big Red's Heat Wave", "A La Diabla", "Big Red's Habanero"],
    image: "/R-IND-GREENCHILI.png",
    heatLevel: 5,
    rating: 4.9,
    badge: "EXTREME",
    origin: "3er-Pack",
  },
  {
    id: "combo3",
    name: "🎁 Gourmet Selection",
    description: "Original + A La Diabla + Big Yella",
    originalPrice: 43.13,
    offerPrice: 33.9,
    discount: 21,
    products: ["Big Red's Original", "A La Diabla", "Big Red's Big Yella"],
    image: "/R-IND-BIGYELLA.png",
    heatLevel: 4,
    rating: 4.7,
    badge: "GOURMET",
    origin: "3er-Pack",
  },
]

interface ProductsGridProps {
  onAddToCart?: (product: Product, quantity: number) => void
  onAddComboToCart?: (offer: ComboOffer, quantity: number) => void
  purchasedItems?: Set<number>
  purchasedCombos?: Set<string>
  onMarkAsPurchased?: (productId: number) => void
  onMarkComboAsPurchased?: (comboId: string) => void
}

export default function ProductsGrid({
  onAddToCart = () => {},
  onAddComboToCart = () => {},
  purchasedItems = new Set(),
  purchasedCombos = new Set(),
  onMarkAsPurchased = () => {},
  onMarkComboAsPurchased = () => {},
}: ProductsGridProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [comboQuantities, setComboQuantities] = useState<Record<string, number>>({})
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null)

  const openImageModal = (src: string, alt: string) => {
    setSelectedImage({ src, alt })
  }

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
          i < Math.floor(rating) ? "text-yellow-300 drop-shadow-lg" : "text-gray-400"
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

  const updateComboQty = (id: string, delta: number) => {
    setComboQuantities((prev) => {
      const current = prev[id] ?? 1
      const next = Math.min(10, Math.max(1, current + delta))
      return { ...prev, [id]: next }
    })
  }

  const getQty = (id: number) => quantities[id] ?? 1
  const getComboQty = (id: string) => comboQuantities[id] ?? 1

  // Render individual product card
  const renderProductCard = (product: Product) => (
    <Card
      key={product.id}
      className="flex-shrink-0 w-80 relative bg-white bg-opacity-60 backdrop-blur-md border border-gray-200 rounded-3xl shadow-xl hover:shadow-2xl transform transition-transform duration-500 hover:-translate-y-2 snap-center"
    >
      <CardContent className="p-0 overflow-hidden rounded-t-3xl">
        <div
          className="cursor-pointer"
          onClick={() => openImageModal(product.image || "/placeholder.svg", product.name)}
        >
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-60 object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
        <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold px-3 py-1 rounded-full shadow-md">
          {product.badge}
        </Badge>
        <Badge className="absolute top-4 right-4 bg-white text-sm font-semibold text-gray-800 px-2 py-1 rounded-full">
          {product.origin}
        </Badge>
      </CardContent>
      <CardContent className="px-6 py-4">
        <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h4>
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex space-x-1">{renderHeatLevel(product.heatLevel)}</div>
            <span className="text-xs text-gray-500">Schärfe</span>
          </div>
          <div className="text-right">
            <div className="flex justify-end space-x-1">{renderStars(product.rating)}</div>
            <span className="text-xs text-gray-500">{product.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <Button size="icon" variant="ghost" onClick={() => updateQty(product.id, -1)} className="px-2">
              <Minus className="w-4 h-4" />
            </Button>
            <span className="px-3 font-medium">{getQty(product.id)}</span>
            <Button size="icon" variant="ghost" onClick={() => updateQty(product.id, 1)} className="px-2">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-2xl font-extrabold text-red-600">
            {(product.price * getQty(product.id)).toFixed(2)} CHF
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Button
          onClick={() => {
            onAddToCart(product, getQty(product.id))
            onMarkAsPurchased(product.id)
          }}
          disabled={purchasedItems.has(product.id)}
          className="w-full py-2 font-semibold rounded-full text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-pink-600 transition-colors duration-300 text-sm"
        >
          <ShoppingCart className="w-4 h-4 inline-block mr-2" />
          {purchasedItems.has(product.id) ? "✓ Hinzugefügt" : "In Warenkorb"}
        </Button>
      </CardFooter>
    </Card>
  )

  // Render combo offer card
  const renderComboCard = (offer: ComboOffer) => (
    <Card
      key={offer.id}
      className="flex-shrink-0 w-96 relative bg-gradient-to-br from-orange-50 to-red-50 border-2 border-red-300 rounded-3xl shadow-xl hover:shadow-2xl transform transition-transform duration-500 hover:-translate-y-2 overflow-hidden snap-center"
    >
      <CardContent className="p-0 overflow-hidden rounded-t-3xl relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/10 to-orange-500/10 z-10"></div>
        <div className="cursor-pointer" onClick={() => openImageModal(offer.image || "/placeholder.svg", offer.name)}>
          <img
            src={offer.image || "/placeholder.svg"}
            alt={offer.name}
            className="w-full h-56 object-cover hover:scale-105 transition-transform duration-700"
          />
        </div>
        <Badge className="absolute top-4 left-4 bg-red-600 text-white font-bold px-3 py-1 text-sm animate-pulse z-20">
          -{offer.discount}% SPAREN
        </Badge>
        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1 rounded-full z-20">
          {offer.badge}
        </Badge>
        <div className="absolute bottom-4 left-4 right-4 z-20">
          <Gift className="w-6 h-6 text-white mb-2 mx-auto animate-bounce" />
        </div>
      </CardContent>
      <CardContent className="px-6 py-4">
        <h4 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{offer.name}</h4>
        <p className="text-gray-700 text-sm mb-4 line-clamp-1">{offer.description}</p>

        {/* Products included */}
        <div className="space-y-1 mb-4">
          {offer.products.slice(0, 2).map((product, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-gray-700">
              <Package className="w-3 h-3 text-orange-500" />
              <span className="font-medium truncate">{product}</span>
            </div>
          ))}
          {offer.products.length > 2 && (
            <div className="text-xs text-gray-500">+{offer.products.length - 2} weitere...</div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex space-x-1">{renderHeatLevel(offer.heatLevel)}</div>
            <span className="text-xs text-gray-500">Ø Schärfe</span>
          </div>
          <div className="text-right">
            <div className="flex justify-end space-x-1">{renderStars(offer.rating)}</div>
            <span className="text-xs text-gray-500">{offer.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-green-600 font-bold text-center text-sm mb-3">
            Sie sparen {((offer.originalPrice - offer.offerPrice) * getComboQty(offer.id)).toFixed(2)} CHF!
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
            <Button size="icon" variant="ghost" onClick={() => updateComboQty(offer.id, -1)} className="px-2">
              <Minus className="w-4 h-4" />
            </Button>
            <span className="px-3 font-medium">{getComboQty(offer.id)}</span>
            <Button size="icon" variant="ghost" onClick={() => updateComboQty(offer.id, 1)} className="px-2">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-red-600">
                {(offer.offerPrice * getComboQty(offer.id)).toFixed(2)} CHF
              </span>
              <span className="text-sm text-gray-400 line-through">
                {(offer.originalPrice * getComboQty(offer.id)).toFixed(2)} CHF
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="px-6 pb-6 pt-0">
        <Button
          onClick={() => {
            onAddComboToCart(offer, getComboQty(offer.id))
            onMarkComboAsPurchased(offer.id)
          }}
          disabled={purchasedCombos.has(offer.id)}
          className="w-full py-2 font-semibold rounded-full text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-colors duration-300 text-sm"
        >
          <Gift className="w-4 h-4 inline-block mr-2" />
          {purchasedCombos.has(offer.id) ? "✓ Combo hinzugefügt" : "Combo sichern"}
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <section className="py-24 px-6 bg-gradient-to-br from-red-50/30 via-rose-50/20 to-pink-50/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Sparkles className="inline-block w-8 h-8 text-red-500 animate-bounce" />
          <h3 className="inline-block mx-4 text-4xl font-extrabold text-gray-900 drop-shadow-lg">
            Unsere Premium-Saucen & Angebote
          </h3>
          <p className="mt-4 text-lg text-gray-600">
            Handverlesene Hot Sauces mit modernem Flair und exklusive Combo-Angebote.
          </p>
        </div>

        {/* Special Offers Section */}
        <div className="mb-16">
 

          {/* SCROLL LATERAL DE OFERTAS ESPECIALES */}
          <div className="relative">
     
            {/* Scroll Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
      
            </div>
          </div>
        </div>

        {/* Individual Products Section */}
        <div>
          <div className="text-center mb-8">
            <h4 className="text-3xl font-bold text-gray-900">Einzelne Produkte</h4>
            <p className="mt-2 text-gray-600">Wählen Sie Ihre Lieblings-Hot-Sauce einzeln aus</p>
          </div>

          {/* SCROLL LATERAL DE PRODUCTOS INDIVIDUALES */}
          <div className="relative">
            <div className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 px-4 snap-x snap-mandatory">
              {products.map(renderProductCard)}
            </div>

            {/* Scroll Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
     
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
            >
              ✕
            </button>
            <img
              src={selectedImage.src || "/placeholder.svg"}
              alt={selectedImage.alt}
              className="w-full h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
              <h3 className="text-2xl font-bold text-white text-center">{selectedImage.alt}</h3>
            </div>
          </div>
        </div>
      )}

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
    </section>
  )
}
