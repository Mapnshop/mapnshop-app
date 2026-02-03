# Database Migration Instructions

## Migration: Add Customers Unique Constraint

**File**: `supabase/migrations/20260203183733_add_customers_unique_constraint.sql`

### Purpose
Adds a unique constraint on `(business_id, phone)` to enable proper customer upsert operations when creating orders.

### To Apply This Migration

#### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20260203183733_add_customers_unique_constraint.sql`
4. Paste and run the SQL

#### Option 2: Supabase CLI
```bash
# First, link your project (one-time setup)
npx supabase link --project-ref YOUR_PROJECT_REF

# Then push the migration
npx supabase db push
```

#### Option 3: Manual SQL Execution
Run this SQL directly in your database:

```sql
-- Remove any duplicate entries (keeping the most recent one)
DELETE FROM customers a USING customers b
WHERE a.id < b.id 
  AND a.business_id = b.business_id 
  AND a.phone = b.phone;

-- Add the unique constraint
ALTER TABLE customers 
ADD CONSTRAINT customers_business_phone_unique 
UNIQUE (business_id, phone);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_business_phone 
ON customers(business_id, phone);
```

### Verification
After running the migration, test customer creation:
1. Create a new order with a customer
2. Create another order with the same customer phone number
3. Verify no "unique constraint" errors appear in the logs
