# VERCEL DEPLOYMENT - ENVIRONMENT VARIABLES

Copy and paste each variable into Vercel's Environment Variables settings:

## Production Environment Variables

**1. MONGODB_URI**
   Value: mongodb+srv://sarthakadmin:Sarthak2008@organismproject.knivgvq.mongodb.net/neet_tracker?retryWrites=true&w=majority

**2. NEXTAUTH_SECRET** (Secure 64-char token)
   Value: 3f8e9c2d7a1b5f4e6c9a2d8e1b4f7a3c5e9b2d6f8a1c4e7b0d3f6a9c2e5b8d

**3. NEXTAUTH_URL** (Update after deployment)
   Value: https://rankforge.vercel.app
   (Replace 'rankforge' with your actual Vercel project name)

---

## How to Add to Vercel:

1. Go to Vercel Dashboard → Your Project → Settings
2. Click "Environment Variables" (left sidebar)
3. For each variable above:
   - Copy the Name (e.g., MONGODB_URI)
   - Paste it in the "Name" field
   - Copy the Value
   - Paste it in the "Value" field
   - Make sure to select "Production" environment
   - Click "Save"
4. Redeploy: Go to Deployments → Click "Redeploy" on latest deployment

---

## Important Notes:

⚠️  NEXTAUTH_URL must match your Vercel domain exactly
⚠️  After Vercel assigns your domain, update NEXTAUTH_URL
⚠️  MongoDB URI is already configured to accept connections
⚠️  Keep the JWT secret secure - never share it publicly
⚠️  Don't commit .env.local to Git (already in .gitignore)

---

## Verify Deployment:

After adding env vars and redeploying:
1. Visit your Vercel URL
2. Try logging in with: sarthaknk08@gmail.com / Sarthak@2008
3. Check that PDF generation works
4. Verify analytics load correctly

---

## If You Need a Different JWT Secret:

Generate a new one here: https://generate-secret.vercel.app/32

Or use this command in terminal:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

---
