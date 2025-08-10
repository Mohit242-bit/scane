import { describe, beforeEach, it } from "cypress"
import { cy } from "cypress"

describe("Booking Flow", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("completes full booking flow", () => {
    // Start booking from homepage
    cy.get('[data-testid="service-select"]').select("MRI Brain")
    cy.get('[data-testid="city-select"]').select("Mumbai")
    cy.get("button").contains("Find slots").click()

    // Should navigate to booking page
    cy.url().should("include", "/book")
    cy.get("h1").should("contain", "Choose service and slot")

    // Select a slot
    cy.get('[data-testid="slot-card"]').first().click()
    cy.get("button").contains("Sign In to Continue").click()

    // Should navigate to sign in
    cy.url().should("include", "/auth/signin")
    cy.get("h1").should("contain", "Welcome to ScanEzy")

    // Fill sign in form
    cy.get('input[name="name"]').type("Test User")
    cy.get('input[name="phone"]').type("9876543210")
    cy.get("button").contains("Send OTP").click()

    // Mock OTP verification (in real test, you'd handle OTP)
    cy.get('input[name="otp"]').type("123456")
    cy.get("button").contains("Verify & Sign In").click()

    // Should return to booking with payment step
    cy.url().should("include", "/book")
    cy.get("h2").should("contain", "Payment")

    // Payment would be handled by Razorpay in real scenario
    cy.get("button").contains("Pay").should("be.visible")
  })

  it("handles responsive design", () => {
    // Test mobile viewport
    cy.viewport(375, 667)
    cy.visit("/book")

    // Check mobile navigation
    cy.get('[data-testid="mobile-menu"]').should("be.visible")

    // Check form layout on mobile
    cy.get('[data-testid="booking-form"]').should("be.visible")

    // Test tablet viewport
    cy.viewport(768, 1024)
    cy.get('[data-testid="booking-form"]').should("be.visible")

    // Test desktop viewport
    cy.viewport(1280, 720)
    cy.get('[data-testid="booking-form"]').should("be.visible")
  })

  it("validates form inputs", () => {
    cy.visit("/book")

    // Try to continue without selecting slot
    cy.get("button").contains("Continue").click()
    cy.get("button").should("be.disabled")

    // Select slot and continue
    cy.get('[data-testid="slot-card"]').first().click()
    cy.get("button").contains("Continue").should("not.be.disabled")
  })
})
