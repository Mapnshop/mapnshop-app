-- Helper function to check if user is a member of a business
CREATE OR REPLACE FUNCTION is_business_member(bid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM business_members 
    WHERE business_id = bid 
    AND (
      user_id = auth.uid() 
      OR 
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Orders Policy to allow staff access
DROP POLICY IF EXISTS "Users can view own business orders" ON orders;
CREATE POLICY "Team can view orders" ON orders FOR SELECT
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
  OR is_business_member(business_id)
);

DROP POLICY IF EXISTS "Users can create orders for own business" ON orders;
CREATE POLICY "Team can create orders" ON orders FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
  OR is_business_member(business_id)
);

DROP POLICY IF EXISTS "Users can update own business orders" ON orders;
CREATE POLICY "Team can update orders" ON orders FOR UPDATE
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
  OR is_business_member(business_id)
);

-- Update Customers Policy
DROP POLICY IF EXISTS "Users can view own business customers" ON customers;
CREATE POLICY "Team can view customers" ON customers FOR SELECT
USING (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
  OR is_business_member(business_id)
);

CREATE POLICY "Team can create customers" ON customers FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT id FROM businesses WHERE owner_id = auth.uid()
  )
  OR is_business_member(business_id)
);
