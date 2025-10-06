// POST /api/partner/login
// Handles partner login (MVP: email/password)

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Dummy partner data
  const partners = [
    { id: 1, name: "Radiology Center A", email: "partner1@example.com", password: "test123" },
    { id: 2, name: "ScanEzy Diagnostics", email: "partner2@example.com", password: "test456" },
  ];

  const body = await req.json();
  const { email, password } = body;
  const partner = partners.find(p => p.email === email && p.password === password);
  if (!partner) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }
  // Return dummy JWT token
  return new Response(JSON.stringify({ token: "dummy-jwt-token", partner }), { status: 200 });
}
