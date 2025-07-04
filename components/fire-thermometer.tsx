"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Thermometer, Zap, TrendingUp } from "lucide-react"

interface Product {
  id?: number
  name: string
  description: string
  price: number
  image?: string
  image_url?: string
  heatLevel: number
  rating: number
  badge?: string
  origin?: string
  category?: string
  stock?: number
}

interface FireThermometerProps {
  onHeatLevelChange?: (level: number) => void
  onProductRecommend?: (products: Product[]) => void
  products?: Product[]
}

export default function FireThermometer({ 
  onHeatLevelChange = () => {}, 
  onProductRecommend = () => {},
  products = []
}: FireThermometerProps) {
  const [selectedHeat, setSelectedHeat] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [thermometerFill, setThermometerFill] = useState(20)

  // Heat level configurations
  const heatLevels = [
    { 
      level: 1, 
      name: "Mild", 
      emoji: "🌿", 
      color: "from-emerald-400 to-emerald-600",
      textColor: "text-emerald-100",
      bgColor: "bg-emerald-900/30",
      borderColor: "border-emerald-500/40",
      temp: "0-100 SHU",
      description: "Für Anfänger - Geschmack ohne die Schärfe"
    },
    { 
      level: 2, 
      name: "Medium", 
      emoji: "🌶️", 
      color: "from-yellow-400 to-orange-500",
      textColor: "text-orange-100", 
      bgColor: "bg-orange-900/30",
      borderColor: "border-orange-500/40",
      temp: "100-1K SHU",
      description: "Ein Hauch von Wärme - perfekt für die meisten"
    },
    { 
      level: 3, 
      name: "Scharf", 
      emoji: "🔥", 
      color: "from-orange-500 to-red-600",
      textColor: "text-red-100",
      bgColor: "bg-red-900/30",
      borderColor: "border-red-500/40", 
      temp: "1K-10K SHU",
      description: "Für Mutige - du fängst an zu schwitzen"
    },
    { 
      level: 4, 
      name: "Höllisch", 
      emoji: "🌋", 
      color: "from-red-600 to-red-800",
      textColor: "text-red-100",
      bgColor: "bg-red-900/40",
      borderColor: "border-red-600/50",
      temp: "10K-100K SHU", 
      description: "Nur für Experten - bereite dich auf das Feuer vor"
    },
    { 
      level: 5, 
      name: "Teuflisch", 
      emoji: "👹", 
      color: "from-red-800 to-purple-900",
      textColor: "text-purple-100",
      bgColor: "bg-purple-900/40",
      borderColor: "border-purple-600/50",
      temp: "100K+ SHU",
      description: "EXTREM - nur für die Mutigsten"
    }
  ]

  const currentLevel = heatLevels.find(h => h.level === selectedHeat) || heatLevels[0]

  const handleHeatLevelClick = (level: number) => {
    setSelectedHeat(level)
    setIsAnimating(true)
    
    // Call callbacks directly instead of useEffect
    onHeatLevelChange(level)
    const recommendedProducts = products.filter(p => p.heatLevel === level)
    onProductRecommend(recommendedProducts)
    
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(level * 50)
    }
    
    setTimeout(() => setIsAnimating(false), 600)
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black border-slate-700/50 shadow-2xl backdrop-blur-sm">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      <CardContent className="relative p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 backdrop-blur-md px-6 py-3 rounded-full border border-red-500/30 mb-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <Thermometer className="w-6 h-6 text-red-400 animate-pulse" />
            <span className="text-white font-bold text-base sm:text-lg bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Schärfe-Messer
            </span>
            <Flame className="w-6 h-6 text-orange-400 animate-pulse" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Wie viel Schärfe verträgst du?
          </h2>
          <p className="text-gray-400 text-base sm:text-lg px-2 sm:px-0 max-w-2xl mx-auto leading-relaxed">
            Entdecke dein perfektes Schärfe-Level und finde deine ideale Sauce
          </p>
        </div>

        {/* Heat Level Selection */}
        <div className="px-2 sm:px-0">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
              Wähle dein Schärfe-Level
            </h3>
            
            {/* Current Level Display */}
            <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl ${currentLevel.bgColor} backdrop-blur-md border ${currentLevel.borderColor} mb-8 shadow-xl hover:shadow-2xl transition-all duration-500 ${isAnimating ? 'animate-pulse scale-105' : ''}`}>
              <span className="text-3xl drop-shadow-lg">{currentLevel.emoji}</span>
              <div className="text-left">
                <div className={`font-bold text-xl ${currentLevel.textColor} drop-shadow-sm`}>
                  {currentLevel.name}
                </div>
                <div className={`text-sm ${currentLevel.textColor} opacity-80 font-medium`}>
                  {currentLevel.temp}
                </div>
              </div>
            </div>
          </div>
          
          {/* Interactive Slider */}
          <div className="relative mb-10">
            <div className="relative">
              <input 
                type="range"
                min="1"
                max="5"
                value={selectedHeat}
                onChange={(e) => handleHeatLevelClick(parseInt(e.target.value))}
                className="w-full h-4 bg-slate-800 rounded-lg appearance-none cursor-pointer slider shadow-inner"
              />
              
              {/* Slider progress indicator */}
              <div 
                className="absolute top-0 left-0 h-4 bg-gradient-to-r from-emerald-400 via-yellow-400 via-orange-500 via-red-600 to-purple-800 rounded-lg pointer-events-none transition-all duration-300"
                style={{ 
                  width: `${(selectedHeat - 1) * 25}%`,
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
                }}
              />
            </div>
            
            {/* Slider Labels */}
            <div className="flex justify-between mt-6 px-2">
              {heatLevels.map((level) => (
                <button
                  key={level.level}
                  onClick={() => handleHeatLevelClick(level.level)}
                  className={`text-center p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                    selectedHeat === level.level 
                      ? `${level.bgColor} ${level.borderColor} border shadow-lg` 
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-2xl mb-2 drop-shadow-sm">{level.emoji}</div>
                  <div className={`text-xs font-medium ${
                    selectedHeat === level.level ? level.textColor : 'text-gray-400'
                  }`}>
                    {level.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CSS for slider */}
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 28px;
            width: 28px;
            border-radius: 50%;
            background: linear-gradient(45deg, #dc2626, #f97316, #eab308);
            cursor: pointer;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.3);
            border: 3px solid white;
            transition: all 0.3s ease;
          }
          
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5), 0 0 25px rgba(239, 68, 68, 0.5);
          }
          
          .slider::-moz-range-thumb {
            height: 28px;
            width: 28px;
            border-radius: 50%;
            background: linear-gradient(45deg, #dc2626, #f97316, #eab308);
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.3);
          }
          
          .slider::-webkit-slider-track {
            height: 16px;
            border-radius: 8px;
            background: linear-gradient(90deg, #1e293b, #334155, #475569);
            box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.3);
          }
          
          .slider::-moz-range-track {
            height: 16px;
            border-radius: 8px;
            background: linear-gradient(90deg, #1e293b, #334155, #475569);
            box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.3);
            border: none;
          }
        `}</style>
      </CardContent>
    </Card>
  )
}