import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { signIn } from "next-auth/react"
import SignInPage from "@/app/auth/signin/page"
import jest from "jest"

// Mock NextAuth
jest.mock("next-auth/react")
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>

// Mock fetch
global.fetch = jest.fn()

describe("SignInPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders sign in form", () => {
    render(<SignInPage />)

    expect(screen.getByText("Welcome to ScanEzy")).toBeInTheDocument()
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument()
    expect(screen.getByLabelText("Phone Number")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /send otp/i })).toBeInTheDocument()
  })

  it("validates phone number input", async () => {
    render(<SignInPage />)

    const nameInput = screen.getByLabelText("Full Name")
    const phoneInput = screen.getByLabelText("Phone Number")
    const sendOtpButton = screen.getByRole("button", { name: /send otp/i })

    fireEvent.change(nameInput, { target: { value: "Test User" } })
    fireEvent.change(phoneInput, { target: { value: "123" } })
    fireEvent.click(sendOtpButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid 10-digit mobile number/i)).toBeInTheDocument()
    })
  })

  it("sends OTP when valid data is provided", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<SignInPage />)

    const nameInput = screen.getByLabelText("Full Name")
    const phoneInput = screen.getByLabelText("Phone Number")
    const sendOtpButton = screen.getByRole("button", { name: /send otp/i })

    fireEvent.change(nameInput, { target: { value: "Test User" } })
    fireEvent.change(phoneInput, { target: { value: "9876543210" } })
    fireEvent.click(sendOtpButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "9876543210" }),
      })
    })
  })
})
