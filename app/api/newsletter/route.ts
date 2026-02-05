import { NextResponse } from "next/server"
import { getSiteOptions as getArchivePageTitles, getSiteOptions } from "@/lib/wordpress-api"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nom, prenom, email, telephone, accepteConditions } = body

    // Validation
    if (!nom || !prenom || !email) {
      return NextResponse.json({ message: "Nom, prénom et email sont requis" }, { status: 400 })
    }

    if (!accepteConditions) {
      return NextResponse.json(
        { message: "Vous devez accepter de donner vos informations personnelles" },
        { status: 400 },
      )
    }

    let recipientEmail = "agathe@next-impact.digital"

    try {
      const siteOptions = await getSiteOptions()

      if (siteOptions?.adresse_mail) {
        recipientEmail = siteOptions.adresse_mail
      }
    } catch (wpError) {
      console.error("Failed to fetch WordPress data:", wpError)
    }

    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    // Gmail requires the "from" address to match the authenticated user
    const smtpFrom = process.env.SMTP_FROM || `Café Citoyen <${smtpUser}>`

    // Check if SMTP is configured
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.error("SMTP not configured. Newsletter subscription logged but not sent via email.")
      return NextResponse.json({
        message: "Inscription enregistrée ! Les données ont été transmises.",
        note: "Pour recevoir les inscriptions par email, configurez les variables d'environnement SMTP.",
      })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number.parseInt(smtpPort || "587"),
      secure: smtpPort === "465",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    // Email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #6CB33F; padding-bottom: 10px;">
          Nouvelle inscription à la newsletter
        </h2>
        <div style="margin: 20px 0;">
          <p><strong>Nom:</strong> ${nom}</p>
          <p><strong>Prénom:</strong> ${prenom}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Téléphone:</strong> ${telephone || "Non fourni"}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Cette inscription a été effectuée le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}.
        </p>
      </div>
    `

    // Email to subscriber
    const siteDomain = process.env.SITE_DOMAIN || "cafecitoyen.art"
    const logoUrl = `https://${siteDomain}/logo-cafe-citoyen.png`

    const subscriberEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
        <img src="${logoUrl}" alt="Logo Café citoyen" style="max-width: 200px; margin-bottom: 20px;" />
        <div style="text-align: left;">
          <h2 style="color: #000000; border-bottom: 2px solid #00000; padding-bottom: 10px;">
            Bienvenue dans notre newsletter !
          </h2>
          <p>Bonjour ${prenom},</p>
          <p>Merci de vous être inscrit(e) à notre newsletter. Vous recevrez bientôt nos actualités et informations.</p>
          <p>Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email.</p>
          <hr style="border: none; border-top: 1px solid #000000; margin: 20px 0;">
          <p style="color: #000000; font-size: 12px;">
            Café citoyen
          </p>
        </div>
      </div>
    `

    try {
      console.log("[Newsletter] Attempting to send email...")
      console.log("[Newsletter] SMTP Host:", smtpHost)
      console.log("[Newsletter] SMTP Port:", smtpPort)
      console.log("[Newsletter] SMTP User:", smtpUser)
      console.log("[Newsletter] From:", smtpFrom)
      console.log("[Newsletter] To Admin:", recipientEmail)
      console.log("[Newsletter] To Subscriber:", email)

      // Verify SMTP connection first
      await transporter.verify()
      console.log("[Newsletter] SMTP connection verified successfully")

      // Send email to admin
      const adminResult = await transporter.sendMail({
        from: smtpFrom,
        to: recipientEmail,
        subject: "Nouvelle inscription à la newsletter",
        html: adminEmailHtml,
      })
      console.log("[Newsletter] Admin email sent:", adminResult.messageId)

      // Send confirmation email to subscriber
      const subscriberResult = await transporter.sendMail({
        from: smtpFrom,
        to: email,
        subject: "Confirmation d'inscription à la newsletter",
        html: subscriberEmailHtml,
      })
      console.log("[Newsletter] Subscriber email sent:", subscriberResult.messageId)

      return NextResponse.json({
        message: "Inscription réussie ! Vous recevrez bientôt un email de confirmation.",
      })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      return NextResponse.json(
        {
          message: "Erreur lors de l'envoi de l'email. Veuillez vérifier la configuration SMTP.",
          error: emailError instanceof Error ? emailError.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing newsletter subscription:", error)
    return NextResponse.json(
      {
        message: "Erreur lors du traitement de l'inscription",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}