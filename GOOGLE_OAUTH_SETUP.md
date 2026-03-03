# Google OAuth Setup Guide for AvatarTalk.Co

## 🔐 Complete Google Login Integration

### Prerequisites
- Supabase project: hnxnvdzrwbtmcohdptfq
- Google Cloud Console access
- Your deployment URL

---

## Step 1: Configure Google OAuth in Google Cloud Console

### 1.1 Create OAuth 2.0 Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Select **Application type**: Web application
6. Name it: "AvatarTalk.Co"

### 1.2 Configure Authorized Redirect URIs

Add these redirect URIs:

```
https://hnxnvdzrwbtmcohdptfq.supabase.co/auth/v1/callback

# For local development
http://localhost:3000/auth/v1/callback
http://localhost:54321/auth/v1/callback

# For your production domains
https://avatartalk-p1ia4t6zc-kousik-kars-projects.vercel.app/auth/v1/callback
https://preview-fix-17.preview.emergentagent.com/auth/v1/callback
https://yourdomain.com/auth/v1/callback
```

### 1.3 Save Credentials

After creating, you'll get:
- **Client ID**: `something.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-something`

**Save these securely!**

---

## Step 2: Configure Supabase Authentication

### 2.1 Enable Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: **hnxnvdzrwbtmcohdptfq**
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and enable it

### 2.2 Add Google Credentials

In the Google provider settings:

```
Client ID: [paste from Google Console]
Client Secret: [paste from Google Console]
```

### 2.3 Configure Redirect URL

Supabase callback URL (automatically set):
```
https://hnxnvdzrwbtmcohdptfq.supabase.co/auth/v1/callback
```

### 2.4 Save Changes

Click **Save** to apply the configuration.

---

## Step 3: Test Google Login

### 3.1 Local Testing

1. Start your dev server:
   ```bash
   cd frontend
   yarn dev
   ```

2. Open http://localhost:3000
3. Click "Continue with Google"
4. Select Google account
5. Should redirect to dashboard

### 3.2 Production Testing

1. Deploy your site
2. Visit your production URL
3. Click "Continue with Google"
4. Authenticate
5. Should redirect to dashboard

---

## Step 4: Sync Existing Users

### 4.1 Understanding User Sync

When users login with Google:
- Supabase automatically creates user in `auth.users`
- Trigger creates profile in `profiles` table
- Email is synced from Google account
- Display name from Google account

### 4.2 Check User Creation Trigger

Verify trigger exists in Supabase:

```sql
-- This trigger should exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4.3 Manual User Sync (if needed)

If you have existing users in `auth.users` without profiles:

```sql
-- Create profiles for existing auth users
INSERT INTO public.profiles (id, username, email, display_name)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  email,
  COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

---

## Step 5: Verify Integration

### 5.1 Check Auth Flow

1. **Login**: User clicks "Continue with Google"
2. **Redirect**: Goes to Google OAuth consent screen
3. **Consent**: User approves access
4. **Callback**: Returns to Supabase callback URL
5. **Profile Creation**: Trigger creates profile
6. **Redirect**: User lands on dashboard

### 5.2 Check User Data

In Supabase Dashboard → Authentication → Users:

```
User should have:
- Email from Google
- ID (UUID)
- Provider: google
- Last sign in
```

In Supabase Dashboard → Table Editor → profiles:

```
Profile should have:
- Same ID as auth user
- Username (from email)
- Email
- Display name (from Google)
```

---

## Troubleshooting

### Issue 1: "OAuth provider not enabled"

**Solution**: Enable Google provider in Supabase Authentication → Providers

### Issue 2: "Invalid redirect URI"

**Solution**: 
1. Check Google Console authorized redirect URIs
2. Must include Supabase callback URL exactly:
   ```
   https://hnxnvdzrwbtmcohdptfq.supabase.co/auth/v1/callback
   ```

### Issue 3: "User logged in but no profile"

**Solution**:
1. Check if trigger exists (see Step 4.2)
2. Manually create profile:
   ```sql
   INSERT INTO profiles (id, email, username)
   VALUES ('user-uuid', 'user@email.com', 'username');
   ```

### Issue 4: "Access denied" error

**Solution**:
1. Verify Client ID and Secret in Supabase
2. Check Google OAuth consent screen is published
3. Add test users if in testing mode

### Issue 5: Redirects to wrong URL after login

**Solution**:
Update redirectTo in MainAuth.tsx:
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
  }
});
```

---

## Production Checklist

### Before Going Live

- [ ] Google OAuth Client created
- [ ] Authorized redirect URIs configured
- [ ] Supabase Google provider enabled
- [ ] Client ID and Secret added to Supabase
- [ ] User creation trigger verified
- [ ] Local testing successful
- [ ] Production domain added to redirect URIs
- [ ] Production testing successful
- [ ] User sync verified

### Security Best Practices

1. **Never commit secrets**:
   - Client Secret stays in Supabase only
   - Don't add to git/environment files

2. **Use production credentials**:
   - Different OAuth client for prod/dev
   - Production: Published consent screen
   - Development: Testing mode

3. **Limit redirect URIs**:
   - Only add trusted domains
   - Remove unused URLs

4. **Monitor authentication**:
   - Check Supabase logs
   - Monitor failed login attempts
   - Review user creation patterns

---

## Current Configuration

### Supabase Project
```
URL: https://hnxnvdzrwbtmcohdptfq.supabase.co
Project ID: hnxnvdzrwbtmcohdptfq
```

### Code Implementation

**File**: `/app/frontend/src/components/MainAuth.tsx`

```typescript
const handleGoogleLogin = async () => {
  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/?view=dashboard`,
      }
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Google login error:', error);
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

**Status**: ✅ Code implementation complete

---

## Next Steps

1. **Set up Google OAuth Client** (see Step 1)
2. **Configure Supabase** (see Step 2)
3. **Test login flow** (see Step 3)
4. **Verify user sync** (see Step 4)
5. **Deploy and test** production

**Need help?** Check troubleshooting section or Supabase documentation.

---

**Last Updated**: March 3, 2026
**Status**: Ready for configuration
