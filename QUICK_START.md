# 🚀 Quick Deploy to Vercel - waveslab.org

## Step-by-Step Deployment (30 minutes)

### ✅ Step 1: Deploy to Vercel (5 minutes)

1. **Go to:** [vercel.com/new](https://vercel.com/new)
2. **Sign in** with your GitHub account
3. **Import repository:** Search for `ecohydro/waves2025`
4. **Framework Preset:** Vercel auto-detects Next.js ✅
5. **Click "Deploy"** (don't add env vars yet - we'll do that next)

### ✅ Step 2: Add Environment Variables (5 minutes)

After initial deployment, go to your project:

1. Click **Settings** → **Environment Variables**
2. Add these **required** variables:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID
Value: 6r5yojda

NEXT_PUBLIC_SANITY_DATASET
Value: production

NEXT_PUBLIC_SANITY_API_VERSION
Value: 2023-12-19

SANITY_API_EDITOR_TOKEN
Value: [Copy from your .env.local file]

SANITY_API_DEPLOY_TOKEN
Value: [Copy from your .env.local file]
```

3. **Optional but recommended** - Add these:

```bash
SEMANTIC_SCHOLAR_API_KEY
Value: [Copy from your .env.local file]

SEMANTIC_SCHOLAR_AUTHOR_ID
Value: [Copy from your .env.local file]

CMS_API_KEY
Value: [Generate new: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]

SANITY_PREVIEW_SECRET
Value: [Generate new: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
```

4. After adding env vars, go to **Deployments** → click ⋯ on latest → **Redeploy**

### ✅ Step 3: Add waveslab.org Domain (10 minutes)

1. In Vercel project → **Settings** → **Domains**
2. Add domain: `waveslab.org` → Click **Add**
3. Add domain: `www.waveslab.org` → Click **Add**

Vercel will show you DNS records to add.

### ✅ Step 4: Configure DNS (10 minutes)

**Go to your domain registrar** (GoDaddy, Namecheap, Google Domains, etc.):

1. Find **DNS Management** or **DNS Settings**
2. **Delete** any existing A or CNAME records for `@` or `www`
3. **Add these new records:**

**Root domain (waveslab.org):**
```
Type: A
Host: @ (or leave blank)
Points to: 76.76.21.21
TTL: 3600 (or Auto)
```

```
Type: A
Host: @ (or leave blank)
Points to: 76.76.19.19
TTL: 3600 (or Auto)
```

**WWW subdomain (www.waveslab.org):**
```
Type: CNAME
Host: www
Points to: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

4. **Save** all changes
5. **Wait 5-10 minutes** for DNS to propagate

### ✅ Step 5: Verify Deployment (5 minutes)

Check these URLs (wait 5-10 min after DNS changes):

- ✅ **https://waveslab.org** - Your live site
- ✅ **https://www.waveslab.org** - Redirects to above
- ✅ **https://waveslab.org/studio** - Sanity Studio access
- ✅ **https://waveslab.org/people** - People page
- ✅ **https://waveslab.org/publications** - Publications page

### ✅ Step 6: Update Sanity CORS (5 minutes)

For Studio to work on your domain:

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project (`waves2025`)
3. Go to **Settings** → **API** → **CORS Origins**
4. Click **Add CORS Origin**
5. Add these origins:
   - `https://waveslab.org` (with credentials)
   - `https://www.waveslab.org` (with credentials)
   - `https://*.vercel.app` (for preview deployments)

## 🎉 You're Live!

Your site should now be accessible at:
- **https://waveslab.org**
- **https://www.waveslab.org**

## 🔧 Quick Troubleshooting

### DNS not working?
- Check DNS propagation: https://dnschecker.org/#A/waveslab.org
- Can take up to 24 hours, usually 5-10 minutes

### Build failing?
- Check environment variables are all set
- Look at build logs in Vercel dashboard

### Studio not loading?
- Add waveslab.org to Sanity CORS origins
- Verify SANITY_API tokens are set in Vercel

## 📞 Need Help?

Check the full **DEPLOYMENT_GUIDE.md** for detailed troubleshooting.

## Next Steps After Launch

1. Invite team members to Sanity Studio
2. Test content creation and publishing
3. Set up analytics (optional)
4. Share your new site! 🌊
