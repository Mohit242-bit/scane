import { render, screen, waitFor } from "@testing-library/react"
import { useSession } from "next-auth/react"
import BookingFlow from "@/components/booking-flow"
import jest from "jest" // Import jest to declare the variable

// Mock the useSession hook
jest.mock("next-auth/react")
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock fetch
global.fetch = jest.fn()

describe("BookingFlow", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
    })
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
    mockUseSession.mockReturnValue({
      data: {
        user: { id: "1", name: "Test User", phone: "9876543210" },
        expires: "2024-12-31",
      },
      status: "authenticated",
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
