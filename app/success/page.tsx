"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, ArrowLeft, Package, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PayPalSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [payerID, setPayerID] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    const payerIdFromUrl = searchParams.get("PayerID")
    if (payerIdFromUrl) {
      setPayerID(payerIdFromUrl)

      // Obtener datos del pedido desde localStorage
      const savedCustomerInfo = localStorage.getItem("cantina-customer-info")
      const savedCart = localStorage.getItem("cantina-cart")

      if (savedCustomerInfo && savedCart) {
        try {
          const customerInfo = JSON.parse(savedCustomerInfo)
          const cart = JSON.parse(savedCart)

          // Calcular total
          const total = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

          // Enviar datos al servidor PHP
          sendOrderEmail({
            payerID: payerIdFromUrl,
            customerInfo,
            cart,
            total,
            timestamp: new Date().toISOString(),
          })
        } catch (error) {
          console.error("Error processing order data:", error)
        }
      }

      // Limpiar el carrito del localStorage
      localStorage.removeItem("cantina-cart")

      // Guardar información del pago exitoso
      const paymentInfo = {
        payerID: payerIdFromUrl,
        timestamp: new Date().toISOString(),
        status: "completed",
      }
      localStorage.setItem("last-payment", JSON.stringify(paymentInfo))

      setIsProcessing(false)
    }
  }, [searchParams])

  const sendOrderEmail = async (orderData: any) => {
    try {
      console.log("Enviando datos del pedido:", orderData)

      const response = await fetch("https://web.lweb.ch/shop/enviar_confirmacion.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Resultado:", result)

      if (result.success) {
        setEmailSent(true)
        console.log("✅ Email enviado correctamente")
      } else {
        console.error("❌ Error enviando email:", result.error)
        // Mostrar error pero no bloquear la página
        setEmailSent(false)
      }
    } catch (error) {
      console.error("❌ Error conectando con servidor:", error)
      setEmailSent(false)

      // Intentar envío alternativo o mostrar mensaje de error
      console.log("Intentando método alternativo...")

      // Guardar datos para reintento manual
      localStorage.setItem("pending-email", JSON.stringify(orderData))
    }
  }

  const goBackToStore = () => {
    router.push("/")
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Procesando su pago y enviando confirmación...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="text-center p-12">
          <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-green-700 mb-4">¡Bestellung erfolgreich!</h1>
          <p className="text-xl text-gray-600 mb-6">Vielen Dank! Ihr PayPal-Zahlung wurde erfolgreich verarbeitet.</p>

          {payerID && (
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Zahlungsdetails</h3>
              <p className="text-green-600">PayPal Payer ID: {payerID}</p>
              <p className="text-green-600">Status: Bezahlt ✅</p>
              <p className="text-green-600">Datum: {new Date().toLocaleDateString("de-CH")}</p>

              <div className="mt-3">
                {emailSent ? (
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">✅ Bestätigungs-E-Mail gesendet</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">⚠️ E-Mail wird verarbeitet...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-700 mb-4">
              <Package className="w-5 h-5" />
              <span>Ihr Warenkorb wurde geleert</span>
            </div>

            <p className="text-gray-600">Sie erhalten eine Bestätigungs-E-Mail von uns und von PayPal.</p>
            <p className="text-gray-600">Ihre Bestellung wird in 2-3 Werktagen versendet.</p>

            <Button onClick={goBackToStore} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Shop
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
