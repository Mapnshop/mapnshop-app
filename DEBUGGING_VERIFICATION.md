# Debugging Business Verification Issues

## Issue: No pending businesses showing in admin panel

### Possible Causes:

1. **Businesses created before migration**
   - Old businesses don't have `verification_status` field
   - Solution: Run migration to add the field and set existing businesses to 'approved'

2. **New businesses not being created with 'pending' status**
   - Check if `businessApi.create` is being called correctly
   - Verify the business record in Supabase

3. **Admin user not set up correctly**
   - Check if user has `role = 'admin'` in profiles table

---

## Debugging Steps:

### 1. Check Business Records in Supabase

Go to Supabase Dashboard → Table Editor → `businesses` table

Look for:
- Does the `verification_status` column exist?
- What is the status of existing businesses?
- Are there any businesses with status = 'pending'?

### 2. Check Profiles Table

Go to Supabase Dashboard → Table Editor → `profiles` table

Look for:
- Does your user have a profile record?
- Is the `role` set to 'admin'?

### 3. Test Business Creation

Create a new business account and check:
- In the console logs, look for "verification_status" in the business object
- In Supabase, check if the new business has `verification_status = 'pending'`

### 4. SQL Query to Check Data

Run this in Supabase SQL Editor:

```sql
-- Check all businesses and their verification status
SELECT id, name, verification_status, submitted_at, created_at 
FROM businesses 
ORDER BY created_at DESC;

-- Check all profiles
SELECT p.id, p.role, u.email 
FROM profiles p
JOIN auth.users u ON p.id = u.id;

-- Check pending businesses (what admin should see)
SELECT * FROM businesses WHERE verification_status = 'pending';
```

---

## Quick Fix: Update Existing Businesses

If you have businesses that were created before the migration, run this SQL:

```sql
-- Set all existing businesses to 'approved' if they don't have a status
UPDATE businesses 
SET verification_status = 'approved', 
    verified_at = NOW()
WHERE verification_status IS NULL OR verification_status = 'draft';
```

---

## Create Test Pending Business

To test the admin panel, create a test pending business:

```sql
-- Create a test pending business (replace USER_ID with actual user ID)
INSERT INTO businesses (owner_id, name, address, phone, category, verification_status, submitted_at)
VALUES (
  'USER_ID_HERE',
  'Test Pending Business',
  '123 Test St',
  '+1234567890',
  'restaurant',
  'pending',
  NOW()
);
```
