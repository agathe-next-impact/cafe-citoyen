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

interface ExitIntentPopupProps {
  title?: string
  description?: string
  buttonText?: string
  sensitivity?: number
  showOnce?: boolean
}

export function ExitIntentPopup({
  title = "Attendez ! Restez informé(e)",
  description = "Inscrivez-vous à notre newsletter et recevez nos actualités directement dans votre boîte mail.",
  buttonText = "S'inscrire à la newsletter",
  sensitivity = 20,
  showOnce = true,
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

  // Ref pour suivre le défilement sur mobile
  const scrollRef = useRef({ lastY: 0, ticking: false })

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

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)

    // Logique mobile : Detection du scroll rapide vers le haut
    const handleTouchScroll = () => {
      if (!scrollRef.current.ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY
          const delta = currentY - scrollRef.current.lastY
          const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0

          // Detection d'un scroll rapide vers le haut (intention de quitter ou voir l'URL)
          if (
            isMobile &&
            delta < -30 && // Scroll vers le haut significatif
            currentY > 100 // Pas au tout début de la page
          ) {
            // Vérification si déjà montré
            const alreadyShown = showOnce ? sessionStorage.getItem("exitPopupShown") : null
            
            if ((!showOnce || (!hasShown && !alreadyShown))) {
              setIsOpen(true)
              setHasShown(true)
              if (showOnce) {
                sessionStorage.setItem("exitPopupShown", "true")
              }
            }
          }
          scrollRef.current.lastY = currentY
          scrollRef.current.ticking = false
        })
        scrollRef.current.ticking = true
      }
    }

    window.addEventListener("scroll", handleTouchScroll, { passive: true })

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleTouchScroll)
    }
  }, [handleMouseMove, hasShown, showOnce])

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
      <DialogContent className="max-w-[90vw] md:max-w-[50vw] max-h-[80vh] border-none overflow-hidden p-0">
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
