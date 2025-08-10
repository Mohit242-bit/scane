import { sql } from "../lib/database.js"
import { servicesSeed, citiesSeed, seededCentersFor } from "../lib/data.js"

async function seedData() {
  try {
    console.log("🌱 Seeding database with initial data...")

    // Seed services
    const services = servicesSeed()
    for (const service of services) {
      await sql`
        INSERT INTO services (id, slug, name, modality, duration_min, prep_text_md, prep_short, base_price, is_active)
        VALUES (${service.id}, ${service.slug}, ${service.name}, ${service.modality}, ${service.duration_min}, ${service.prep_text_md}, ${service.prep_short}, ${service.base_price}, ${service.is_active})
        ON CONFLICT (slug) DO UPDATE SET
          name = EXCLUDED.name,
          base_price = EXCLUDED.base_price,
          is_active = EXCLUDED.is_active
      `
    }
    console.log(`✅ Seeded ${services.length} services`)

    // Seed centers for each city
    const cities = citiesSeed()
    let totalCenters = 0

    for (const city of cities) {
      const centers = seededCentersFor(city.slug)
      for (const center of centers) {
        await sql`
          INSERT INTO centers (id, code, name, city, area_hint, certifications, rating, lat, lng, is_active)
          VALUES (${center.id}, ${center.code}, ${center.name}, ${center.city}, ${center.area_hint}, ${center.certifications}, ${center.rating}, ${center.geo.lat}, ${center.geo.lng}, true)
          ON CONFLICT (code) DO UPDATE SET
            name = EXCLUDED.name,
            rating = EXCLUDED.rating,
            is_active = EXCLUDED.is_active
        `
      }
      totalCenters += centers.length
    }
    console.log(`✅ Seeded ${totalCenters} centers across ${cities.length} cities`)

    console.log("🎉 Data seeding complete!")
  } catch (error) {
    console.error("❌ Data seeding failed:", error)
    process.exit(1)
  }
}

seedData()
