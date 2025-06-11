"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Package, CreditCard, Shield, CheckCircle, AlertCircle, MapPin, User } from "lucide-react"
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

declare global {
  interface Window {
    paypal: any
  }
}

export function CheckoutPage({ cart, onBackToStore }: CheckoutPageProps) {
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

  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false)
  const [orderStatus, setOrderStatus] = useState<"pending" | "processing" | "completed" | "error">("pending")
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [formErrors, setFormErrors] = useState<Partial<CustomerInfo>>({})

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getShippingCost = () => {
    const total = getTotalPrice()
    return total >= 50 ? 0 : 8.5 // Envío gratis para pedidos superiores a 50 CHF
  }

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost()
  }

  // Cargar PayPal SDK
  useEffect(() => {
    const loadPayPalScript = () => {
      if (window.paypal) {
        setIsPayPalLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=CHF&locale=de_DE"
      script.async = true
      script.onload = () => setIsPayPalLoaded(true)
      document.body.appendChild(script)
    }

    loadPayPalScript()
  }, [])

  // Inicializar botones de PayPal
  useEffect(() => {
    if (isPayPalLoaded && window.paypal && orderStatus === "pending") {
      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
            height: 50,
          },
          createOrder: (data: any, actions: any) => {
            if (!validateForm()) {
              return Promise.reject("Formulario incompleto")
            }

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: getFinalTotal().toFixed(2),
                    currency_code: "CHF",
                    breakdown: {
                      item_total: {
                        currency_code: "CHF",
                        value: getTotalPrice().toFixed(2),
                      },
                      shipping: {
                        currency_code: "CHF",
                        value: getShippingCost().toFixed(2),
                      },
                    },
                  },
                  items: cart.map((item) => ({
                    name: item.name,
                    unit_amount: {
                      currency_code: "CHF",
                      value: item.price.toFixed(2),
                    },
                    quantity: item.quantity.toString(),
                  })),
                  shipping: {
                    name: {
                      full_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                    },
                    address: {
                      address_line_1: customerInfo.address,
                      admin_area_2: customerInfo.city,
                      postal_code: customerInfo.postalCode,
                      country_code: "CH",
                    },
                  },
                },
              ],
              application_context: {
                shipping_preference: "SET_PROVIDED_ADDRESS",
              },
            })
          },
          onApprove: async (data: any, actions: any) => {
            setOrderStatus("processing")
            try {
              const details = await actions.order.capture()
              setOrderDetails(details)
              setOrderStatus("completed")

              // Aquí podrías enviar los datos a tu backend
              console.log("Pedido completado:", details)
              console.log("Información del cliente:", customerInfo)
            } catch (error) {
              console.error("Error al procesar el pago:", error)
              setOrderStatus("error")
            }
          },
          onError: (err: any) => {
            console.error("Error de PayPal:", err)
            setOrderStatus("error")
          },
        })
        .render("#paypal-button-container")
    }
  }, [isPayPalLoaded, customerInfo, cart, orderStatus])

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

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (customerInfo.email && !emailRegex.test(customerInfo.email)) {
      errors.email = "Ungültige E-Mail-Adresse"
    }

    // Validar código postal suizo
    const postalCodeRegex = /^\d{4}$/
    if (customerInfo.postalCode && !postalCodeRegex.test(customerInfo.postalCode)) {
      errors.postalCode = "PLZ muss 4 Ziffern haben"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
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
          <Button onClick={onBackToStore} variant="outline" className="mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Shop
          </Button>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario del cliente */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <User className="w-5 h-5 mr-2 text-orange-600" />
                  Persönliche Daten
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
                      className={formErrors.firstName ? "border-red-500" : ""}
                    />
                    {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className={formErrors.lastName ? "border-red-500" : ""}
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
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={formErrors.phone ? "border-red-500" : ""}
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
                    className={formErrors.address ? "border-red-500" : ""}
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
                      className={formErrors.postalCode ? "border-red-500" : ""}
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
                      className={formErrors.city ? "border-red-500" : ""}
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
                    className={formErrors.canton ? "border-red-500" : ""}
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
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen del pedido */}
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
                        src={item.image || "/placeholder.svg"}
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
                      {getShippingCost() === 0 ? (
                        <Badge className="bg-green-100 text-green-700">Kostenlos</Badge>
                      ) : (
                        `${getShippingCost().toFixed(2)} CHF`
                      )}
                    </span>
                  </div>
                  {getTotalPrice() < 50 && (
                    <p className="text-sm text-gray-600">
                      Noch {(50 - getTotalPrice()).toFixed(2)} CHF für kostenlosen Versand!
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>Gesamt:</span>
                    <span className="text-orange-600">{getFinalTotal().toFixed(2)} CHF</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de envío */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-2">📦 Versandinformationen</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Versand nur innerhalb der Schweiz</li>
                  <li>• Lieferzeit: 2-3 Werktage</li>
                  <li>• Kostenloser Versand ab 50 CHF</li>
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
                  <p className="text-xs text-gray-500">Ihre Zahlungsdaten werden sicher über PayPal verarbeitet.</p>
                </div>

                {orderStatus === "processing" ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Zahlung wird verarbeitet...</p>
                  </div>
                ) : (
                  <div id="paypal-button-container" className="min-h-[120px]">
                    {!isPayPalLoaded && (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">PayPal wird geladen...</p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Mit dem Klick auf "Jetzt bezahlen" akzeptieren Sie unsere AGB und Datenschutzbestimmungen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
