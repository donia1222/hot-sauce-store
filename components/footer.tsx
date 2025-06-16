"use client"

import { Truck, Shield, MapPin, CreditCard } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function Footer() {
  const [openModal, setOpenModal] = useState<string | null>(null)

  const legalContent = {
    agb: {
      title: "Allgemeine Geschäftsbedingungen",
      content: `
        1. Geltungsbereich
        Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen über unseren Online-Shop.

        2. Vertragsschluss
        Der Vertrag kommt durch Ihre Bestellung und unsere Auftragsbestätigung zustande.

        3. Preise und Zahlung
        Alle Preise verstehen sich in CHF inklusive der gesetzlichen Mehrwertsteuer.
        Zahlung erfolgt per PayPal, Kreditkarte oder Banküberweisung.

        4. Lieferung
        Wir liefern nur innerhalb der Schweiz.
        Die Lieferzeit beträgt 1-3 Werktage.
        Versandkosten werden bei Bestellungen unter 50 CHF erhoben.

        5. Widerrufsrecht
        Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.

        6. Gewährleistung
        Es gelten die gesetzlichen Gewährleistungsbestimmungen.
      `,
    },
    datenschutz: {
      title: "Datenschutzrichtlinie",
      content: `
        1. Datenerhebung
        Wir erheben nur die für die Bestellabwicklung notwendigen Daten.

        2. Verwendung der Daten
        Ihre Daten werden ausschließlich zur Bestellabwicklung verwendet.

        3. Datenweitergabe
        Eine Weitergabe an Dritte erfolgt nur zur Bestellabwicklung (Versanddienstleister).

        4. Datensicherheit
        Wir verwenden SSL-Verschlüsselung zum Schutz Ihrer Daten.

        5. Ihre Rechte
        Sie haben das Recht auf Auskunft, Berichtigung und Löschung Ihrer Daten.

        6. Kontakt
        Bei Fragen zum Datenschutz kontaktieren Sie uns unter info@lweb.ch
      `,
    },
    rueckgabe: {
      title: "Rückgaberichtlinie",
      content: `
        1. Rückgaberecht
        Sie können Artikel innerhalb von 14 Tagen nach Erhalt zurückgeben.

        2. Zustand der Ware
        Die Ware muss sich in originalem, unbenutztem Zustand befinden.

        3. Rückgabeprozess
        Kontaktieren Sie uns vor der Rücksendung unter info@lweb.ch

        4. Rücksendekosten
        Die Kosten für die Rücksendung trägt der Kunde.

        5. Erstattung
        Die Erstattung erfolgt innerhalb von 14 Tagen nach Erhalt der Rücksendung.

        6. Ausnahmen
        Aus hygienischen Gründen können geöffnete Lebensmittel nicht zurückgenommen werden.
      `,
    },
  }

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
              <p>Kundenservice: info@lweb.ch</p>
              <p>Telefon: +41 76 560 86 45</p>
            </div>
          </div>

          {/* Legal & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div>
                <Dialog open={openModal === "agb"} onOpenChange={(open) => setOpenModal(open ? "agb" : null)}>
                  <DialogTrigger asChild>
                    <button className="hover:text-red-500 transition-colors text-left block">
                      Allgemeine Geschäftsbedingungen
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{legalContent.agb.title}</DialogTitle>
                    </DialogHeader>
                    <div className="whitespace-pre-line text-sm">{legalContent.agb.content}</div>
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <Dialog
                  open={openModal === "datenschutz"}
                  onOpenChange={(open) => setOpenModal(open ? "datenschutz" : null)}
                >
                  <DialogTrigger asChild>
                    <button className="hover:text-red-500 transition-colors text-left block">
                      Datenschutzrichtlinie
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{legalContent.datenschutz.title}</DialogTitle>
                    </DialogHeader>
                    <div className="whitespace-pre-line text-sm">{legalContent.datenschutz.content}</div>
                  </DialogContent>
                </Dialog>
              </div>

              <div>
                <Dialog
                  open={openModal === "rueckgabe"}
                  onOpenChange={(open) => setOpenModal(open ? "rueckgabe" : null)}
                >
                  <DialogTrigger asChild>
                    <button className="hover:text-red-500 transition-colors text-left block">Rückgaberichtlinie</button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{legalContent.rueckgabe.title}</DialogTitle>
                    </DialogHeader>
                    <div className="whitespace-pre-line text-sm">{legalContent.rueckgabe.content}</div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Credits and Design Info */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
            <div>
              <p>
                <strong>Bildnachweis:</strong> Einige Bilder stammen von Freepik
              </p>
            </div>
            <div>
              <p>
                <strong>Webseite Design:</strong>{" "}
                <a
                  href="https://lweb.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-red-500 transition-colors"
                >
                  lweb.ch
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">© 2024 FEUER KÖNIGREICH. Alle Rechte vorbehalten.</div>
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
