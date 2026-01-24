-- Create business_members table
CREATE TABLE IF NOT EXISTS business_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    email TEXT, -- For pending invites or mapping
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_business_members_user_id ON business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_email ON business_members(email);
CREATE INDEX IF NOT EXISTS idx_business_members_business_id ON business_members(business_id);

-- Enable RLS
ALTER TABLE business_members ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Members can view their own business members
CREATE POLICY "Members can view team" 
ON business_members FOR SELECT 
USING (
    business_id IN (
        SELECT business_id FROM business_members 
        WHERE user_id = auth.uid()
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
);

-- 2. Owners/Admins can manage members
CREATE POLICY "Owners can manage team" 
ON business_members FOR ALL 
USING (
    business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
    OR 
    exists (
        SELECT 1 FROM business_members m 
        WHERE m.business_id = business_members.business_id 
        AND m.user_id = auth.uid() 
        AND m.role IN ('owner', 'admin')
    )
);

-- Update Business RLS to allow staff access
-- (This requires updating existing policies on 'businesses' and 'orders' tables)
-- For now, we assume implicit owner access, but for staff we need:

-- GRANT usage on schema public to authenticated;
-- GRANT all on all tables in schema public to authenticated; -- logic handled by RLS

-- Migration to link existing owners as 'owner' in members table
INSERT INTO business_members (business_id, user_id, role, status)
SELECT id, owner_id, 'owner', 'active'
FROM businesses
WHERE NOT EXISTS (
    SELECT 1 FROM business_members WHERE business_members.business_id = businesses.id
);
