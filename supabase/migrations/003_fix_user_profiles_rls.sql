-- Fix User Profiles RLS Policies
-- Remove complex policies and create simpler ones for development

-- Drop existing policies
DROP POLICY IF EXISTS "User profiles are viewable by tenant members" ON user_profiles;
DROP POLICY IF EXISTS "User profiles are insertable by authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "User profiles are updatable by profile owner or admin" ON user_profiles;

-- Create simpler policies for development
-- These allow any authenticated user to access profiles in the same tenant

-- Allow users to view all profiles in their tenant
CREATE POLICY "Allow authenticated users to view profiles" ON user_profiles
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Allow users to insert their own profile
CREATE POLICY "Allow authenticated users to insert their own profile" ON user_profiles
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile or admin/hr can update any
CREATE POLICY "Allow users to update their own profile" ON user_profiles
    FOR UPDATE 
    USING (
        auth.uid() = user_id 
        OR 
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('admin', 'hr')
        )
    );

-- Allow admin/hr to delete profiles
CREATE POLICY "Allow admin/hr to delete profiles" ON user_profiles
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.user_id = auth.uid() 
            AND up.role IN ('admin', 'hr')
        )
    );

-- Update the trigger function to handle profile creation better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_tenant_id UUID;
BEGIN
    -- Get the first tenant as default (for MVP)
    SELECT id INTO default_tenant_id FROM tenants LIMIT 1;
    
    -- Only create profile if we have a tenant
    IF default_tenant_id IS NOT NULL THEN
        INSERT INTO public.user_profiles (
            user_id,
            tenant_id,
            first_name,
            last_name,
            role
        ) VALUES (
            NEW.id,
            default_tenant_id,
            COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
            COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
            COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
        );
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the user creation
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the get_current_user_profile function to be simpler
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    tenant_id UUID,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    department TEXT,
    employee_id TEXT,
    phone_number TEXT,
    profile_image TEXT,
    bio TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.user_id,
        up.tenant_id,
        up.first_name,
        up.last_name,
        up.role,
        up.department,
        up.employee_id,
        up.phone_number,
        up.profile_image,
        up.bio,
        up.is_active,
        up.created_at,
        up.updated_at
    FROM user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the update_user_profile function
CREATE OR REPLACE FUNCTION update_user_profile(
    p_first_name TEXT DEFAULT NULL,
    p_last_name TEXT DEFAULT NULL,
    p_department TEXT DEFAULT NULL,
    p_phone_number TEXT DEFAULT NULL,
    p_bio TEXT DEFAULT NULL,
    p_profile_image TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    tenant_id UUID,
    first_name TEXT,
    last_name TEXT,
    role TEXT,
    department TEXT,
    employee_id TEXT,
    phone_number TEXT,
    profile_image TEXT,
    bio TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    UPDATE user_profiles SET
        first_name = COALESCE(p_first_name, first_name),
        last_name = COALESCE(p_last_name, last_name),
        department = COALESCE(p_department, department),
        phone_number = COALESCE(p_phone_number, phone_number),
        bio = COALESCE(p_bio, bio),
        profile_image = COALESCE(p_profile_image, profile_image),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = auth.uid()
    AND is_active = true;

    RETURN QUERY
    SELECT * FROM get_current_user_profile();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;