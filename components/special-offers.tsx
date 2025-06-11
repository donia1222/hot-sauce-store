"use client"

import { Gift, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ComboOffer {
  id: string
  name: string
  description: string
  originalPrice: number
  offerPrice: number
  discount: number
  products: string[]
  image: string
}

const comboOffers: ComboOffer[] = [
  {
    id: "combo1",
    name: "Schärfe-Trio Klassik",
    description: "Big Yella + Heat Wave + Green Chili",
    originalPrice: 38.24,
    offerPrice: 29.9,
    discount: 22,
    products: ["Big Red's Big Yella", "Big Red's Heat Wave", "Big Red's Green Chili"],
    image: "/R-IND-SMOKEYHAB.png",
  },
  {
    id: "combo2",
    name: "Extreme Heat Pack",
    description: "Heat Wave + A La Diabla + Habanero",
    originalPrice: 43.5,
    offerPrice: 34.9,
    discount: 20,
    products: ["Big Red's Heat Wave", "A La Diabla", "Big Red's Habanero"],
    image: "/R-IND-GREENCHILI.png",
  },
  {
    id: "combo3",
    name: "Gourmet Selection",
    description: "Original + A La Diabla + Big Yella",
    originalPrice: 43.13,
    offerPrice: 33.9,
    discount: 21,
    products: ["Big Red's Original", "A La Diabla", "Big Red's Big Yella"],
    image: "/R-IND-BIGYELLA.png",
  },
]

export function SpecialOffers() {
  return (
    <section id="offers" className="py-20 bg-gradient-to-r from-red-80 to-orange-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Gift className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-4">🔥 Spezial Angebote 🔥</h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sparen Sie mit unseren exklusiven 3er-Paketen - Perfekt zum Probieren verschiedener Schärfegrade!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {comboOffers.map((offer) => (
            <Card
              key={offer.id}
              className="bg-white border-2 border-red-200 hover:border-red-400 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <CardHeader className="text-center">
                <div className="relative">
                  <Badge className="absolute -top-2 -right-2 bg-red-600 text-white font-bold px-3 py-1 text-sm animate-pulse">
                    -{offer.discount}%
                  </Badge>
                  <img
                    src={offer.image || "/placeholder.svg"}
                    alt={offer.name}
                    className="w-full h-80 object-cover rounded-lg mb-4"
                  />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{offer.name}</CardTitle>
                <p className="text-gray-600 text-sm font-medium">{offer.description}</p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="flex justify-center items-center space-x-2 mb-2">
                    <span className="text-3xl font-bold text-red-600">{offer.offerPrice.toFixed(2)} CHF</span>
                    <span className="text-lg text-gray-400 line-through">{offer.originalPrice.toFixed(2)} CHF</span>
                  </div>
                  <p className="text-green-600 font-bold text-lg">
                    Sie sparen {(offer.originalPrice - offer.offerPrice).toFixed(2)} CHF!
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  {offer.products.map((product, index) => (
                    <div key={index} className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                      <Package className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">{product}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold py-3 text-lg">
                  <Gift className="w-5 h-5 mr-2" />
                  Angebot sichern
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
