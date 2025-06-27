"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Flame, Zap, Home, ChefHat, Heart, Menu, X, Shield, Eye, EyeOff, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onAdminOpen: () => void
}

// Componente personalizado para icono de chili
const ChiliIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M12 2c0 0 2 1 2 3" stroke="currentColor" fill="none" />
      <path
        d="M10 5c-2 0-4 2-4 5s1 6 2 8c1 2 3 3 4 3s3-1 4-3c1-2 2-5 2-8s-2-5-4-5c-1 0-2 0-4 0z"
        fill="currentColor"
        opacity="0.8"
      />
      <path d="M11 8c0 2 0 4 1 6" stroke="white" strokeWidth="1" opacity="0.3" />
      <path d="M13 9c0 1.5 0 3 1 4" stroke="white" strokeWidth="1" opacity="0.2" />
      <circle cx="16" cy="7" r="0.5" fill="orange" opacity="0.8" />
      <circle cx="18" cy="9" r="0.3" fill="red" opacity="0.6" />
      <circle cx="17" cy="11" r="0.4" fill="orange" opacity="0.7" />
    </svg>
  </div>
)

// Componente personalizado para icono de BBQ
const BBQIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <rect x="3" y="11" width="18" height="8" rx="2" />
      <line x1="6" y1="11" x2="6" y2="19" />
      <line x1="10" y1="11" x2="10" y2="19" />
      <line x1="14" y1="11" x2="14" y2="19" />
      <line x1="18" y1="11" x2="18" y2="19" />
      <ellipse cx="12" cy="8" rx="4" ry="2" fill="currentColor" opacity="0.7" />
      <path d="M8 5c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" opacity="0.5" />
      <path d="M14 4c0-1 1-2 2-2s2 1 2 2-1 2-2 2-2-1-2-2z" opacity="0.5" />
    </svg>
  </div>
)

