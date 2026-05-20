# 🔥 COMPLETE FIX - Step by Step Instructions

## 📊 CURRENT ISSUES (From Screenshots)

### Issue 1: Profile Not Found (Non-logged-in users)
- **Screenshot**: Shows "Profile Not Found"
- **URL**: avatartalk.co/fosik
- **Cause**: RPC function `get_public_profile_by_username()` doesn't exist

### Issue 2: Something Went Wrong (Logged-in users)
- **Screenshot**: Shows "Something went wrong - Please refresh the page"
- **URL**: avatartalk.co/fosik
- **Cause**: Same root cause - missing database functions

### Issue 3: Failed to Create Payment Order
- **Cause**: Missing `credit_user_tokens()` function + Razorpay keys not configured

---

## ✅ SOLUTION (Follow These Exact Steps)

### STEP 1: Apply Database Fix (5 minutes)

#### 1.1 Open Supabase Dashboard
```
https://supabase.com/dashboard/project/hnxnvdzrwbtmcohdptfq
```

#### 1.2 Go to SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"+ New query"** button

#### 1.3 Copy the Complete Fix Script
- Open file: `/app/ULTIMATE_FIX_SCRIPT.sql`
- Copy **ENTIRE CONTENTS** (all 400+ lines)

#### 1.4 Paste and Run
- Paste into the SQL Editor
- Click **"Run"** button (or press Ctrl+Enter)

#### 1.5 Wait for Success
You should see output like:
```
✅ ALL FIXES APPLIED SUCCESSFULLY!
Profiles are now publicly accessible
Payment functions are ready
```

Plus a list of available usernames to test.

---

### STEP 2: Configure Razorpay Keys (2 minutes)

#### 2.1 Get Your Razorpay Keys

**Option A: Test Mode (Recommended for testing)**
1. Login to: https://dashboard.razorpay.com
2. Make sure you're in **Test Mode** (toggle in top-left)
3. Go to: Settings → API Keys
4. Click "Generate Test Key" if you don't have one
5. Copy:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (click "show" to reveal)

**Option B: Live Mode (Only after testing works)**
1. Login to: https://dashboard.razorpay.com
2. Switch to **Live Mode** (toggle in top-left)
3. Go to: Settings → API Keys  
4. Generate Live Key
5. Copy both Key ID and Secret

#### 2.2 Add Keys to Supabase

1. Go to: https://supabase.com/dashboard/project/hnxnvdzrwbtmcohdptfq
2. Click: **Edge Functions** in left sidebar
3. Click: **Secrets** tab (or **Manage Secrets** button)
4. Add these two secrets:

```
Name: RAZORPAY_KEY_ID
Value: rzp_test_XXXXXXXXXXXXXXXX
(paste your Key ID without quotes)

Name: RAZORPAY_KEY_SECRET
Value: YYYYYYYYYYYYYYYYYYYY
(paste your Key Secret without quotes)
```

5. Click **Save** or **Add Secret** for each one

#### 2.3 Verify Keys Were Added
You should see both secrets listed:
- ✅ RAZORPAY_KEY_ID
- ✅ RAZORPAY_KEY_SECRET
- ✅ SUPABASE_URL (already there)
- ✅ SUPABASE_ANON_KEY (already there)
- ✅ SUPABASE_SERVICE_ROLE_KEY (already there)

---

### STEP 3: Test Profile Visibility (1 minute)

#### 3.1 Test Non-Logged-In Access
1. Open a **new incognito/private window**
2. Go to: `https://avatartalk.co/fosik`
3. **Expected Result**: Profile loads with avatar, name, bio
4. **NOT Expected**: "Profile Not Found" error

#### 3.2 Test Different Usernames
The SQL script output showed available usernames. Try them:
- `https://avatartalk.co/kousik`
- Or any other username from the list

#### 3.3 If Still "Profile Not Found"
This means the username doesn't exist in database. Check:
```sql
-- Run in Supabase SQL Editor:
SELECT username, display_name FROM profiles 
WHERE username IS NOT NULL 
LIMIT 20;
```

