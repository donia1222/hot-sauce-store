import { Truck, Shield, MapPin, CreditCard } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Shipping Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5 text-red-500" />
              Versand
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-500" />
                Wir versenden nur in die Schweiz
              </p>
              <p>Kostenloser Versand bei Bestellungen über 50 CHF</p>
              <p>Wir versenden mit A-Post für mehr Sicherheit</p>
              <p>Lieferzeit: 1-3 Werktage</p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-red-500" />
              Sichere Zahlung
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                PayPal - 100% sichere Zahlung
              </p>
              <p>Kredit- und Debitkarten</p>
              <p>Banküberweisung</p>
              <p>Alle Zahlungen sind geschützt</p>
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-500">FEUER KÖNIGREICH</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Premium handwerkliche Saucen</p>
              <p>Direkt importiert</p>
              <p>Garantierte Qualität</p>
              <p>Kundenservice: info@cantinapicante.ch</p>
            </div>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Allgemeine Geschäftsbedingungen</p>
              <p>Datenschutzrichtlinie</p>
              <p>Rückgaberichtlinie</p>
              <p>Kontakt: +41 XX XXX XX XX</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">© 2024 Cantina Picante. Alle Rechte vorbehalten.</div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Made in Switzerland
              </span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sichere Zahlung
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
