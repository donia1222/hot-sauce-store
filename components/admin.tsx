"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, RefreshCw, Filter, Package, ShoppingBag, DollarSign, CheckCircle, Clock, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface OrderItem {
  order_id: number
  product_id: number
  product_name: string
  product_description: string
  product_image: string
  price: number | string
  quantity: number
  subtotal: number | string
  heat_level: number
  rating: number | string
  badge: string
  origin: string
}

interface Order {
  id: number
  order_number: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  customer_city: string
  customer_postal_code: string
  customer_canton: string
  customer_notes: string
  total_amount: number | string
  shipping_cost: number | string
  status: "pending" | "processing" | "completed" | "cancelled"
  payment_method: string
  payment_status: "pending" | "completed" | "failed"
  created_at: string
  updated_at: string
  items_count: number
  items?: OrderItem[]
}

interface Stats {
  total_orders: number | string
  total_revenue: number | string
  avg_order_value: number | string
  completed_orders: number | string
  pending_orders: number | string
  processing_orders: number | string
  cancelled_orders: number | string
}

interface AdminProps {
  onClose: () => void
}

export function Admin({ onClose }: AdminProps) {
  console.log("Admin component mounted") // Add this line
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  // Filtros
  const [filters, setFilters] = useState({
    search: "",
    status: "all", // Updated default value to "all"
    email: "",
  })

  const API_BASE_URL = "https://web.lweb.ch/shop"

  useEffect(() => {
    console.log("Admin useEffect triggered, loading orders...") // Add this line
    loadOrders()
  }, [currentPage, filters])

  const loadOrders = async () => {
    try {
      console.log("Loading orders from API...") // Add this line
      setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        include_items: "true",
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value)),
      })

      const response = await fetch(`${API_BASE_URL}/get_orders.php?${params}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
        setStats(data.stats)
        setTotalPages(data.pagination.total_pages)
      } else {
        setError("Error al cargar los pedidos")
      }
    } catch (err) {
      setError("Error de conexión")
      console.error("Error loading orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const showOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderModalOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "pending":
        return "Pendiente"
      case "processing":
        return "Procesando"
      case "cancelled":
        return "Cancelado"
      default:
        return status
    }
  }

  const getHeatLevelColor = (level: number) => {
    if (level <= 2) return "bg-green-100 text-green-800"
    if (level <= 4) return "bg-yellow-100 text-yellow-800"
    if (level <= 6) return "bg-orange-100 text-orange-800"
    if (level <= 8) return "bg-red-100 text-red-800"
    return "bg-red-200 text-red-900"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando panel de administración...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">FEUER KÖNIGREICH</h1>
                <p className="text-gray-600">Panel de Administración</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={loadOrders} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
              <Button onClick={onClose} variant="outline" className="border-gray-300 bg-gray-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Pedidos</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {Number.parseInt(stats.total_orders.toString()) || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-green-600">
                      {(Number.parseFloat(stats.total_revenue.toString()) || 0).toFixed(2)} CHF
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Completados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Number.parseInt(stats.completed_orders.toString()) || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {Number.parseInt(stats.pending_orders.toString()) || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2 text-orange-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Nombre, email, número..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor="status">Estado</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="processing">Procesando</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={filters.email}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilters({ search: "", status: "all", email: "" }) // Updated default value to "all"
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="grid grid-cols-1 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-6 h-6 text-gray-600" />
                    <span>{order.order_number}</span>
                  </div>
                  <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Cliente</p>
                    <p className="text-lg font-bold text-gray-800">
                      {order.customer_first_name} {order.customer_last_name}
                    </p>
                    <p className="text-gray-600 text-sm">Email: {order.customer_email}</p>
                    <p className="text-gray-600 text-sm">Teléfono: {order.customer_phone}</p>
                    <p className="text-gray-600 text-sm">Dirección: {order.customer_address}</p>
                    <p className="text-gray-600 text-sm">Ciudad: {order.customer_city}</p>
                    <p className="text-gray-600 text-sm">Canton: {order.customer_canton}</p>
                    <p className="text-gray-600 text-sm">Notas: {order.customer_notes}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {(Number.parseFloat(order.total_amount.toString()) || 0).toFixed(2)} CHF
                    </p>
                    <p className="text-gray-600 text-sm">Costo de Envío</p>
                    <p className="text-lg font-bold text-gray-800">
                      {(Number.parseFloat(order.shipping_cost.toString()) || 0).toFixed(2)} CHF
                    </p>
                    <p className="text-gray-600 text-sm">Fecha de Creación</p>
                    <p className="text-gray-600 text-sm">{formatDate(order.created_at)}</p>
                    <p className="text-gray-600 text-sm">Fecha de Actualización</p>
                    <p className="text-gray-600 text-sm">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={() => showOrderDetail(order)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center mt-8">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-orange-500 hover:bg-orange-600 text-white mr-2"
          >
            Anterior
          </Button>
          <span className="text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-orange-500 hover:bg-orange-600 text-white ml-2"
          >
            Siguiente
          </Button>
        </div>

        {/* Order Modal */}
        {selectedOrder && (
          <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-6 h-6 text-gray-600" />
                    <span>{selectedOrder.order_number}</span>
                  </div>
                  <Badge className={getStatusColor(selectedOrder.status)}>{getStatusText(selectedOrder.status)}</Badge>
                </DialogTitle>
              </DialogHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Cliente</p>
                    <p className="text-lg font-bold text-gray-800">
                      {selectedOrder.customer_first_name} {selectedOrder.customer_last_name}
                    </p>
                    <p className="text-gray-600 text-sm">Email: {selectedOrder.customer_email}</p>
                    <p className="text-gray-600 text-sm">Teléfono: {selectedOrder.customer_phone}</p>
                    <p className="text-gray-600 text-sm">Dirección: {selectedOrder.customer_address}</p>
                    <p className="text-gray-600 text-sm">Ciudad: {selectedOrder.customer_city}</p>
                    <p className="text-gray-600 text-sm">Canton: {selectedOrder.customer_canton}</p>
                    <p className="text-gray-600 text-sm">Notas: {selectedOrder.customer_notes}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {(Number.parseFloat(selectedOrder.total_amount.toString()) || 0).toFixed(2)} CHF
                    </p>
                    <p className="text-gray-600 text-sm">Costo de Envío</p>
                    <p className="text-lg font-bold text-gray-800">
                      {(Number.parseFloat(selectedOrder.shipping_cost.toString()) || 0).toFixed(2)} CHF
                    </p>
                    <p className="text-gray-600 text-sm">Fecha de Creación</p>
                    <p className="text-gray-600 text-sm">{formatDate(selectedOrder.created_at)}</p>
                    <p className="text-gray-600 text-sm">Fecha de Actualización</p>
                    <p className="text-gray-600 text-sm">{formatDate(selectedOrder.updated_at)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-gray-800">Items del Pedido</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedOrder.items?.map((item) => (
                      <Card key={item.product_id} className="hover:shadow-lg transition-shadow">
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <img
                                src={item.product_image || "/placeholder.svg"}
                                alt={item.product_name}
                                className="w-12 h-12 rounded"
                              />
                              <span>{item.product_name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 text-sm">Cantidad: {item.quantity}</span>
                              <span className="text-gray-600 text-sm">
                                Subtotal: {(Number.parseFloat(item.subtotal.toString()) || 0).toFixed(2)} CHF
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-gray-600 text-sm">Descripción: {item.product_description}</p>
                            <p className="text-gray-600 text-sm">Nivel de Calor: {item.heat_level}</p>
                            <p className="text-gray-600 text-sm">Rating: {item.rating}</p>
                            <p className="text-gray-600 text-sm">Badge: {item.badge}</p>
                            <p className="text-gray-600 text-sm">Origen: {item.origin}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
