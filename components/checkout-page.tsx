"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Package, CreditCard, Shield, CheckCircle, AlertCircle, MapPin, User, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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
      const response = await fetch(`${API_BASE_URL}/test_simple.php`)
      const result = await response.json()
      setDebugInfo(`PHP Test: ${JSON.stringify(result, null, 2)}`)
      console.log("PHP Test Result:", result)
    } catch (error) {
      setDebugInfo(`PHP Test Error: ${error}`)
      console.error("PHP Test Error:", error)
    }
  }

  // Función para crear pedidos de prueba
  const createTestOrders = async () => {
    try {
      setDebugInfo("Creando pedidos de prueba...")

      // Pedido exitoso
      const successOrder = {
        customerInfo: {
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@example.com",
          phone: "+41 79 123 45 67",
          address: "Bahnhofstrasse 123",
          city: "Zürich",
          postalCode: "8001",
          canton: "Zürich",
          notes: "Pedido de prueba - EXITOSO",
        },
        cart: [
          {
            id: 1,
            name: "Carolina Reaper Hot Sauce",
            price: 15.9,
            quantity: 2,
            description: "Extremadamente picante",
            image: "",
            heatLevel: 10,
            rating: 4.5,
            badge: "EXTREME",
            origin: "Carolina",
          },
          {
            id: 2,
            name: "Habanero Sauce",
            price: 12.5,
            quantity: 1,
            description: "Picante medio",
            image: "",
            heatLevel: 7,
            rating: 4.2,
            badge: "HOT",
            origin: "Mexico",
          },
        ],
        totalAmount: 44.3,
        shippingCost: 0,
        paymentMethod: "paypal",
        paymentStatus: "completed",
      }

      // Pedido cancelado
      const cancelledOrder = {
        customerInfo: {
          firstName: "Maria",
          lastName: "García",
          email: "maria.garcia@example.com",
          phone: "+41 79 987 65 43",
          address: "Limmatstrasse 456",
          city: "Basel",
          postalCode: "4001",
          canton: "Basel-Stadt",
          notes: "Pedido de prueba - CANCELADO",
        },
        cart: [
          {
            id: 3,
            name: "Jalapeño Sauce",
            price: 9.9,
            quantity: 3,
            description: "Suave y sabroso",
            image: "",
            heatLevel: 4,
            rating: 4.0,
            badge: "MILD",
            origin: "Mexico",
          },
        ],
        totalAmount: 29.7,
        shippingCost: 0,
        paymentMethod: "paypal",
        paymentStatus: "failed",
      }

      // Pedido pendiente
      const pendingOrder = {
        customerInfo: {
          firstName: "Peter",
          lastName: "Müller",
          email: "peter.mueller@example.com",
          phone: "+41 79 555 44 33",
          address: "Hauptstrasse 789",
          city: "Bern",
          postalCode: "3001",
          canton: "Bern",
          notes: "Pedido de prueba - PENDIENTE",
        },
        cart: [
          {
            id: 4,
            name: "Ghost Pepper Sauce",
            price: 18.5,
            quantity: 1,
            description: "Para valientes",
            image: "",
            heatLevel: 9,
            rating: 4.8,
            badge: "EXTREME",
            origin: "India",
          },
        ],
        totalAmount: 18.5,
        shippingCost: 0,
        paymentMethod: "paypal",
        paymentStatus: "pending",
      }

      const orders = [
        { data: successOrder, status: "completed", name: "EXITOSO" },
        { data: cancelledOrder, status: "cancelled", name: "CANCELADO" },
        { data: pendingOrder, status: "pending", name: "PENDIENTE" },
      ]

      const results = []

      for (const order of orders) {
        try {
          // Modificar el status del pedido
          const orderData = {
            ...order.data,
            paymentStatus:
              order.status === "completed" ? "completed" : order.status === "cancelled" ? "failed" : "pending",
          }

          const response = await fetch(`${API_BASE_URL}/add_order.php`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
          })

          const responseText = await response.text()
          const result = JSON.parse(responseText)

          if (result.success) {
            results.push(`✅ ${order.name}: ${result.orderNumber}`)
          } else {
            results.push(`❌ ${order.name}: ${result.error}`)
          }
        } catch (error) {
          results.push(`❌ ${order.name}: Error - ${error}`)
        }
      }

      setDebugInfo(`Pedidos de prueba creados:\n${results.join("\n")}`)
    } catch (error) {
      setDebugInfo(`Error creando pedidos de prueba: ${error}`)
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
      console.log("Response headers:", response.headers)

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
    } catch (unknownError) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError))
      console.error("Error saving order to database:", error)
      setDebugInfo(`Error: ${error.message}`)
      throw error
    }
  }

  // Función para probar directamente el add_order.php
  const testOrderSubmission = async () => {
    try {
      setDebugInfo("Probando envío directo de pedido...")

      const testOrderData = {
        customerInfo: {
          firstName: "Test",
          lastName: "Usuario",
          email: "test@example.com",
          phone: "+41 79 123 45 67",
          address: "Teststrasse 123",
          city: "Zürich",
          postalCode: "8001",
          canton: "Zürich",
          notes: "Prueba desde frontend",
        },
        cart: [
          {
            id: 1,
            name: "Test Product",
            price: 15.9,
            quantity: 1,
            description: "Test description",
            image: "",
            heatLevel: 5,
            rating: 4.0,
            badge: "TEST",
            origin: "Test",
          },
        ],
        totalAmount: 15.9,
        shippingCost: 0,
        paymentMethod: "paypal",
        paymentStatus: "completed",
      }

      console.log("Test order data:", testOrderData)

      const response = await fetch(`${API_BASE_URL}/add_order.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testOrderData),
      })

      console.log("Test response status:", response.status)
      const responseText = await response.text()
      console.log("Test raw response:", responseText)

      const result = JSON.parse(responseText)
      setDebugInfo(`Test Result: ${JSON.stringify(result, null, 2)}`)
    } catch (error) {
      setDebugInfo(`Test Error: ${error}`)
      console.error("Test Error:", error)
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
      } catch (error: any) {
        console.error("Error saving order:", error)
        alert(`Error al guardar el pedido: ${error.message}`)
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
              Es gab ein problema beim Verarbeiten Ihrer Zahlung. Bitte versuchen Sie es erneut.
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

          {/* Debug buttons */}
          <div className="flex gap-2 ml-4">
            <Button
              onClick={testPHPConnection}
              variant="outline"
              className="bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700"
            >
              🔧 Test PHP
            </Button>

            <Button
              onClick={testOrderSubmission}
              variant="outline"
              className="bg-green-50 hover:bg-green-100 border border-green-300 text-green-700"
            >
              🧪 Test Order
            </Button>

            <Button
              onClick={createTestOrders}
              variant="outline"
              className="bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-700"
            >
              <Database className="w-4 h-4 mr-2" />
              Crear Pedidos Prueba
            </Button>
          </div>
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={customerInfo.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className={`bg-white ${formErrors.firstName ? "border-red-500" : ""}`}
                    />
                    {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={`bg-white ${formErrors.lastName ? "border-red-500" : ""}`}
                    />
                    {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`bg-white ${formErrors.email ? "border-red-500" : ""}`}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`bg-white ${formErrors.phone ? "border-red-500" : ""}`}
                    placeholder="+41 XX XXX XX XX"
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                  Lieferadresse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Straße und Hausnummer *</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={`bg-white ${formErrors.address ? "border-red-500" : ""}`}
                  />
                  {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">PLZ *</Label>
                    <Input
                      id="postalCode"
                      value={customerInfo.postalCode}
                      onChange={(e) => handleInputChange("postalCode", e.target.value)}
                      className={`bg-white ${formErrors.postalCode ? "border-red-500" : ""}`}
                      placeholder="1234"
                    />
                    {formErrors.postalCode && <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>}
                  </div>
                  <div>
                    <Label htmlFor="city">Stadt *</Label>
                    <Input
                      id="city"
                      value={customerInfo.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className={`bg-white ${formErrors.city ? "border-red-500" : ""}`}
                    />
                    {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="canton">Kanton *</Label>
                  <Input
                    id="canton"
                    value={customerInfo.canton}
                    onChange={(e) => handleInputChange("canton", e.target.value)}
                    className={`bg-white ${formErrors.canton ? "border-red-500" : ""}`}
                    placeholder="z.B. Zürich, Bern, Basel..."
                  />
                  {formErrors.canton && <p className="text-red-500 text-sm mt-1">{formErrors.canton}</p>}
                </div>

                <div>
                  <Label htmlFor="notes">Anmerkungen (optional)</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Besondere Lieferhinweise..."
                    rows={3}
                    className="bg-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Package className="w-5 h-5 mr-2 text-orange-600" />
                  Ihre Bestellung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image || "/placeholder.svg?height=64&width=64&query=product"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-gray-600 text-sm">Menge: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{(item.price * item.quantity).toFixed(2)} CHF</p>
                        <p className="text-xs text-gray-500">{item.price.toFixed(2)} CHF/Stück</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Zwischensumme:</span>
                    <span>{getTotalPrice().toFixed(2)} CHF</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Versand:</span>
                    <span>
                      <Badge className="bg-green-100 text-green-700">Kostenlos</Badge>
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Gesamt:</span>
                    <span className="text-orange-600">{getFinalTotal().toFixed(2)} CHF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-2">📦 Versandinformationen</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Versand nur innerhalb der Schweiz</li>
                  <li>• Lieferzeit: 2-3 Werktage</li>
                  <li>• Kostenloser Versand für alle Bestellungen</li>
                  <li>• Versand aus 9745 Sevelen</li>
                </ul>
              </CardContent>
            </Card>

            {/* PayPal Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <CreditCard className="w-5 h-5 mr-2 text-orange-600" />
                  Zahlung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Sichere Zahlung mit PayPal</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Sie werden zu PayPal weitergeleitet um die Zahlung abzuschließen.
                  </p>
                </div>

                {orderStatus === "processing" ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-semibold">Warten auf PayPal Zahlung...</p>
                    <p className="text-sm text-gray-500">Bitte schließen Sie die Zahlung in dem PayPal-Fenster ab</p>

                    <div className="flex gap-4 justify-center mt-6">
                      <Button
                        onClick={() => handlePaymentConfirmation(true)}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Speichere...
                          </>
                        ) : (
                          "✅ Zahlung abgeschlossen"
                        )}
                      </Button>
                      <Button
                        onClick={() => handlePaymentConfirmation(false)}
                        disabled={isSubmitting}
                        variant="outline"
                        className="border-red-500 text-red-600 hover:bg-red-50"
                      >
                        ❌ Zahlung fehlgeschlagen
                      </Button>
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                      Klicken Sie auf "Zahlung abgeschlossen" nur wenn PayPal die Zahlung bestätigt hat
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handlePayPalPayment}
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    💳 PayPal - {getFinalTotal().toFixed(2)} CHF
                  </Button>
                )}

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Mit dem Klick auf "Mit PayPal bezahlen" akzeptieren Sie unsere AGB und Datenschutzbestimmungen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
