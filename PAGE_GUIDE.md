#  Understanding Your Pages

## 1. CENTERS PAGE (Customer-Facing) 
**URL:** /centers
**Purpose:** For customers to browse and book at medical centers
**What you see:**
- List of medical centers with ratings
- Search functionality
- "Book Appointment" buttons
- "View Details" buttons
- Statistics about centers

## 2. DOCTOR PORTAL (Staff-Facing) 
**URL:** /partner or /partner/login  /partner/dashboard
**Purpose:** For doctors to review prescriptions and recommend tests
**What you see:**
- "Doctor Dashboard" header
- Center selection cards
- Prescription uploads queue
- Review & Recommend buttons
- Pending/Recommended tabs

---

## How to Access Doctor Portal:

1. Click "Doctor Portal" in the navigation menu
2. You'll go to /partner which redirects to:
   - /partner/login (if not logged in)
   - /partner/dashboard (if logged in)

3. Login with a partner/doctor account
4. You'll see the Doctor Dashboard

---

## Are you seeing this?  (WRONG PAGE)
- Search bar for centers
- Grid of center cards with "Book Appointment"
- Statistics like "Total Bookings", "Registered Users"
- URL shows /centers

## You should see this:  (CORRECT PAGE)
- "Doctor Dashboard" title
- "Select Medical Center" section
- "Prescription Uploads" section
- "Pending", "Recommended", "All" tabs
- URL shows /partner/dashboard

---

## Quick Fix:
1. Make sure you're logged in as a doctor/partner
2. Go directly to: http://localhost:3000/partner/dashboard
3. Check if you see "Doctor Dashboard" at the top
4. If you see "Diagnostic Centers", you're on the wrong page (/centers)