export function Header({ onAdminOpen }: HeaderProps) {
  // Estados del header y navegación
  const [showHeader, setShowHeader] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentSection, setCurrentSection] = useState("hero")
  
  // Estados del sistema de admin
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminProfile, setAdminProfile] = useState({
    email: "",
    loginTime: "",
    sessionDuration: ""
  })

  // Estado para debug - esto nos ayudará a ver qué está pasando
  const [debugInfo, setDebugInfo] = useState({
    envEmailExists: false,
    envPasswordExists: false,
    localStorageWorks: false,
    savedSessionExists: false,
    credentialsMatch: false
  })

  // Función para comprobar el estado del sistema
  const checkSystemStatus = () => {
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    
    // Verificar si localStorage funciona
    let localStorageWorking = false
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      localStorageWorking = true
    } catch (e) {
      localStorageWorking = false
    }

    // Verificar si existe sesión guardada
    const savedSession = localStorage.getItem("admin-login-state") // Usar la clave original del usuario
    
    const debugStatus = {
      envEmailExists: !!adminEmail,
      envPasswordExists: !!adminPassword,
      localStorageWorks: localStorageWorking,
      savedSessionExists: !!savedSession,
      credentialsMatch: false
    }

    setDebugInfo(debugStatus)

    // Log detallado para debugging
    console.log("🔍 SISTEMA DE LOGIN - ESTADO COMPLETO:")
    console.log("Email de admin desde env:", adminEmail ? "✅ Definido" : "❌ No definido")
    console.log("Password de admin desde env:", adminPassword ? "✅ Definido" : "❌ No definido")
    console.log("localStorage funciona:", localStorageWorking ? "✅ Sí" : "❌ No")
    console.log("Sesión guardada existe:", savedSession ? "✅ Sí" : "❌ No")
    if (savedSession) {
      console.log("Contenido de sesión guardada:", savedSession)
    }

    return { adminEmail, adminPassword, savedSession }
  }

  // Función para calcular la duración de sesión
  const calculateSessionDuration = (loginTimestamp: string) => {
    const now = new Date().getTime()
    const loginTime = new Date(loginTimestamp).getTime()
    const diffInMinutes = Math.floor((now - loginTime) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutos`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `${hours} horas`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `${days} días`
    }
  }

  // Función para cargar el estado de login guardado - MEJORADA CON DEBUG
  const loadSavedLoginState = () => {
    try {
      console.log("🔄 Intentando cargar estado de login guardado...")
      
      // Usar la clave original del usuario
      const savedLoginState = localStorage.getItem("admin-login-state")
      console.log("📁 Contenido de localStorage:", savedLoginState)
      
      if (savedLoginState) {
        const loginState = JSON.parse(savedLoginState)
        console.log("📋 Estado parseado:", loginState)
        
        if (loginState.isLoggedIn && loginState.timestamp && loginState.email) {
          // Verificar si la sesión sigue siendo válida (7 días)
          const now = new Date().getTime()
          const loginTime = new Date(loginState.timestamp).getTime()
          const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24)
          
          console.log("⏰ Días desde login:", daysDiff)
          
          if (daysDiff < 7) {
            // Sesión válida, restaurar estado
            console.log("✅ Sesión válida, restaurando estado...")
            setIsLoggedIn(true)
            setAdminProfile({
              email: loginState.email,
              loginTime: new Date(loginState.timestamp).toLocaleString('es-ES'),
              sessionDuration: calculateSessionDuration(loginState.timestamp)
            })
            console.log("🎉 Sesión restaurada exitosamente")
            return true
          } else {
            console.log("❌ Sesión expirada, limpiando localStorage")
            localStorage.removeItem("admin-login-state")
          }
        } else {
          console.log("❌ Datos de sesión incompletos")
        }
      } else {
        console.log("❌ No hay sesión guardada")
      }
      return false
    } catch (error) {
      console.error("💥 Error cargando estado de login:", error)
      localStorage.removeItem("admin-login-state")
      return false
    }
  }

  // Función para guardar el estado de login - MEJORADA
  const saveLoginState = (email: string, timestamp: string) => {
    try {
      const loginState = {
        isLoggedIn: true,
        email: email,
        timestamp: timestamp,
        version: "2.0" // Incrementar versión
      }
      // Usar la clave original del usuario
      localStorage.setItem("admin-login-state", JSON.stringify(loginState))
      console.log("💾 Estado de login guardado:", loginState)
    } catch (error) {
      console.error("💥 Error guardando estado de login:", error)
    }
  }

  // Efecto para inicializar el sistema
  useEffect(() => {
    console.log("🚀 Iniciando sistema de login...")
    
    // Verificar estado del sistema
    const systemStatus = checkSystemStatus()
    
    // Intentar cargar sesión guardada
    loadSavedLoginState()
    
    // Si no hay variables de entorno, mostrar warning
    if (!systemStatus.adminEmail || !systemStatus.adminPassword) {
      console.warn("⚠️ ADVERTENCIA: Variables de entorno no definidas")
      console.warn("Necesitas definir NEXT_PUBLIC_ADMIN_EMAIL y NEXT_PUBLIC_ADMIN_PASSWORD en tu archivo .env")
    }
  }, [])

  // Efecto para actualizar la duración de sesión cada minuto
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        const savedState = localStorage.getItem("admin-login-state")
        if (savedState) {
          try {
            const loginState = JSON.parse(savedState)
            setAdminProfile(prev => ({
              ...prev,
              sessionDuration: calculateSessionDuration(loginState.timestamp)
            }))
          } catch (error) {
            console.error("Error actualizando duración de sesión:", error)
          }
        }
      }, 60000) // Actualizar cada minuto

      return () => clearInterval(interval)
    }
  }, [isLoggedIn])

  // Secciones con fondo claro
  const lightSections = ["premium-showcase", "offers"]
  const isLightSection = lightSections.includes(currentSection)

  // Detecta la sección actual basada en el scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Lógica para ocultar/mostrar header
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowHeader(false)
      } else {
        setShowHeader(true)
      }
      setLastScrollY(currentScrollY)

      // Detectar sección actual
      const sections = ["hero", "premium-showcase", "offers", "recipes", "pairing"]
      const sectionElements = sections.map((id) => ({
        id,
        element: document.getElementById(id),
        offset: document.getElementById(id)?.offsetTop || 0,
      }))

      const currentSectionId =
        sectionElements.find((section, index) => {
          const nextSection = sectionElements[index + 1]
          const sectionTop = section.offset - 100 // Offset para el header
          const sectionBottom = nextSection ? nextSection.offset - 100 : Number.POSITIVE_INFINITY

          return currentScrollY >= sectionTop && currentScrollY < sectionBottom
        })?.id || "hero"

      setCurrentSection(currentSectionId)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsMenuOpen(false)
    }
  }

  // Función mejorada para manejar el login - CON MEJOR DEBUG Y FALLBACK
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError("")

    console.log("🔐 Iniciando proceso de login...")

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

    console.log("📋 Credenciales desde .env:")
    console.log("Email:", adminEmail ? "✅ Definido" : "❌ No definido")
    console.log("Password:", adminPassword ? "✅ Definido" : "❌ No definido")
    console.log("Email ingresado:", loginData.email)
    console.log("Password ingresado:", loginData.password ? "✅ Ingresado" : "❌ Vacío")

    // Simular delay de autenticación
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Verificar credenciales con fallback para testing
    let credentialsValid = false

    if (adminEmail && adminPassword) {
      // Usar variables de entorno si están disponibles
      credentialsValid = (loginData.email === adminEmail && loginData.password === adminPassword)
      console.log("🔍 Verificando con variables de entorno:", credentialsValid ? "✅ Válidas" : "❌ Inválidas")
    } else {
      // Fallback para testing si no hay variables de entorno
      console.log("⚠️ Variables de entorno no disponibles, usando credenciales de prueba")
      credentialsValid = (
        loginData.email === "admin@hotbbq.com" && 
        loginData.password === "admin123"
      )
      console.log("🔍 Verificando con credenciales de prueba:", credentialsValid ? "✅ Válidas" : "❌ Inválidas")
    }

    // Actualizar debug info
    setDebugInfo(prev => ({ ...prev, credentialsMatch: credentialsValid }))

    if (credentialsValid) {
      const loginTime = new Date()
      const loginTimestamp = loginTime.toISOString()
      
      console.log("🎉 Login exitoso!")
      
      // Establecer estado de login
      setIsLoggedIn(true)
      setIsLoginOpen(false)

      // Establecer datos del perfil
      const profileData = {
        email: loginData.email,
        loginTime: loginTime.toLocaleString('es-ES'),
        sessionDuration: "Recién iniciada"
      }
      setAdminProfile(profileData)

      // Guardar estado si "recordar" está marcado
      if (rememberMe) {
        console.log("💾 Guardando sesión para recordar...")
        saveLoginState(loginData.email, loginTimestamp)
      } else {
        console.log("🚫 No se guardará la sesión (recordar no marcado)")
      }

      // Limpiar formulario
      setLoginData({ email: "", password: "" })
      setRememberMe(false)
      
      // Llamar a la función de admin (abrir panel)
      console.log("🚀 Llamando onAdminOpen")
      onAdminOpen()
    } else {
      console.log("❌ Credenciales incorrectas")
      setLoginError("Email o contraseña incorrectos")
    }

    setIsLoggingIn(false)
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    console.log("🚪 Cerrando sesión...")
    setIsLoggedIn(false)
    setLoginData({ email: "", password: "" })
    setAdminProfile({ email: "", loginTime: "", sessionDuration: "" })
    localStorage.removeItem("admin-login-state")
    console.log("✅ Sesión cerrada")
  }

  // Función para ver perfil
  const handleViewProfile = () => {
    setIsProfileOpen(true)
  }

  const navItems = [
    {
      id: "hero",
      label: "Startseite",
      icon: Home,
      description: "Zur Hauptseite",
    },
    {
      id: "offers",
      label: "Scharfe Saucen",
      icon: ChiliIcon,
      description: "Feurige Saucen",
    },
    {
      id: "recipes",
      label: "Rezepte",
      icon: ChefHat,
      description: "Grillrezepte",
    },
    {
      id: "pairing",
      label: "Food Pairing",
      icon: Heart,
      description: "Perfekte Kombinationen",
    },
  ]

  // Estilos dinámicos basados en la sección actual
  const headerStyles = isLightSection
    ? "bg-black/80 backdrop-blur-2xl border-b border-gray-800/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    : "bg-white/5 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"

  const menuStyles = isLightSection
    ? "bg-black/90 backdrop-blur-2xl border-r border-gray-800/50 shadow-2xl"
    : "bg-black/40 backdrop-blur-2xl border-r border-white/10 shadow-2xl"

  const textColor = isLightSection ? "text-white" : "text-gray-300"
  const textColorHover = isLightSection ? "hover:text-gray-200" : "hover:text-white"

  // Componente del botón de administrador mejorado
  const AdminButton = () => {
    console.log("🔄 Renderizando AdminButton, isLoggedIn:", isLoggedIn)
    
    return (
      <>
        {isLoggedIn ? (
          // Menú desplegable cuando está logueado
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`relative p-2.5 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                  isLightSection
                    ? "bg-green-500/20 hover:bg-green-500/30 text-white border-green-400/50 hover:border-green-400/70"
                    : "bg-green-500/10 hover:bg-green-500/20 text-white border-green-400/30 hover:border-green-400/50"
                }`}
                title="Menú de Administrador - Sesión Activa"
              >
                <Shield className="w-4 h-4 text-green-400 transition-colors" />
                {/* Indicador de sesión activa */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl"
              align="end"
              sideOffset={5}
            >
              {/* Header del menú */}
              <div className="px-4 py-3 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Administrador</p>
                    <p className="text-xs text-gray-500 truncate max-w-40">{adminProfile.email}</p>
                  </div>
                </div>
              </div>

              {/* Opciones del menú */}
              <DropdownMenuItem 
                onClick={handleViewProfile}
                className="px-4 py-3 cursor-pointer hover:bg-gray-50/80 transition-colors focus:bg-gray-50/80"
              >
                <User className="w-4 h-4 mr-3 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Ver Perfil</p>
                  <p className="text-xs text-gray-500">Información de la sesión</p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={onAdminOpen}
                className="px-4 py-3 cursor-pointer hover:bg-gray-50/80 transition-colors focus:bg-gray-50/80"
              >
                <Settings className="w-4 h-4 mr-3 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Panel Admin</p>
                  <p className="text-xs text-gray-500">Gestión del sitio</p>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-200/50" />

              <DropdownMenuItem 
                onClick={handleLogout}
                className="px-4 py-3 cursor-pointer hover:bg-red-50/80 transition-colors focus:bg-red-50/80"
              >
                <LogOut className="w-4 h-4 mr-3 text-red-500" />
                <div className="flex-1">
                  <p className="font-medium text-red-600">Cerrar Sesión</p>
                  <p className="text-xs text-red-400">Salir del panel admin</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // Botón de login cuando no está logueado
          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`relative p-2.5 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                  isLightSection
                    ? "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-orange-400/50"
                    : "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-orange-400/30"
                }`}
                title="Iniciar Sesión Admin"
              >
                <Shield className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <h2 className="text-3xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent tracking-tight leading-none">
                    Admin Login
                  </h2>
                </DialogTitle>
              </DialogHeader>

              {/* Panel de Debug INFO - Solo visible cuando hay problemas */}
              {(!debugInfo.envEmailExists || !debugInfo.envPasswordExists) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="text-yellow-800 font-medium mb-2">⚠️ Info de Debug:</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-yellow-700">
                      Variables de entorno: {debugInfo.envEmailExists && debugInfo.envPasswordExists ? "✅" : "❌"}
                    </p>
                    <p className="text-yellow-700">
                      localStorage: {debugInfo.localStorageWorks ? "✅" : "❌"}
                    </p>
                    <p className="text-yellow-700">
                      Sesión guardada: {debugInfo.savedSessionExists ? "✅" : "❌"}
                    </p>
                    {(!debugInfo.envEmailExists || !debugInfo.envPasswordExists) && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <p className="text-blue-800 text-xs font-medium">Credenciales de prueba:</p>
                        <p className="text-blue-600 text-xs">Email: admin@hotbbq.com</p>
                        <p className="text-blue-600 text-xs">Password: admin123</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder={debugInfo.envEmailExists ? "Tu email de admin" : "admin@hotbbq.com"}
                    required
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder="••••••••"
                      required
                      className="bg-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Recordar por 7 días
                  </Label>
                </div>

                {loginError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{loginError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de Perfil de Administrador */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Perfil de Administrador
                </h2>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Información del usuario */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-green-500 rounded-full">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Administrador Activo</h3>
                    <p className="text-sm text-gray-600">Sesión verificada y segura</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <span className="text-sm text-gray-800 font-mono">{adminProfile.email}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                    <span className="text-sm font-medium text-gray-600">Último acceso:</span>
                    <span className="text-sm text-gray-800">{adminProfile.loginTime}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm font-medium text-gray-600">Duración de sesión:</span>
                    <span className="text-sm text-gray-800">{adminProfile.sessionDuration}</span>
                  </div>
                </div>
              </div>

              {/* Información de debug del sistema */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200/50">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-gray-600" />
                  Estado del Sistema
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center p-2 bg-white/50 rounded-lg">
                    <p className="text-gray-600">Variables ENV</p>
                    <p className={`font-semibold ${debugInfo.envEmailExists && debugInfo.envPasswordExists ? "text-green-600" : "text-yellow-600"}`}>
                      {debugInfo.envEmailExists && debugInfo.envPasswordExists ? "✅ OK" : "⚠️ Fallback"}
                    </p>
                  </div>
                  <div className="text-center p-2 bg-white/50 rounded-lg">
                    <p className="text-gray-600">localStorage</p>
                    <p className={`font-semibold ${debugInfo.localStorageWorks ? "text-green-600" : "text-red-600"}`}>
                      {debugInfo.localStorageWorks ? "✅ OK" : "❌ Error"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => setIsProfileOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    setIsProfileOpen(false)
                    onAdminOpen()
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                >
                  Ir al Panel Admin
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-50
        ${headerStyles}
        transform transition-all duration-500 ease-out
        ${showHeader ? "translate-y-0" : "-translate-y-full"}
        ${
          isLightSection
            ? "before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-500/10 before:via-red-500/10 before:to-orange-500/10 before:pointer-events-none"
            : "before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-500/5 before:via-red-500/5 before:to-orange-500/5 before:pointer-events-none"
        }
      `}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Admin Button Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500 scale-110"></div>
              <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 p-4 rounded-2xl shadow-2xl border border-white/20">
                <Flame className="w-7 h-7 text-white drop-shadow-lg" />
                <Zap className="w-3 h-3 text-yellow-200 absolute -top-1 -right-1 animate-pulse drop-shadow-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent tracking-tight leading-none">
                HOT & BBQ
              </h1>
              <p
                className={`text-xs font-medium tracking-wider uppercase ${isLightSection ? "text-gray-300" : "text-gray-400"}`}
              >
                Authentische Grillkultur
              </p>
            </div>
            {/* Admin Button - Al lado del logo en desktop */}
            <div className="ml-4"> 
              <AdminButton />
            </div>
          </div>

          {/* Mobile Layout - Todos los botones a la izquierda */}
          <div className="lg:hidden flex items-center justify-between w-full">
            {/* Logo + Admin Button + Menu Button (todos a la izquierda) */}
            <div className="flex items-center space-x-3">
              {/* Logo Mobile */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-xl border border-white/20">
                  <Flame className="w-6 h-6 text-white" />
                  <Zap className="w-2 h-2 text-yellow-200 absolute -top-0.5 -right-0.5 animate-pulse" />
                </div>
              </div>

              {/* Admin Button - Al lado del logo */}
              <AdminButton />

              {/* Menu Button - También a la izquierda, al lado del admin */}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`relative p-2.5 rounded-xl border transition-all duration-300 backdrop-blur-sm ${
                      isLightSection
                        ? "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-orange-400/50"
                        : "bg-white/5 hover:bg-white/10 text-white border-white/10 hover:border-orange-400/30"
                    }`}
                  >
                    <Menu className="w-4 h-4" />
                    <span className="sr-only">Menü öffnen</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className={`w-80 ${menuStyles}`}>
                  {/* Todo el contenido del menú permanece igual */}
                  <div
                    className={`absolute inset-0 pointer-events-none ${
                      isLightSection
                        ? "bg-gradient-to-b from-orange-500/10 via-transparent to-red-500/10"
                        : "bg-gradient-to-b from-orange-500/5 via-transparent to-red-500/5"
                    }`}
                  ></div>

                  <SheetHeader
                    className={`relative pb-6 mb-8 ${
                      isLightSection ? "border-b border-gray-700/50" : "border-b border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-xl">
                            <Flame className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div>
                          <SheetTitle className="text-xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent">
                            HOT & BBQ
                          </SheetTitle>
                          <p className={`text-xs font-medium ${isLightSection ? "text-gray-300" : "text-gray-400"}`}>
                            Authentische Grillkultur
                          </p>
                        </div>
                      </div>
                      <SheetClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`rounded-xl transition-all duration-300 ${
                            isLightSection
                              ? "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                              : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetHeader>

                  <nav className="space-y-2 relative">
                    {navItems.map((item, index) => {
                      const IconComponent = item.icon
                      const isActive = currentSection === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full group relative flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 overflow-hidden ${
                            isActive
                              ? "text-white bg-gradient-to-r from-orange-500/20 to-red-500/20"
                              : `${textColor} ${textColorHover}`
                          }`}
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div
                            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl ${
                              isLightSection ? "bg-white/10" : "bg-white/5"
                            }`}
                          ></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"></div>

                          <div
                            className={`relative z-10 p-2 rounded-xl transition-all duration-300 flex items-center justify-center w-10 h-10 ${
                              isActive
                                ? "bg-orange-500/30"
                                : isLightSection
                                  ? "bg-white/10 group-hover:bg-orange-500/20"
                                  : "bg-white/5 group-hover:bg-orange-500/20"
                            }`}
                          >
                            <div className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-all duration-300">
                              {typeof IconComponent === "function" && IconComponent.name === "ChiliIcon" ? (
                                <ChiliIcon className="w-5 h-5" />
                              ) : typeof IconComponent === "function" && IconComponent.name === "BBQIcon" ? (
                                <BBQIcon className="w-5 h-5" />
                              ) : (
                                <IconComponent className="w-5 h-5" />
                              )}
                            </div>
                          </div>

                          <div className="relative z-10 flex-1">
                            <span className="font-semibold tracking-wide block">{item.label}</span>
                            <span className={`text-xs block ${isLightSection ? "text-gray-300" : "text-gray-400"}`}>
                              {item.description}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </nav>

                  {/* Footer Info */}
                  <div className="absolute bottom-8 left-6 right-6">
                    <div
                      className={`relative backdrop-blur-sm rounded-2xl p-5 border overflow-hidden ${
                        isLightSection ? "bg-white/10 border-gray-700/50" : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10"></div>
                      <div className="relative z-10 text-center">
                        <div className="flex justify-center space-x-2 mb-3">
                          <div className="w-6 h-6 text-orange-400">
                            <BBQIcon />
                          </div>
                          <div className="w-6 h-6 text-red-400">
                            <ChiliIcon />
                          </div>
                        </div>
                        <p className={`text-sm font-medium ${isLightSection ? "text-gray-200" : "text-gray-300"}`}>
                          Die besten scharfen Saucen
                        </p>
                        <p className={`text-xs mt-1 ${isLightSection ? "text-gray-300" : "text-gray-400"}`}>
                          und Premium BBQ-Produkte
                        </p>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Espacio vacío a la derecha para balance visual */}
            <div></div>
          </div>

          {/* Navigation Desktop - Ahora centrado */}
          <nav className="hidden lg:flex items-center space-x-2 flex-1 justify-center">
            {navItems.map((item) => {
              const IconComponent = item.icon
              const isActive = currentSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`group relative flex items-center space-x-3 px-5 py-3 rounded-2xl transition-all duration-300 overflow-hidden ${
                    isActive
                      ? "text-white bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30"
                      : `${textColor} ${textColorHover}`
                  }`}
                  title={item.description}
                >
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl ${
                      isLightSection ? "bg-white/10" : "bg-white/5"
                    }`}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"></div>

                  <div className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-all duration-300 relative z-10">
                    {typeof IconComponent === "function" && IconComponent.name === "ChiliIcon" ? (
                      <ChiliIcon className="w-4 h-4" />
                    ) : typeof IconComponent === "function" && IconComponent.name === "BBQIcon" ? (
                      <BBQIcon className="w-4 h-4" />
                    ) : (
                      <IconComponent className="w-4 h-4" />
                    )}
                  </div>

                  <span className="font-semibold text-sm relative z-10 tracking-wide">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Espacio vacío a la derecha en desktop para mantener balance visual */}
          <div className="hidden lg:block w-16"></div>
        </div>
      </div>

      {/* Modern Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-400/50 to-transparent">
        <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
      </div>
    </header>
  )
}