"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, AlertCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

interface CheckoutPageProps {
  cart: CartItem[]
  onBackToStore: () => void
  onClearCart?: () => void
}

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  canton: string
  notes: string
}

export function CheckoutPage({ cart, onBackToStore, onClearCart }: CheckoutPageProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    canton: "",
    notes: "",
  })

  const [orderStatus, setOrderStatus] = useState<"pending" | "processing" | "completed" | "error">("pending")
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [formErrors, setFormErrors] = useState<Partial<CustomerInfo>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // API Base URL - URL CORRECTA
  const API_BASE_URL = "https://web.lweb.ch/shop"

  // Load user data from localStorage on start
  useEffect(() => {
    const savedCustomerInfo = localStorage.getItem("cantina-customer-info")
    if (savedCustomerInfo) {
      try {
        const parsedInfo = JSON.parse(savedCustomerInfo)
        setCustomerInfo(parsedInfo)
      } catch (error) {
        console.error("Error loading customer info from localStorage:", error)
      }
    }
  }, [])

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    const hasData = Object.values(customerInfo).some((value) => value.trim() !== "")
    if (hasData) {
      localStorage.setItem("cantina-customer-info", JSON.stringify(customerInfo))
    }
  }, [customerInfo])

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getShippingCost = () => {
    return 0 // Envío siempre gratuito para pruebas
  }

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost()
  }

  // Función para probar la conexión PHP
  const testPHPConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test_db.php`)
      const result = await response.json()
      setDebugInfo(`PHP Test: ${JSON.stringify(result, null, 2)}`)
      console.log("PHP Test Result:", result)
    } catch (error) {
      setDebugInfo(`PHP Test Error: ${error}`)
      console.error("PHP Test Error:", error)
    }
  }

  // Función para guardar el pedido en la base de datos
  const saveOrderToDatabase = async () => {
    try {
      setDebugInfo("Enviando pedido a la base de datos...")

      const orderData = {
        customerInfo: customerInfo,
        cart: cart,
        totalAmount: getFinalTotal(),
        shippingCost: getShippingCost(),
        paymentMethod: "paypal",
        paymentStatus: "completed",
      }

      console.log("Sending order data:", orderData)

      const response = await fetch(`${API_BASE_URL}/add_order.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      console.log("Raw response:", responseText)

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`)
      }

      if (!result.success) {
        throw new Error(result.error || "Error saving order")
      }

      setDebugInfo(`Pedido guardado exitosamente: ${result.orderNumber}`)
      return result.data
    } catch (error: any) {
      console.error("Error saving order to database:", error)
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    }
  }

  const handlePayPalPayment = () => {
    if (!validateForm()) {
      return
    }

    const total = getFinalTotal()
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=info@cantinatexmex.ch&amount=${total.toFixed(2)}&currency_code=CHF&item_name=FEUER KÖNIGREICH Order&return=${window.location.origin}/success&cancel_return=${window.location.origin}/cancel`

    setOrderStatus("processing")
    window.open(paypalUrl, "_blank")
  }

  const handlePaymentConfirmation = async (success: boolean) => {
    if (success) {
      setIsSubmitting(true)

      try {
        const savedOrder = await saveOrderToDatabase()

        setOrderStatus("completed")
        setOrderDetails({
          id: savedOrder.orderNumber,
          status: "COMPLETED",
          customerInfo: customerInfo,
          cart: cart,
          total: getFinalTotal(),
          createdAt: savedOrder.createdAt,
        })

        if (onClearCart) {
          onClearCart()
        }

        localStorage.removeItem("cantina-cart")
      } catch (error) {
        console.error("Error saving order:", error)
        alert(`Error al guardar el pedido: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setOrderStatus("error")
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setOrderStatus("error")
    }
  }

  const validateForm = () => {
    const errors: Partial<CustomerInfo> = {}

    if (!customerInfo.firstName.trim()) errors.firstName = "Vorname ist erforderlich"
    if (!customerInfo.lastName.trim()) errors.lastName = "Nachname ist erforderlich"
    if (!customerInfo.email.trim()) errors.email = "E-Mail ist erforderlich"
    if (!customerInfo.phone.trim()) errors.phone = "Telefon ist erforderlich"
    if (!customerInfo.address.trim()) errors.address = "Adresse ist erforderlich"
    if (!customerInfo.city.trim()) errors.city = "Stadt ist erforderlich"
    if (!customerInfo.postalCode.trim()) errors.postalCode = "PLZ ist erforderlich"
    if (!customerInfo.canton.trim()) errors.canton = "Kanton ist erforderlich"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (customerInfo.email && !emailRegex.test(customerInfo.email)) {
      errors.email = "Ungültige E-Mail-Adresse"
    }

    const postalCodeRegex = /^\d{4}$/
    if (customerInfo.postalCode && !postalCodeRegex.test(customerInfo.postalCode)) {
      errors.postalCode = "PLZ muss 4 Ziffern haben"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (orderStatus === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center p-12">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-green-700 mb-4">Bestellung erfolgreich!</h1>
            <p className="text-xl text-gray-600 mb-6">
              Vielen Dank für Ihre Bestellung! Sie erhalten in Kürze eine Bestätigungs-E-Mail.
            </p>

            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-700 mb-2">Bestelldetails</h3>
              <p className="text-green-600">Bestellnummer: {orderDetails?.id}</p>
              <p className="text-green-600">Betrag: {getFinalTotal().toFixed(2)} CHF</p>
              <p className="text-green-600">Status: Bezahlt</p>
              <p className="text-green-600">Gespeichert in Datenbank: ✅</p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">Ihre Bestellung wird innerhalb von 2-3 Werktagen versendet.</p>
              <Button onClick={onBackToStore} className="bg-orange-600 hover:bg-orange-700">
                Zurück zum Shop
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (orderStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="text-center p-12">
            <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-red-700 mb-4">Fehler bei der Bestellung</h1>
            <p className="text-xl text-gray-600 mb-6">
              Es gab ein Problem beim Verarbeiten Ihrer Zahlung. Bitte versuchen Sie es erneut.
            </p>

            {debugInfo && (
              <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-red-700 mb-2">Debug Info:</h4>
                <pre className="text-xs text-red-600 whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            )}

            <div className="space-y-4">
              <Button onClick={() => setOrderStatus("pending")} className="bg-orange-600 hover:bg-orange-700">
                Erneut versuchen
              </Button>
              <Button onClick={onBackToStore} variant="outline">
                Zurück zum Shop
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            onClick={onBackToStore}
            variant="outline"
            className="mr-4 bg-white hover:bg-gray-50 border border-gray-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Shop
          </Button>

          {/* Debug button */}
          <Button
            onClick={testPHPConnection}
            variant="outline"
            className="ml-4 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700"
          >
            🔧 Test PHP
          </Button>
        </div>

        {/* Debug info */}
        {debugInfo && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-700 mb-2">Debug Info:</h4>
              <pre className="text-xs text-blue-600 whitespace-pre-wrap">{debugInfo}</pre>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-orange-600" />
                    Persönliche Daten
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Automatisch gespeichert
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
