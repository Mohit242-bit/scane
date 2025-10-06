# DOCTOR PORTAL SETUP - COMPLETE GUIDE

##  Current Status
 Simplified doctor onboarding page created
 Doctor dashboard ready with prescription management
 API routes for prescriptions and recommendations
 Email service configured
 Database migration SQL ready

##  TODO LIST - Execute These Steps

### Step 1: Run Database Migration
1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Go to your project  SQL Editor
3. Copy the contents of: supabase/migrations/001_doctor_portal.sql
4. Paste and run the SQL script
5. Verify tables created: prescriptions, test_recommendations, doctor_center_assignments

### Step 2: Test the Doctor Onboarding Flow
1. Go to http://localhost:3000/partner/login
2. Login with your Google account (workerdev8@gmail.com)
3. You'll be redirected to /partner/onboarding
4. Fill in the simple form:
   - Full Name: (pre-filled from Google)
   - Phone: Your phone number
   - Specialization: (optional)
   - License Number: (optional)
5. Click "Complete Setup"
6. Should redirect to /partner/dashboard

### Step 3: Test Prescription Upload (Customer Side)
1. Open a new incognito window
2. Go to http://localhost:3000/book (or wherever prescription upload is)
3. Fill in patient details
4. Upload a prescription image
5. Submit

### Step 4: Review Prescription (Doctor Side)
1. In your doctor dashboard, you should see the uploaded prescription
2. Select a center from the dropdown
3. Click on the prescription to review
4. Select tests to recommend
5. Add notes
6. Click "Send Recommendations"
7. Check if email is sent (will show in console in dev mode)

### Step 5: Verify Everything Works
- [ ] Doctor can login
- [ ] Doctor onboarding creates profile
- [ ] Dashboard loads without errors
- [ ] Prescriptions appear in the list
- [ ] Doctor can review and recommend tests
- [ ] Email sending works

##  If You Encounter Issues

### Issue: "Partner profile not found"
**Solution**: The onboarding should create the profile automatically. If it doesn't work, check:
- Browser console for errors
- Supabase logs for database errors
- Make sure the migration ran successfully

### Issue: "No prescriptions showing"
**Solution**: 
- Make sure you uploaded a prescription from customer side
- Check that center_id matches an existing center
- View browser console and network tab for API errors

### Issue: Email not sending
**Solution**: In development mode, emails are logged to console instead of actually sending. Check the terminal/console for email content.

##  Success Criteria
When everything works, you should be able to:
1. Login as doctor
2. See prescription queue
3. Select center
4. Review prescriptions
5. Recommend tests
6. Send emails to patients

Ready to start? Begin with Step 1 - Database Migration!
