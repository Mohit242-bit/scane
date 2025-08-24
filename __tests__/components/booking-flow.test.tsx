import { render, screen, waitFor } from "@testing-library/react"
import { getCurrentUser } from "@/lib/auth"
import BookingFlow from "@/components/booking-flow"
import jest from "jest" // Import jest to declare the variable

// Mock the getCurrentUser function
jest.mock("@/lib/auth")
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>

// Mock fetch
global.fetch = jest.fn()

describe("BookingFlow", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue(null)
  })

  it("renders service selection step", () => {
    render(<BookingFlow />)

    expect(screen.getByText("Choose service and slot")).toBeInTheDocument()
    expect(screen.getByLabelText("Service")).toBeInTheDocument()
    expect(screen.getByLabelText("City")).toBeInTheDocument()
  })

  it("shows sign in prompt when user is not authenticated", () => {
    render(<BookingFlow />)

    const continueButton = screen.getByRole("button", { name: /sign in to continue/i })
    expect(continueButton).toBeInTheDocument()
  })

  it("allows slot selection when user is authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "1",
      name: "Test User",
      email: "test@example.com",
      phone: "9876543210",
      role: "customer"
    })

    // Mock slots API response
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        slots: [
          {
            id: "slot-1",
            center_id: "center-1",
            start_ts: Date.now() + 86400000, // Tomorrow
            end_ts: Date.now() + 86400000 + 3600000, // Tomorrow + 1 hour
            price: 5000,
            tat_hours: 24,
            status: "OPEN",
          },
        ],
        centers: [
          {
            id: "center-1",
            name: "Test Center",
            area_hint: "Test Area",
            city: "Mumbai",
            rating: 4.5,
          },
        ],
      }),
    })

    render(<BookingFlow />)

    await waitFor(() => {
      expect(screen.getByText("Continue to Payment")).toBeInTheDocument()
    })
  })
})
