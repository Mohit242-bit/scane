// Custom Cypress commands for ScanEzy testing

import { cy } from "cypress"

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to sign in a user
       */
      signIn(phone: string, name?: string): Chainable<void>

      /**
       * Custom command to select a service and city
       */
      selectServiceAndCity(service: string, city: string): Chainable<void>

      /**
       * Custom command to check responsive design
       */
      checkResponsive(): Chainable<void>
    }
  }
}

Cypress.Commands.add("signIn", (phone: string, name = "Test User") => {
  cy.visit("/auth/signin")
  cy.get('input[name="name"]').type(name)
  cy.get('input[name="phone"]').type(phone)
  cy.get("button").contains("Send OTP").click()

  // Mock OTP verification
  cy.get('input[name="otp"]').type("123456")
  cy.get("button").contains("Verify & Sign In").click()

  // Wait for redirect
  cy.url().should("not.include", "/auth/signin")
})

Cypress.Commands.add("selectServiceAndCity", (service: string, city: string) => {
  cy.get('[data-testid="service-select"]').select(service)
  cy.get('[data-testid="city-select"]').select(city)
})

Cypress.Commands.add("checkResponsive", () => {
  const viewports = [
    [375, 667], // Mobile
    [768, 1024], // Tablet
    [1280, 720], // Desktop
  ]

  viewports.forEach(([width, height]) => {
    cy.viewport(width, height)
    cy.get("body").should("be.visible")
    // Add more responsive checks as needed
  })
})
