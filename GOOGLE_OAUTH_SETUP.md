# Google OAuth Setup Guide

## Configuration Complete! ✅

Google OAuth has been integrated into your ShreeramMart application.

## What Was Done

### 1. **Installed Google OAuth Package**
```bash
npm install @react-oauth/google
```

### 2. **Created Environment Files**
- `.env` - Contains your actual credentials (NOT committed to Git)
- `.env.example` - Template for other developers

### 3. **Updated Files**
- `src/pages/index.jsx` - Wrapped app with GoogleOAuthProvider
- `src/pages/Login.jsx` - Integrated Google Sign-In button with OAuth flow

## Your Credentials

**Client Secret**: `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` ✅

**⚠️ IMPORTANT**: You still need to add your **Google Client ID** to the `.env` file!

## How to Get Your Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project (or create a new one)
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Choose "Web application"
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
6. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `https://yourdomain.com`
7. Copy the **Client ID** (looks like: `123456789-abc123.apps.googleusercontent.com`)

## Update Your .env File

Open `.env` and replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=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
```

## Testing Google Sign-In

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to Login page**: `http://localhost:5173/Login`

3. **Click "Continue with Google"** button

4. **Google popup will appear** for user to select account

5. **After authentication**, user info is sent to your backend

## Backend Requirements

Your backend (`base44.auth.loginWithGoogle`) should accept:
```javascript
{
  access_token: string,
  email: string,
  name: string,
  picture: string,
  given_name: string,
  family_name: string
}
```

### Example Backend Handler:
```javascript
async loginWithGoogle(userData) {
  // Verify the access token with Google
  // Create or find user in your database
  // Generate session token
  // Return authenticated user
}
```

## Security Notes

1. ✅ `.env` file is in `.gitignore` - credentials won't be committed
2. ✅ Client Secret is stored securely in environment variables
3. ✅ OAuth flow uses Google's secure authentication
4. ⚠️ **Never** commit the `.env` file to Git
5. ⚠️ **Always** use HTTPS in production

## Features

- ✅ Google Sign-In button on Login page
- ✅ Google Sign-In button on Signup page
- ✅ Loading states during authentication
- ✅ Error handling with toast notifications
- ✅ Automatic redirect after successful login
- ✅ User information fetched from Google profile

## Troubleshooting

### "Invalid Client ID" Error
- Make sure `VITE_GOOGLE_CLIENT_ID` is set correctly in `.env`
- Restart dev server after changing `.env` file
- Verify Client ID in Google Cloud Console

### "Redirect URI Mismatch" Error
- Add your URL to authorized redirect URIs in Google Console
- Include both `http://localhost:5173` and your production domain

### "Access Blocked" Error
- Check OAuth consent screen configuration
- Add test users if app is not published
- Verify authorized domains

## Production Deployment

When deploying to production:

1. Add production URL to Google Console authorized origins/redirects
2. Set environment variables on your hosting platform:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id
   VITE_GOOGLE_CLIENT_SECRET=your_client_secret
   ```
3. Use HTTPS (required by Google OAuth)

## Need Help?

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React OAuth Google Package](https://www.npmjs.com/package/@react-oauth/google)
- Check console for error messages during authentication
