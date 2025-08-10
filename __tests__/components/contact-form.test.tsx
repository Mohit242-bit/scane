import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ContactForm from "@/components/contact-form"
import { useToast } from "@/hooks/use-toast"
import jest from "jest"

// Mock the useToast hook
jest.mock("@/hooks/use-toast")
const mockToast = jest.fn()
;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })

// Mock fetch
global.fetch = jest.fn()

describe("ContactForm", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders contact form with all fields", () => {
    render(<ContactForm />)

    expect(screen.getByLabelText("Full Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Email Address")).toBeInTheDocument()
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument()
    expect(screen.getByLabelText("Subject")).toBeInTheDocument()
    expect(screen.getByLabelText("Message")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    render(<ContactForm />)

    const submitButton = screen.getByRole("button", { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      expect(screen.getByText(/please enter a valid 10-digit mobile number/i)).toBeInTheDocument()
      expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument()
    })
  })

  it("submits form with valid data", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<ContactForm />)

    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "John Doe" } })
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "john@example.com" } })
    fireEvent.change(screen.getByLabelText("Phone Number"), { target: { value: "9876543210" } })
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "This is a test message" } })

    const submitButton = screen.getByRole("button", { name: /send message/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com",
          phone: "9876543210",
          subject: "general",
          message: "This is a test message",
        }),
      })
    })

    expect(mockToast).toHaveBeenCalledWith({
      title: "Message sent successfully!",
      description: "We'll get back to you within 24 hours.",
    })
  })

  it("renders compact variant", () => {
    render(<ContactForm variant="compact" />)

    expect(screen.getByText("Quick Contact")).toBeInTheDocument()
    expect(screen.getByText("Send us a message and we'll respond quickly.")).toBeInTheDocument()
  })
})