Use one of these usernames to test.

---

### STEP 4: Test Token Purchase (3 minutes)

#### 4.1 Login to Your Site
1. Go to: `https://avatartalk.co`
2. Click "Sign In"
3. Login with your account

#### 4.2 Go to Token Purchase Page
1. Navigate to: Settings → Buy Tokens
2. Or directly: `https://avatartalk.co/settings/buy-tokens`

#### 4.3 Try Buying Tokens
1. Select any token package (e.g., ₹1000 = 1,000,000 tokens)
2. Click "Pay" button
3. **Expected**: Razorpay checkout popup opens
4. **NOT Expected**: "Failed to create payment order" error

#### 4.4 Complete Test Payment
If in Test Mode, use these test card details:
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: 123
OTP: 1234 (if asked)
```

#### 4.5 Verify Tokens Added
- After payment success, tokens should be added to your balance
- Check token count in the top navigation bar
- Should increase immediately without page refresh

---

### STEP 5: Test Plan Purchase (3 minutes)

#### 5.1 Go to Pricing Page
1. Navigate to: `https://avatartalk.co/pricing`
2. You should see Creator, Pro, Business plans

#### 5.2 Try Buying a Plan
1. Click "Subscribe Now" on any plan (e.g., Creator)
2. **Expected**: Razorpay checkout popup opens
3. **NOT Expected**: "Failed to start checkout" error

#### 5.3 Complete Test Payment
- Use same test card details as above
- Complete the payment

#### 5.4 Verify Plan Activated
- After payment success, your plan should activate
- Check your dashboard/settings
- Plan badge should update
- Unlocked features should be available

---

## 🧪 VERIFICATION CHECKLIST

After completing all steps, verify:

### Profile Access:
- [ ] Non-logged-in users can view profiles
- [ ] No "Profile Not Found" error
- [ ] Profile loads in < 3 seconds
- [ ] Avatar, name, bio visible
- [ ] No "Something went wrong" error

### Token Purchase:
- [ ] "Pay" button opens Razorpay popup
- [ ] Test payment completes successfully
- [ ] Tokens added to balance immediately
- [ ] No "Failed to create payment order" error

### Plan Purchase:
- [ ] "Subscribe Now" opens Razorpay popup
- [ ] Test payment completes successfully
- [ ] Plan activates immediately
- [ ] No "Failed to start checkout" error

---

## 🔍 TROUBLESHOOTING

### Issue: Still "Profile Not Found"

**Cause**: Username doesn't exist or typo in URL

**Fix**:
```sql
-- Find valid usernames:
SELECT username FROM profiles WHERE username IS NOT NULL;
```

Test with a username that actually exists.

---

### Issue: Still "Failed to create payment order"

**Possible Causes**:

#### Cause 1: Razorpay Keys Not Set
**Check**: Supabase → Edge Functions → Secrets
**Fix**: Verify both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET exist

#### Cause 2: Keys Have Quotes or Spaces
**Check**: Key value shouldn't have quotes
**Fix**: 
```
❌ Wrong: "rzp_test_abc123"
✅ Correct: rzp_test_abc123
```

#### Cause 3: Using Live Keys in Test Mode
**Check**: Key ID should start with `rzp_test_` for testing
**Fix**: Use test mode keys for development

#### Cause 4: Database Function Not Created
**Check**: Run this in SQL Editor:
```sql
SELECT proname FROM pg_proc WHERE proname = 'credit_user_tokens';
```
**Expected**: 1 row returned
**Fix**: Re-run the ULTIMATE_FIX_SCRIPT.sql

---

### Issue: Razorpay Popup Doesn't Open

**Cause**: Frontend issue or script not loaded

**Fix 1**: Clear browser cache
```
Ctrl + Shift + Delete → Clear cache → Reload
```

**Fix 2**: Check browser console (F12)
Look for JavaScript errors

