# Vercel Deployment Guide for Scanezy

## Problem: Build Works Locally but Fails on Vercel

Your build works locally because you have a `.env.local` file with all the necessary environment variables. However, **these files are gitignored and don't get pushed to Vercel**, which causes the deployment to fail.

## Solution: Configure Environment Variables in Vercel

You need to add all your environment variables to your Vercel project settings. Here's how:

---

## Step 1: Access Your Vercel Project Settings

1. Go to [https://vercel.com/](https://vercel.com/)
2. Log in to your account
3. Select your **Scanezy** project
4. Click on **Settings** (top navigation)
5. Click on **Environment Variables** (left sidebar)

---

## Step 2: Add Required Environment Variables

### Critical Variables (MUST be configured for deployment to work)

Add these variables one by one in Vercel:

#### **Supabase Configuration** (REQUIRED)
```
NEXT_PUBLIC_SUPABASE_URL=https://ljvmtgfnnhboyusgfmap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

#### **Admin Configuration** (REQUIRED for admin panel)
```
ADMIN_MVP_USERNAME=<your_admin_username>
ADMIN_MVP_PASSWORD=<your_secure_password>
ADMIN_MVP_SECRET=<your_long_random_secret_minimum_32_characters>
```

---

### Optional Variables (Add as needed for features)

#### **Google OAuth** (if using Google login)
```
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_OAUTH_CALLBACK_URL=https://your-domain.vercel.app/api/auth/callback
```

#### **Payment Configuration** (Razorpay)
```
RAZORPAY_KEY_ID=<your_razorpay_key_id>
RAZORPAY_KEY_SECRET=<your_razorpay_secret>
```

#### **Communication Services**
```
WHATSAPP_API_TOKEN=<your_whatsapp_token>
WHATSAPP_PHONE_NUMBER_ID=<your_phone_number_id>
TWILIO_ACCOUNT_SID=<your_twilio_account_sid>
TWILIO_AUTH_TOKEN=<your_twilio_auth_token>
TWILIO_PHONE_NUMBER=<your_twilio_phone_number>
RESEND_API_KEY=<your_resend_api_key>
```

#### **AWS S3 Configuration** (for file uploads)
```
AWS_ACCESS_KEY_ID=<your_aws_access_key>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
AWS_REGION=ap-south-1
AWS_S3_BUCKET=<your_bucket_name>
```

#### **Analytics** (Optional)
```
GOOGLE_ANALYTICS_ID=<your_ga_id>
MIXPANEL_TOKEN=<your_mixpanel_token>
SENTRY_DSN=<your_sentry_dsn>
```

#### **External Services**
```
GOOGLE_MAPS_API_KEY=<your_google_maps_key>
```

---

## Step 3: Set Environment for Each Variable

When adding each variable in Vercel, you can choose which environments to apply it to:

- ✅ **Production** - For your live site
- ✅ **Preview** - For preview deployments (pull requests)
- ✅ **Development** - For local development (optional)

**Recommendation:** Select **all three** for consistency.

---

## Step 4: Update OAuth Callback URLs (if using Google OAuth)

If you're using Google OAuth, update your Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `https://your-domain.vercel.app/api/auth/callback`
   - `https://your-preview-domain.vercel.app/api/auth/callback` (for previews)

---

## Step 5: Redeploy Your Application

After adding all environment variables:

### Option A: Redeploy from Vercel Dashboard
1. Go to your project in Vercel
2. Click on the **Deployments** tab
3. Click the **⋯** (three dots) on the latest deployment
4. Click **Redeploy**

### Option B: Trigger a New Deployment from Git
```bash
git commit --allow-empty -m "Trigger Vercel deployment"
git push
```

---

## Step 6: Verify Deployment

1. Wait for the build to complete
2. Check the build logs in Vercel for any errors
3. Visit your deployed site
4. Test key functionality:
   - Homepage loads
   - Location selection works
   - Booking flow functions
   - Admin panel is accessible

---

## Common Deployment Issues & Solutions

### Issue 1: "Environment validation failed"
**Solution:** You're missing required environment variables. Check the build logs to see which variables are missing and add them to Vercel.

### Issue 2: "Supabase connection failed"
**Solution:** Verify your Supabase URL and keys are correct in Vercel settings.

### Issue 3: Build succeeds but site crashes at runtime
**Solution:** Some environment variables might be missing. Check browser console and Vercel function logs.

### Issue 4: OAuth redirect not working
**Solution:** Make sure your `GOOGLE_OAUTH_CALLBACK_URL` matches your actual Vercel domain and is registered in Google Cloud Console.

---

## Quick Copy Script for Vercel CLI (Alternative Method)

If you prefer using the Vercel CLI, you can add environment variables via command line:

### Install Vercel CLI (if not already installed)
```bash
npm i -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Add Environment Variables
```bash
# Required
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add ADMIN_MVP_USERNAME production
vercel env add ADMIN_MVP_PASSWORD production
vercel env add ADMIN_MVP_SECRET production

# Optional - Add as needed
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add RAZORPAY_KEY_ID production
# ... etc
```

After adding variables, redeploy:
```bash
vercel --prod
```

---

## Security Best Practices

1. ✅ **Never commit** `.env`, `.env.local`, or any file containing secrets to git
2. ✅ **Use different credentials** for development and production
3. ✅ **Rotate secrets regularly**, especially after team member changes
4. ✅ **Limit service role key usage** - only use on server-side
5. ✅ **Set up Supabase RLS policies** to protect your database

---

## How to Get Your Environment Variables

If you need to copy values from your local `.env.local` file:

### Windows PowerShell
```powershell
Get-Content .env.local
```

### Copy specific values (don't share these publicly!)
- Open `.env.local` in VS Code
- Copy each value
- Paste into Vercel's environment variable settings

**⚠️ IMPORTANT:** Never share your environment variables in screenshots, chat logs, or public repositories!

---

## Next Steps After Successful Deployment

1. ✅ Test all functionality on production
2. ✅ Set up custom domain (if not already done)
3. ✅ Configure SSL/HTTPS (automatic with Vercel)
4. ✅ Set up monitoring and analytics
5. ✅ Enable error tracking (Sentry)
6. ✅ Test payment integration in production mode
7. ✅ Verify email/SMS notifications work

---

## Support Resources

- **Vercel Docs:** [https://vercel.com/docs/concepts/projects/environment-variables](https://vercel.com/docs/concepts/projects/environment-variables)
- **Supabase Docs:** [https://supabase.com/docs/guides/hosting/vercel](https://supabase.com/docs/guides/hosting/vercel)
- **Next.js Deployment:** [https://nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

## Troubleshooting Checklist

Before reaching out for help, verify:

- [ ] All required environment variables are added in Vercel
- [ ] Supabase URL and keys are correct
- [ ] OAuth callback URLs are updated
- [ ] No typos in environment variable names
- [ ] Variables are set for correct environments (production/preview)
- [ ] Build logs don't show validation errors
- [ ] Your local build still works (`npm run build`)

---

## Still Having Issues?

If deployment continues to fail after following this guide:

1. **Check Vercel Build Logs:**
   - Go to your project in Vercel
   - Click on the failed deployment
   - Read the full build log for error messages

2. **Check Function Logs:**
   - Go to **Deployments** > Select deployment > **Functions**
   - Look for runtime errors

3. **Test locally first:**
   ```bash
   npm run build
   npm run start
   ```

4. **Share specific error messages** (without exposing secrets) if you need help.

---

## Summary

Your build works locally because you have `.env.local` with all credentials. Vercel needs these same variables configured in its dashboard. Once you add them, your deployment will succeed! 🚀
