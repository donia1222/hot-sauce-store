"use client"

import { useState, useEffect } from "react"
import {
  User,
  Package,
  Edit,
  Save,
  X,
  Eye,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Trash2,
  AlertTriangle,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserData {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  canton: string
  notes: string
  created_at: string
  last_login: string
}

interface OrderStats {
  total_orders: number
  total_spent: number
  last_order_date: string
}

interface RecentOrder {
  id: number
  order_number: string
  total_amount: number
  status: string
  created_at: string
}

interface UserProfileProps {
  onClose: () => void
  onAccountDeleted?: () => void
}

export function UserProfile({ onClose, onAccountDeleted }: UserProfileProps) {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<UserData>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Estados para eliminación de cuenta
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  // Estados para cambio de contraseña
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")

  const API_BASE_URL = "https://web.lweb.ch/shop"

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      setLoading(true)
      const sessionToken = localStorage.getItem("user-session-token")
      console.log("UserProfile: Loading with token:", sessionToken?.substring(0, 10) + "...")

      if (!sessionToken) {
        throw new Error("No session token found")
      }

      const response = await fetch(`${API_BASE_URL}/get_user.php`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
        }),
      })

      console.log("UserProfile: Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("UserProfile: HTTP Error:", response.status, errorText)

        if (response.status === 401) {
          localStorage.removeItem("user-session-token")
          throw new Error("Sesión expirada. Por favor, inicie sesión nuevamente.")
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("UserProfile: Response data:", data)

      if (data.success) {
        setUserData(data.user)
        setOrderStats(data.orderStats)
        setRecentOrders(data.recentOrders)
        setEditData(data.user)
      } else {
        throw new Error(data.error || "Failed to load user profile")
      }
    } catch (err: any) {
      setError(err.message)
      console.error("Error loading user profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const sessionToken = localStorage.getItem("user-session-token")

      if (!sessionToken) {
        throw new Error("No session token found")
      }

      const response = await fetch(`${API_BASE_URL}/update_user.php`, {
        method: "PUT",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
          firstName: editData.first_name,
          lastName: editData.last_name,
          phone: editData.phone,
          address: editData.address,
          city: editData.city,
          postalCode: editData.postal_code,
          canton: editData.canton,
          notes: editData.notes,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setUserData((prev) => (prev ? { ...prev, ...editData } : null))
        setIsEditing(false)
      } else {
        throw new Error(data.error || "Failed to update user")
      }
    } catch (err: any) {
      alert(`Error updating profile: ${err.message}`)
      console.error("Error updating user:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Bitte geben Sie Ihr Passwort ein")
      return
    }

    try {
      setIsDeleting(true)
      setDeleteError("")
      const sessionToken = localStorage.getItem("user-session-token")

      if (!sessionToken) {
        throw new Error("No session token found")
      }

      console.log("🗑️ Iniciando eliminación de cuenta...")

      const response = await fetch(`${API_BASE_URL}/delete_user.php`, {
        method: "DELETE",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
          confirmPassword: deletePassword,
        }),
      })

      console.log("📡 Respuesta del servidor:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)

        if (response.status === 401) {
          throw new Error("Passwort ist falsch oder Sitzung ist abgelaufen")
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Respuesta de eliminación:", data)

      if (data.success) {
        // Limpiar localStorage completamente
        localStorage.removeItem("user-session-token")
        localStorage.removeItem("cantina-customer-info")
        localStorage.removeItem("cantina-cart")

        // Cerrar el diálogo
        setShowDeleteDialog(false)

        // Mostrar mensaje de éxito
        alert("Ihr Konto wurde erfolgreich gelöscht. Sie werden zur Startseite weitergeleitet.")

        // Llamar callback si existe
        if (onAccountDeleted) {
          onAccountDeleted()
        }

        // Cerrar el modal de perfil
        onClose()

        // Redirigir después de un breve delay
        setTimeout(() => {
          window.location.href = "/"
        }, 1000)
      } else {
        throw new Error(data.error || "Failed to delete account")
      }
    } catch (error: unknown) {
      console.error("❌ Error eliminando cuenta:", error)

      let errorMessage = "Error desconocido"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // Mensajes más específicos para errores comunes
      if (errorMessage.includes("Passwort ist falsch")) {
        setDeleteError("Das eingegebene Passwort ist falsch")
      } else if (errorMessage.includes("Sitzung ist abgelaufen")) {
        setDeleteError("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.")
      } else if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        setDeleteError("Verbindungsfehler. Bitte versuchen Sie es erneut.")
      } else {
        setDeleteError(`Fehler beim Löschen des Kontos: ${errorMessage}`)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleChangePassword = async () => {
    // Validaciones básicas
    if (!passwordData.currentPassword.trim()) {
      setPasswordError("Bitte geben Sie Ihr aktuelles Passwort ein")
      return
    }

    if (!passwordData.newPassword.trim()) {
      setPasswordError("Bitte geben Sie ein neues Passwort ein")
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Das neue Passwort muss mindestens 8 Zeichen lang sein")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Die neuen Passwörter stimmen nicht überein")
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError("Das neue Passwort muss sich vom aktuellen unterscheiden")
      return
    }

    try {
      setIsChangingPassword(true)
      setPasswordError("")
      const sessionToken = localStorage.getItem("user-session-token")

      if (!sessionToken) {
        throw new Error("No session token found")
      }

      console.log("🔑 Iniciando cambio de contraseña...")

      const response = await fetch(`${API_BASE_URL}/change_password.php`, {
        method: "PUT",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }),
      })

      console.log("📡 Respuesta del servidor:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Error HTTP:", response.status, errorText)

        if (response.status === 401) {
          throw new Error("Das aktuelle Passwort ist falsch oder die Sitzung ist abgelaufen")
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log("✅ Respuesta de cambio de contraseña:", data)

      if (data.success) {
        // Cerrar el diálogo y limpiar datos
        setShowPasswordDialog(false)
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        // Mostrar mensaje de éxito
        alert("Ihr Passwort wurde erfolgreich geändert!")
      } else {
        throw new Error(data.error || "Failed to change password")
      }
    } catch (error: unknown) {
      console.error("❌ Error cambiando contraseña:", error)

      let errorMessage = "Error desconocido"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      // Mensajes más específicos para errores comunes
      if (errorMessage.includes("aktuelle Passwort ist falsch")) {
        setPasswordError("Das aktuelle Passwort ist falsch")
      } else if (errorMessage.includes("Sitzung ist abgelaufen")) {
        setPasswordError("Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.")
      } else if (errorMessage.includes("Load failed") || errorMessage.includes("Failed to fetch")) {
        setPasswordError("Verbindungsfehler. Bitte versuchen Sie es erneut.")
      } else {
        setPasswordError(`Fehler beim Ändern des Passworts: ${errorMessage}`)
      }
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleCancel = () => {
    setEditData(userData || {})
    setIsEditing(false)
  }

  const openDeleteDialog = () => {
    setShowDeleteDialog(true)
    setDeletePassword("")
    setDeleteError("")
  }

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false)
    setDeletePassword("")
    setDeleteError("")
  }

  const openPasswordDialog = () => {
    setShowPasswordDialog(true)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setPasswordError("")
  }

  const closePasswordDialog = () => {
    setShowPasswordDialog(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setPasswordError("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Lade Benutzerprofil...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full">
              <CardContent className="text-center p-8">
                <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-red-700 mb-2">Fehler</h2>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={onClose} className="bg-red-600 hover:bg-red-700">
                  Zurück
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-lg border-b-4 border-orange-500 flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Mein Profil</h1>
                  <p className="text-gray-600">Verwalten Sie Ihre Kontodaten</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-orange-500 hover:bg-orange-600">
                    <Edit className="w-4 h-4 mr-2" />
                    Bearbeiten
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? "Speichere..." : "Speichern"}
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Abbrechen
                    </Button>
                  </div>
                )}

                <Button onClick={onClose} variant="outline" className="bg-red-500 hover:bg-red-600 text-white">
                  <X className="w-4 h-4 mr-2" />
                  Schließen
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50">
          <div className="px-6 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* User Info */}
                <div className="xl:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2 text-orange-600" />
                        Persönliche Daten
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Vorname</Label>
                          {isEditing ? (
                            <Input
                              id="firstName"
                              value={editData.first_name || ""}
                              onChange={(e) => setEditData((prev) => ({ ...prev, first_name: e.target.value }))}
                              className="bg-white"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{userData?.first_name}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nachname</Label>
                          {isEditing ? (
                            <Input
                              id="lastName"
                              value={editData.last_name || ""}
                              onChange={(e) => setEditData((prev) => ({ ...prev, last_name: e.target.value }))}
                              className="bg-white"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{userData?.last_name}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>E-Mail</Label>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <p className="p-2 bg-gray-100 rounded flex-1 text-gray-600">{userData?.email}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">E-Mail kann nicht geändert werden</p>
                      </div>

                      <div>
                        <Label htmlFor="phone">Telefon</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={editData.phone || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                            className="bg-white"
                            placeholder="+41 XX XXX XX XX"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <p className="p-2 bg-gray-50 rounded flex-1">{userData?.phone}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-orange-600" />
                        Adresse
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="address">Straße und Hausnummer</Label>
                        {isEditing ? (
                          <Input
                            id="address"
                            value={editData.address || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, address: e.target.value }))}
                            className="bg-white"
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{userData?.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="postalCode">PLZ</Label>
                          {isEditing ? (
                            <Input
                              id="postalCode"
                              value={editData.postal_code || ""}
                              onChange={(e) => setEditData((prev) => ({ ...prev, postal_code: e.target.value }))}
                              className="bg-white"
                              placeholder="1234"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{userData?.postal_code}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="city">Stadt</Label>
                          {isEditing ? (
                            <Input
                              id="city"
                              value={editData.city || ""}
                              onChange={(e) => setEditData((prev) => ({ ...prev, city: e.target.value }))}
                              className="bg-white"
                            />
                          ) : (
                            <p className="p-2 bg-gray-50 rounded">{userData?.city}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="canton">Kanton</Label>
                        {isEditing ? (
                          <Input
                            id="canton"
                            value={editData.canton || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, canton: e.target.value }))}
                            className="bg-white"
                            placeholder="z.B. Zürich, Bern, Basel..."
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded">{userData?.canton}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="notes">Anmerkungen</Label>
                        {isEditing ? (
                          <Textarea
                            id="notes"
                            value={editData.notes || ""}
                            onChange={(e) => setEditData((prev) => ({ ...prev, notes: e.target.value }))}
                            className="bg-white"
                            rows={3}
                            placeholder="Besondere Lieferhinweise..."
                          />
                        ) : (
                          <p className="p-2 bg-gray-50 rounded min-h-[80px]">
                            {userData?.notes || "Keine Anmerkungen"}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* PASSWORD CHANGE SECTION */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-blue-600">
                        <Lock className="w-5 h-5 mr-2" />
                        Passwort ändern
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-blue-700">
                          Ändern Sie Ihr Passwort regelmäßig, um Ihr Konto zu schützen.
                        </p>
                        <Button onClick={openPasswordDialog} className="bg-blue-600 hover:bg-blue-700 w-full" size="lg">
                          <Lock className="w-4 h-4 mr-2" />
                          Passwort ändern
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* DANGER ZONE */}
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                      <CardTitle className="flex items-center text-red-600">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Konto löschen
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm text-red-700">
                          <strong>Achtung:</strong> Das Löschen Ihres Kontos ist unwiderruflich. Alle Ihre Daten werden
                          permanent entfernt.
                        </p>
                        <Button
                          onClick={openDeleteDialog}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700 w-full"
                          size="lg"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Mein Konto löschen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats and Orders */}
                <div className="space-y-6">
                  {/* Account Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-orange-600" />
                        Konto-Übersicht
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{orderStats?.total_orders || 0}</div>
                        <p className="text-sm text-gray-600">Bestellungen</p>
                      </div>

                      <Separator />

                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {(Number(orderStats?.total_spent) || 0).toFixed(2)} CHF
                        </div>
                        <p className="text-sm text-gray-600">Gesamtausgaben</p>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Mitglied seit</span>
                        </div>
                        <p className="text-sm font-medium">{formatDate(userData?.created_at || "")}</p>
                      </div>

                      {orderStats?.last_order_date && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Letzte Bestellung</span>
                          </div>
                          <p className="text-sm font-medium">{formatDate(orderStats.last_order_date)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Package className="w-5 h-5 mr-2 text-orange-600" />
                        Letzte Bestellungen
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                          {recentOrders.map((order) => (
                            <div key={order.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{order.order_number}</span>
                                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{formatDate(order.created_at)}</span>
                                <span className="font-medium text-orange-600">
                                  {(Number(order.total_amount) || 0).toFixed(2)} CHF
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>Noch keine Bestellungen</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Dialog */}
        {showDeleteDialog && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-red-600">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Konto löschen
                </DialogTitle>
                <DialogDescription>
                  Diese Aktion kann nicht rückgängig gemacht werden. Ihr Konto und alle damit verbundenen Daten werden
                  permanent gelöscht.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Folgende Daten werden gelöscht:</strong>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>Ihr Benutzerkonto und Profil</li>
                      <li>Alle Bestellungen und Bestellhistorie</li>
                      <li>Warenkorb und Favoriten</li>
                      <li>Alle Sitzungen und Anmeldedaten</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="deletePassword">Passwort zur Bestätigung</Label>
                  <Input
                    id="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Geben Sie Ihr Passwort ein"
                    className="bg-white"
                  />
                  {deleteError && <p className="text-sm text-red-600 mt-1">{deleteError}</p>}
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button onClick={closeDeleteDialog} variant="outline" className="w-full sm:w-auto">
                  Abbrechen
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || !deletePassword.trim()}
                  variant="destructive"
                  className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Lösche Konto..." : "Konto endgültig löschen"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Change Password Dialog */}
        {showPasswordDialog && (
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-blue-600">
                  <Lock className="w-5 h-5 mr-2" />
                  Passwort ändern
                </DialogTitle>
                <DialogDescription>
                  Geben Sie Ihr aktuelles Passwort ein und wählen Sie ein neues sicheres Passwort.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Ihr aktuelles Passwort"
                    className="bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">Neues Passwort</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Mindestens 8 Zeichen"
                    className="bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmNewPassword">Neues Passwort bestätigen</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Neues Passwort wiederholen"
                    className="bg-white"
                  />
                </div>

                {passwordError && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-600">{passwordError}</AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Passwort-Anforderungen:</strong>
                    <ul className="list-disc list-inside mt-2 text-sm">
                      <li>Mindestens 8 Zeichen lang</li>
                      <li>Unterschiedlich vom aktuellen Passwort</li>
                      <li>Verwenden Sie eine Kombination aus Buchstaben, Zahlen und Symbolen</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button onClick={closePasswordDialog} variant="outline" className="w-full sm:w-auto">
                  Abbrechen
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={
                    isChangingPassword || !passwordData.currentPassword.trim() || !passwordData.newPassword.trim()
                  }
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isChangingPassword ? "Ändere Passwort..." : "Passwort ändern"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
