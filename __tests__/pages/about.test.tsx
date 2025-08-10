import { render, screen } from "@testing-library/react"
import AboutPage from "@/app/about/page"

describe("AboutPage", () => {
  it("renders about page content", () => {
    render(<AboutPage />)

    expect(screen.getByText("Precision made effortless for everyone")).toBeInTheDocument()
    expect(screen.getByText(/We're on a mission to make quality radiology services/)).toBeInTheDocument()
    expect(screen.getByText("500+")).toBeInTheDocument() // Partner Centers stat
    expect(screen.getByText("10,000+")).toBeInTheDocument() // Happy Patients stat
  })

  it("displays company values", () => {
    render(<AboutPage />)

    expect(screen.getByText("Patient-First Approach")).toBeInTheDocument()
    expect(screen.getByText("Trust & Transparency")).toBeInTheDocument()
    expect(screen.getByText("Innovation & Excellence")).toBeInTheDocument()
  })

  it("shows company milestones", () => {
    render(<AboutPage />)

    expect(screen.getByText("Founded")).toBeInTheDocument()
    expect(screen.getByText("First Partnership")).toBeInTheDocument()
    expect(screen.getByText("WhatsApp Integration")).toBeInTheDocument()
    expect(screen.getByText("AI Optimization")).toBeInTheDocument()
  })

  it("includes call-to-action buttons", () => {
    render(<AboutPage />)

    expect(screen.getByRole("link", { name: /book appointment/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /partner with us/i })).toBeInTheDocument()
  })
})
