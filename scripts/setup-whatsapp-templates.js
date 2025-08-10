import { whatsappTemplates } from "../lib/whatsapp-templates.js"

async function setupTemplates() {
  console.log("🚀 Setting up WhatsApp Business API templates...")

  try {
    await whatsappTemplates.createTemplates()
    console.log("✅ WhatsApp templates setup complete!")
    console.log("\n📋 Next steps:")
    console.log("1. Wait for Facebook to approve your templates (usually 24-48 hours)")
    console.log("2. Test the templates in WhatsApp Business Manager")
    console.log("3. Update your environment variables with the approved template names")
  } catch (error) {
    console.error("❌ Template setup failed:", error)
    process.exit(1)
  }
}

setupTemplates()
