"use client"

import { Crown, Award, Truck, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const scrollToProducts = () => {
    const element = document.getElementById("products")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="hero"
      style={{
        backgroundImage: "url('/condiment-flavor-based-chili-pepper.jpg')", // Ruta de la imagen de fondo
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="relative min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white overflow-hidden"
    >
      {/* Textura sutil superpuesta */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_50%)]"></div>

      {/* Capa oscura para mejorar la legibilidad del texto */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>

      {/* Elementos de acento mínimos */}
      <div className="absolute top-20 right-20 w-1 h-32 bg-gradient-to-b from-red-600 to-transparent opacity-60"></div>
      <div className="absolute bottom-40 left-20 w-32 h-1 bg-gradient-to-r from-red-600 to-transparent opacity-60"></div>

      <div className="container mx-auto px-6 py-20 relative z-10 flex flex-col justify-center min-h-screen">
        <div className="text-center max-w-6xl mx-auto">
          {/* Insignia Premium */}
          <div className="flex justify-center mb-12">
            <div className="bg-gradient-to-r from-red-600 to-red-500 text-red-100 font-semibold text-sm px-6 py-2 rounded-full border border-red-700/50 shadow-lg mt-20">
              <Crown className="w-4 h-4 inline mr-2" />
              PREMIUM COLLECTION
            </div>
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white tracking-tight leading-none">
            FEUER
          </h1>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-16 text-gray-300 tracking-wide leading-none">
            KÖNIGREICH
          </h2>

          {/* Descripción */}
          <div className="max-w-4xl mx-auto mb-20">
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-300 font-light leading-relaxed">
              Die exklusivste Premium-Kollektion scharfer Saucen der Welt
            </p>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-8"></div>
            <p className="text-lg md:text-xl text-gray-400 font-light">
              Direkt aus unserem Geschäft in <span className="text-white font-medium">9745 Sevelen</span>
              <br />
              <span className="text-red-400">Versand nur innerhalb der Schweiz</span>
            </p>
          </div>

          {/* Cuadrícula de características */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="group bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700/50 hover:border-red-600/30 transition-all duration-500 hover:bg-gray-800/70">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-900/30 p-4 rounded-full group-hover:bg-red-900/50 transition-all duration-500">
                  <Award className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Premium Zutaten</h3>
              <p className="text-gray-400 font-light">Nur die besten Chilis der Welt</p>
            </div>

            <div className="group bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700/50 hover:border-red-600/30 transition-all duration-500 hover:bg-gray-800/70">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-900/30 p-4 rounded-full group-hover:bg-red-900/50 transition-all duration-500">
                  <Crown className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Limitierte Auflage</h3>
              <p className="text-gray-400 font-light">Exklusive Sammlerflaschen</p>
            </div>

            <div className="group bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-gray-700/50 hover:border-red-600/30 transition-all duration-500 hover:bg-gray-800/70">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-red-900/30 p-4 rounded-full group-hover:bg-red-900/50 transition-all duration-500">
                  <Truck className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Schweiz Versand</h3>
              <p className="text-gray-400 font-light">Schnell & sicher geliefert</p>
            </div>
          </div>

        </div>
      </div>

      {/* Desvanecimiento inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent"></div>
    </section>
  )
}
