# 🚀 Vercel Deployment Guide - WAVES Lab Website

## Quick Deployment Steps

### 1. Connect to Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import `ecohydro/waves2025` repository
4. Vercel will auto-detect Next.js configuration ✅

### 2. Configure Environment Variables (5 minutes)

In the Vercel project settings, add these environment variables:

#### Required - Sanity CMS
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=6r5yojda
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2023-12-19
```

#### Required - Copy from your .env.local
```bash
SANITY_API_EDITOR_TOKEN=your_token_here
SANITY_API_DEPLOY_TOKEN=your_token_here
```

#### Optional - Enhanced Features
```bash
SEMANTIC_SCHOLAR_API_KEY=your_key_here
SEMANTIC_SCHOLAR_AUTHOR_ID=your_id_here
CMS_API_KEY=generate_a_secure_random_string
SANITY_PREVIEW_SECRET=generate_a_secure_random_string
```

**Generate secure secrets:**
```bash
# Run this locally to generate random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy (2 minutes)

1. Click **"Deploy"** in Vercel
2. Wait for build to complete (~3-5 minutes)
3. Vercel will give you a URL like: `https://waves2025.vercel.app`

### 4. Add Custom Domain - waveslab.org (10 minutes)

#### In Vercel:
1. Go to your project → **Settings** → **Domains**
2. Add these domains:
   - `waveslab.org` (primary)
   - `www.waveslab.org` (redirect to primary)
3. Vercel will show you the exact DNS records to add

#### In Your DNS Provider (for waveslab.org):

**Add these A records for root domain:**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: A
Name: @
Value: 76.76.19.19
TTL: 3600
```

**Add this CNAME for www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Important:** Delete any existing A or CNAME records for `@` or `www` that point elsewhere.

**Wait 5-10 minutes** for DNS propagation, then waveslab.org will be live!

## 🎯 Post-Deployment Checklist

- [ ] Site loads at Vercel URL
- [ ] Custom domain configured
- [ ] Test a few pages (home, people, publications)
- [ ] Check Sanity Studio access at `/studio`
- [ ] Verify images load from Sanity CDN
- [ ] Test search functionality
- [ ] Check mobile responsiveness

## 🔧 Troubleshooting

### Build Fails
- Check environment variables are set correctly
- Review build logs in Vercel dashboard
- Ensure all required env vars are present

### Images Don't Load
- Verify `NEXT_PUBLIC_SANITY_PROJECT_ID` is correct
- Check Sanity CORS settings allow your domain
- Go to Sanity project settings → API → CORS origins

### Sanity Studio Not Working
- Verify all `SANITY_API_*` tokens are set
- Check tokens have correct permissions in Sanity dashboard
- Add your Vercel domain to Sanity CORS origins

### DNS Not Working
- DNS propagation can take up to 24 hours (usually 5-10 minutes)
- Check DNS with: `dig yourdomain.com` or [dnschecker.org](https://dnschecker.org)
- Verify records match exactly what Vercel provided

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Sanity CORS Setup**: https://www.sanity.io/docs/cors
- **Project Issues**: Check GitHub Issues in your repo

## 🎉 You're Live!

Once deployed, your modern research lab website will be:
- ✅ Globally distributed via Vercel CDN
- ✅ Automatically deployed on every git push
- ✅ SSL/HTTPS enabled by default
- ✅ Preview deployments for every PR
- ✅ Easy content management via Sanity Studio

**Your website is now live and ready for the world to see!** 🌊
