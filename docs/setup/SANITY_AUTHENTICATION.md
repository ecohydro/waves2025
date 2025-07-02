# Sanity Studio Authentication Setup

## Overview

This document explains how to set up authentication for your Sanity Studio. Sanity provides built-in authentication that's secure and easy to manage.

## Method 1: Using Sanity's Built-in Authentication (Recommended)

### Step 1: Access Your Sanity Project Dashboard

1. Go to https://www.sanity.io/manage
2. Sign in with your Sanity account
3. Find your project (ID: `6r5yojda`)

### Step 2: Manage Team Members

1. In your project dashboard, click on **"Members"** in the left sidebar
2. Click **"Invite member"** to add new users
3. Enter their email address and assign appropriate roles:
   - **Viewer**: Can only view content
   - **Editor**: Can edit content
   - **Administrator**: Full access including user management

### Step 3: Environment Variables (Optional)

Add these to your `.env.local` file for additional security:

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=6r5yojda
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_here

# Optional: Restrict Studio access to specific domains
SANITY_STUDIO_ALLOWED_ORIGINS=https://yourdomain.com,https://studio.yourdomain.com

# Optional: Enable CORS for specific origins
SANITY_STUDIO_CORS_ORIGINS=https://yourdomain.com,https://studio.yourdomain.com
```

## Method 2: Custom Authentication with NextAuth.js

If you need more control over authentication, you can implement custom authentication using NextAuth.js.

### Step 1: Install Dependencies

```bash
npm install next-auth
```

### Step 2: Create Authentication Configuration

Create `src/lib/auth.ts`:

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

export default NextAuth(authOptions);
```

### Step 3: Set up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### Step 4: Environment Variables

Add to `.env.local`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Method 3: IP Whitelisting (Additional Security)

You can restrict access to specific IP addresses by configuring your hosting provider or using a reverse proxy.

### Example with Vercel

Create `vercel.json`:

```json
{
  "functions": {
    "src/app/studio/[[...tool]]/page.tsx": {
      "headers": {
        "x-forwarded-for": "your_ip_address"
      }
    }
  }
}
```

## Security Best Practices

1. **Use HTTPS in production**
2. **Regularly rotate API tokens**
3. **Limit API token permissions**
4. **Monitor access logs**
5. **Use strong passwords for admin accounts**
6. **Enable two-factor authentication where possible**

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**: Check user permissions in Sanity dashboard
2. **CORS errors**: Verify `SANITY_STUDIO_CORS_ORIGINS` configuration
3. **Authentication loops**: Clear browser cookies and cache

### Getting Help

- [Sanity Documentation](https://www.sanity.io/docs)
- [Sanity Community](https://www.sanity.io/community)
- [NextAuth.js Documentation](https://next-auth.js.org/)

## Next Steps

After setting up authentication:

1. Test access with different user roles
2. Set up proper backup procedures
3. Configure monitoring and alerts
4. Document access procedures for your team
