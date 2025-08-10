"use client"

import Head from "next/head"

type SeoHeadProps = {
  title?: string
  description?: string
  url?: string
}

export default function SeoHead({
  title = "ScanEzy — Radiology Booking",
  description = "Precision made effortless. Compare centers, pick a slot, and book securely with WhatsApp-first updates.",
  url = "https://scanezy.example.com",
}: SeoHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      {title ? <meta property="og:title" content={title} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {url ? <meta property="og:url" content={url} /> : null}
      <meta property="og:site_name" content="ScanEzy" />
      {/* Basic Twitter card */}
      <meta name="twitter:card" content="summary_large_image" />
      {title ? <meta name="twitter:title" content={title} /> : null}
      {description ? <meta name="twitter:description" content={description} /> : null}
    </Head>
  )
}
