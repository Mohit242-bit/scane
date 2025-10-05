# Vercel Deployment Checklist

## 🚨 The Problem
Your build works locally but fails on Vercel because **environment variables are not pushed to git**. They must be configured in Vercel's dashboard.

---

## ✅ Quick Fix Checklist

### Step 1: Get Your Environment Variables
```powershell
# View your local environment variables
Get-Content .env.local
```

### Step 2: Add to Vercel (Dashboard Method)

1. Go to [vercel.com](https://vercel.com)
2. Select your **Scanezy** project
3. Click **Settings** → **Environment Variables**
4. Add each variable below:

#### Required Variables (Must Add These)
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ ADMIN_MVP_USERNAME
✅ ADMIN_MVP_PASSWORD
✅ ADMIN_MVP_SECRET
```

#### Optional Variables (Add if you use these features)
```
☐ GOOGLE_CLIENT_ID (for OAuth)
☐ GOOGLE_CLIENT_SECRET (for OAuth)
☐ GOOGLE_OAUTH_CALLBACK_URL (for OAuth)
☐ RAZORPAY_KEY_ID (for payments)
☐ RAZORPAY_KEY_SECRET (for payments)
☐ WHATSAPP_API_TOKEN (for WhatsApp)
☐ WHATSAPP_PHONE_NUMBER_ID (for WhatsApp)
☐ TWILIO_ACCOUNT_SID (for SMS)
☐ TWILIO_AUTH_TOKEN (for SMS)
☐ TWILIO_PHONE_NUMBER (for SMS)
☐ RESEND_API_KEY (for emails)
☐ AWS_ACCESS_KEY_ID (for file uploads)
☐ AWS_SECRET_ACCESS_KEY (for file uploads)
☐ AWS_REGION (for file uploads)
☐ AWS_S3_BUCKET (for file uploads)
☐ GOOGLE_MAPS_API_KEY (for maps)
☐ GOOGLE_ANALYTICS_ID (for analytics)
```

### Step 3: Set Environment for Each Variable
When adding variables, select:
- ✅ Production
- ✅ Preview
- ✅ Development

### Step 4: Update OAuth Callback (If Using Google Login)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client
4. Add: `https://your-domain.vercel.app/api/auth/callback`

### Step 5: Redeploy
```bash
# Option A: Empty commit to trigger deployment
git commit --allow-empty -m "Trigger Vercel deployment"
git push

# Option B: Redeploy from Vercel dashboard
# Go to Deployments → Click ⋯ on latest → Redeploy
```

### Step 6: Verify
- [ ] Build completes successfully
- [ ] Homepage loads
- [ ] Location handler works
- [ ] Booking flow functions
- [ ] Admin panel accessible

---

## 🔥 Alternative: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
# ... add remaining variables

# Deploy
vercel --prod
```

---

## 🐛 Still Failing? Check These

1. **Build Logs:** Vercel Dashboard → Deployments → Click failed deployment → Read logs
2. **Variable Names:** Make sure no typos in variable names
3. **Supabase Keys:** Verify keys are correct (copy from Supabase dashboard)
4. **Missing Variables:** Error logs will tell you which variables are missing

---

## 📝 Notes

- **Security:** Never commit `.env.local` to git
- **Values:** Copy exact values from your local `.env.local`
- **Secrets:** Don't share environment variables publicly
- **Testing:** Test locally first: `npm run build && npm run start`

---

## ✨ After Successful Deployment

Your site will be live at: `https://your-project.vercel.app`

Next steps:
1. Test all features in production
2. Set up custom domain (optional)
3. Enable monitoring/analytics
4. Configure production payment gateway

---

## 📚 Full Guide

For detailed instructions, see: `VERCEL_DEPLOYMENT_GUIDE.md`

---

**That's it!** Once you add the environment variables to Vercel, your deployment will work just like it does locally. 🚀
