"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

type MobileTrigger =
  | "visibilitychange" // Quand l'utilisateur quitte l'onglet/app
  | "timer" // Après X secondes sur la page
  | "scroll-depth" // Après avoir scrollé X% de la page
  | "inactivity" // Après X secondes d'inactivité
  | "scroll-bounce" // Tentative de scroll au-delà du haut de page
  | "combined" // Combinaison de plusieurs critères

interface ExitIntentPopupProps {
  title?: string
  description?: string
  buttonText?: string
  sensitivity?: number
  showOnce?: boolean
  // Options pour écrans tactiles
  mobileTrigger?: MobileTrigger
  mobileTimerDelay?: number // En millisecondes (défaut: 30000 = 30s)
  mobileScrollDepth?: number // En pourcentage (défaut: 50%)
  mobileInactivityDelay?: number // En millisecondes (défaut: 15000 = 15s)
}

export function ExitIntentPopup({
  title = "Attendez ! Restez informé(e)",
  description = "Inscrivez-vous à notre newsletter et recevez nos actualités directement dans votre boîte mail.",
  buttonText = "S'inscrire à la newsletter",
  sensitivity = 20,
  showOnce = true,
  mobileTrigger = "scroll-depth",
  mobileTimerDelay = 30000,
  mobileScrollDepth = 50,
  mobileInactivityDelay = 15000,
}: ExitIntentPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    accepteConditions: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // Refs pour suivre l'état mobile
  const scrollRef = useRef({ lastY: 0, ticking: false })
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      accepteConditions: checked,
    }))
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Detect exit intent when mouse moves to top of viewport
      if (e.clientY <= sensitivity && e.movementY < 0) {
        if (showOnce && hasShown) return

        const alreadyShown = sessionStorage.getItem("exitPopupShown")
        if (showOnce && alreadyShown) return

        setIsOpen(true)
        setHasShown(true)
        if (showOnce) {
          sessionStorage.setItem("exitPopupShown", "true")
        }
      }
    },
    [sensitivity, showOnce, hasShown]
  )

  // Fonction helper pour vérifier si le popup peut être affiché
  const canShowPopup = useCallback(() => {
    if (showOnce && hasShown) return false
    const alreadyShown = sessionStorage.getItem("exitPopupShown")
    if (showOnce && alreadyShown) return false
    return true
  }, [showOnce, hasShown])

  // Fonction helper pour afficher le popup
  const showPopup = useCallback(() => {
    if (!canShowPopup()) return
    setIsOpen(true)
    setHasShown(true)
    if (showOnce) {
      sessionStorage.setItem("exitPopupShown", "true")
    }
  }, [canShowPopup, showOnce])

  useEffect(() => {
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0
    const cleanupFunctions: (() => void)[] = []

    // Desktop: Exit intent via mouse movement
    document.addEventListener("mousemove", handleMouseMove)
    cleanupFunctions.push(() => document.removeEventListener("mousemove", handleMouseMove))

    // Mobile: Different trigger strategies
    if (isMobile) {
      const isCombined = mobileTrigger === "combined"

      // 1. VISIBILITYCHANGE - Quand l'utilisateur quitte l'onglet/app
      if (mobileTrigger === "visibilitychange" || isCombined) {
        const handleVisibilityChange = () => {
          if (document.visibilityState === "hidden") {
            showPopup()
          }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange)
        cleanupFunctions.push(() =>
          document.removeEventListener("visibilitychange", handleVisibilityChange)
        )
      }

      // 2. TIMER - Après X secondes sur la page
      if (mobileTrigger === "timer" || isCombined) {
        const timer = setTimeout(() => {
          showPopup()
        }, mobileTimerDelay)
        cleanupFunctions.push(() => clearTimeout(timer))
      }

      // 3. SCROLL DEPTH - Après avoir scrollé X% de la page
      if (mobileTrigger === "scroll-depth" || isCombined) {
        const handleScroll = () => {
          const scrollTop = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          const scrollPercent = (scrollTop / docHeight) * 100

          if (scrollPercent >= mobileScrollDepth) {
            showPopup()
          }
        }
        window.addEventListener("scroll", handleScroll, { passive: true })
        cleanupFunctions.push(() => window.removeEventListener("scroll", handleScroll))
      }

      // 4. INACTIVITY - Après X secondes d'inactivité
      if (mobileTrigger === "inactivity" || isCombined) {
        const resetInactivityTimer = () => {
          lastActivityRef.current = Date.now()
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current)
          }
          inactivityTimerRef.current = setTimeout(() => {
            showPopup()
          }, mobileInactivityDelay)
        }

        const events = ["touchstart", "touchmove", "scroll"]
        events.forEach((event) => {
          window.addEventListener(event, resetInactivityTimer, { passive: true })
        })
        resetInactivityTimer()

        cleanupFunctions.push(() => {
          events.forEach((event) => {
            window.removeEventListener(event, resetInactivityTimer)
          })
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current)
          }
        })
      }

      // 5. SCROLL BOUNCE - Tentative de scroll au-delà du haut de page
      if (mobileTrigger === "scroll-bounce" || isCombined) {
        let scrollAttempts = 0
        const handleScrollBounce = () => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop

          // Si on est tout en haut (ou presque)
          if (scrollTop <= 10) {
            scrollAttempts++
            // Si plusieurs tentatives de scroll alors qu'on est en haut
            if (scrollAttempts >= 3) {
              showPopup()
              scrollAttempts = 0
            }
          } else {
            scrollAttempts = 0
          }
        }

        window.addEventListener("scroll", handleScrollBounce, { passive: true })
        cleanupFunctions.push(() => window.removeEventListener("scroll", handleScrollBounce))
      }
    }

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [
    handleMouseMove,
    showPopup,
    mobileTrigger,
    mobileTimerDelay,
    mobileScrollDepth,
    mobileInactivityDelay,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      setSubmitStatus("error")
      setErrorMessage("Veuillez entrer une adresse email valide.")
      return
    }

    if (!formData.accepteConditions) {
      setSubmitStatus("error")
      setErrorMessage("Vous devez accepter de donner vos informations personnelles pour continuer.")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de l'inscription")
      }

      setSubmitStatus("success")
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        accepteConditions: false,
      })

      // Close popup after 3 seconds on success
      setTimeout(() => {
        setIsOpen(false)
      }, 3000)
    } catch (error) {
      console.error("Error submitting form:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="md:max-w-[50vw] md:max-h-[80vh] border-none overflow-hidden p-0">
        <div className="bg-black px-6 text-primary-foreground">
          <div className="mx-auto flex items-center justify-center rounded-full">
            <Image alt="Logo Café citoyen" src="/logo-cafe-citoyen.png" width={100} height={104} fetchPriority="high"/>
          </div>
        </div>
        <div className="px-6">
          <DialogHeader className="space-y-3 mb-6">
            <DialogTitle className="text-center text-2xl uppercase text-black">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center text-black/90 leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>

          {submitStatus === "success" ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">
                  Inscription réussie ! Vous recevrez bientôt notre newsletter.
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Fermer
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-sm">
                    Prénom *
                  </Label>
                  <Input
                    id="prenom"
                    name="prenom"
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Prénom"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-sm">
                    Nom *
                  </Label>
                  <Input
                    id="nom"
                    name="nom"
                    type="text"
                    required
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Nom"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre.email@exemple.com"
                  className="h-10"
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="accepteConditions"
                  checked={formData.accepteConditions}
                  onCheckedChange={handleCheckboxChange}
                  className="mt-1"
                />
                <Label
                  htmlFor="accepteConditions"
                  className="text-xs leading-relaxed cursor-pointer font-normal"
                >
                  J'accepte de donner mes informations personnelles pour recevoir la newsletter des États Généraux Communaux *
                </Label>
              </div>

              {submitStatus === "error" && (
                <div className="flex items-center gap-2 p-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-2 pt-2 text-center">
                <Button
                  type="submit"
                  className="gap-2 bg-white text-black underline"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Inscription en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="size-5" />
                      {buttonText}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-muted-foreground text-sm"
                  disabled={isSubmitting}
                >
                  Non merci, je continue ma visite
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