**Fix 3**: Ensure Razorpay script loaded
Check if `window.Razorpay` exists in console

---

## 📊 DATABASE FUNCTIONS CREATED

After running the script, these functions exist:

### 1. get_public_profile_by_username(username)
- **Purpose**: Fetch profile by username for public access
- **Used by**: ProfilePage component
- **Security**: SECURITY DEFINER (bypasses RLS)

### 2. get_public_profile(user_id)
- **Purpose**: Fetch profile by ID (compatibility)
- **Used by**: Legacy code
- **Security**: SECURITY DEFINER

### 3. credit_user_tokens(user_id, tokens, reason)
- **Purpose**: Add tokens to user balance
- **Used by**: Payment verification
- **Security**: SECURITY DEFINER (only service_role can call)

---

## 🎯 WHAT THE SCRIPT FIXED

### Database Layer:
- ✅ Created 3 RPC functions
- ✅ Fixed RLS policies on profiles table
- ✅ Fixed RLS policies on 7 related tables
- ✅ Added multi-month pricing columns
- ✅ Created token_events audit table
- ✅ Fixed payment table structures

### Security:
- ✅ Public read access to safe profile columns only
- ✅ Private fields (email, phone) remain hidden
- ✅ SECURITY DEFINER functions bypass RLS safely
- ✅ Atomic token operations prevent race conditions

### Payments:
- ✅ Token credit function with row locking
- ✅ Audit trail for all token transactions
- ✅ Plan pricing for 3/6/12 month subscriptions
- ✅ Payment verification columns added

---

## 🚀 RAZORPAY TEST MODE vs LIVE MODE

### Test Mode:
- ✅ Use for development and testing
- ✅ Keys start with `rzp_test_`
- ✅ No real money charged
- ✅ Use test card numbers
- ✅ Safe to test repeatedly

### Live Mode:
- ⚠️ Use only after testing works perfectly
- ⚠️ Keys start with `rzp_live_`
- ⚠️ Real money will be charged
- ⚠️ Requires business verification
- ⚠️ Must follow Razorpay compliance

**Recommendation**: Test everything with Test Mode first!

---

## 💡 QUICK DEBUG COMMANDS

### Check if database fix was applied:
```sql
-- Should return 3 functions
SELECT proname FROM pg_proc 
WHERE proname IN ('get_public_profile_by_username', 'get_public_profile', 'credit_user_tokens');
```

### Check RLS policies:
```sql
-- Should return at least 1 policy
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Test profile function:
```sql
-- Replace 'fosik' with actual username
SELECT * FROM get_public_profile_by_username('fosik');
```

### Check Razorpay keys (cannot see values):
```sql
-- In Supabase dashboard → Edge Functions → Secrets
-- Just verify both keys are listed
```

---

## ✅ SUCCESS CRITERIA

You'll know everything works when:

1. **Profile Test**:
   - Open `avatartalk.co/fosik` in incognito
   - See full profile without login
   - No errors

2. **Token Purchase Test**:
   - Click "Pay" button
   - Razorpay popup opens
   - Complete test payment
   - Tokens added instantly

3. **Plan Purchase Test**:
   - Click "Subscribe Now"
   - Razorpay popup opens
   - Complete test payment
   - Plan activates instantly

---

## 📞 STILL NOT WORKING?

If after following ALL steps above, it still doesn't work:

1. **Screenshot the error** (exact error message)
2. **Check SQL script output** (any errors?)
3. **Verify Razorpay keys added** (both keys present?)
4. **Test with different username** (does it exist in DB?)
5. **Check browser console** (F12 → Console tab)

Common mistakes:
- ❌ Didn't run the full SQL script
- ❌ Razorpay keys have quotes or spaces
- ❌ Testing with username that doesn't exist
- ❌ Using wrong Supabase project

---

**Next Action: Run the ULTIMATE_FIX_SCRIPT.sql in Supabase SQL Editor NOW!** 🚀

**Expected Time: 7 minutes total**
**Expected Result: Everything works perfectly**
