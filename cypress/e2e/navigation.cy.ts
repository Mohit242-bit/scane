import { describe, it } from "mocha"
import { cy } from "cypress"

describe("Navigation", () => {
  it("navigates through all main pages", () => {
    cy.visit("/")

    // Test homepage
    cy.get("h1").should("contain", "Precision made effortless")

    // Navigate to services
    cy.get("nav a").contains("Services").click()
    cy.url().should("include", "/services")
    cy.get("h1").should("contain", "Radiology Services")

    // Navigate to centers
    cy.get("nav a").contains("Centers").click()
    cy.url().should("include", "/centers")
    cy.get("h1").should("contain", "Radiology Centers")

    // Navigate to about
    cy.get("nav a").contains("About").click()
    cy.url().should("include", "/about")
    cy.get("h1").should("contain", "Precision made effortless for everyone")

    // Navigate to support
    cy.get("nav a").contains("Support").click()
    cy.url().should("include", "/support")
    cy.get("h1").should("contain", "Support Center")

    // Test contact page
    cy.visit("/contact")
    cy.get("h1").should("contain", "Contact ScanEzy")
  })

  it("handles mobile navigation", () => {
    cy.viewport(375, 667)
    cy.visit("/")

    // Open mobile menu
    cy.get('[data-testid="mobile-menu-trigger"]').click()
    cy.get('[data-testid="mobile-menu"]').should("be.visible")

    // Navigate via mobile menu
    cy.get('[data-testid="mobile-menu"] a').contains("Services").click()
    cy.url().should("include", "/services")
  })

  it("shows authentication state in navigation", () => {
    cy.visit("/")

    // Should show sign in button when not authenticated
    cy.get("nav").contains("Sign In").should("be.visible")

    // Mock authentication (in real test, you'd sign in)
    cy.window().then((win) => {
      win.localStorage.setItem("next-auth.session-token", "mock-token")
    })

    // Refresh and check authenticated state
    cy.reload()
    // Would show user menu when authenticated
  })
})
