-- User Profiles Table
-- This table stores additional user information beyond what's in auth.users

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'hr', 'admin')),
    department TEXT,
    employee_id TEXT,
    phone_number TEXT,
    profile_image TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, user_id),
    UNIQUE(tenant_id, employee_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "User profiles are viewable by tenant members" ON user_profiles
    FOR SELECT USING (tenant_id = current_setting('app.current_tenant')::uuid);

CREATE POLICY "User profiles are insertable by authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        tenant_id = current_setting('app.current_tenant')::uuid
    );

CREATE POLICY "User profiles are updatable by profile owner or admin" ON user_profiles
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'hr')
            AND tenant_id = current_setting('app.current_tenant')::uuid
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile after auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a basic user profile for new auth users
    -- The tenant_id will need to be set separately via the application
    INSERT INTO public.user_profiles (
        user_id,
        tenant_id,
        first_name,
        last_name,
        role
    ) VALUES (
        NEW.id,
        (SELECT id FROM tenants LIMIT 1), -- Default to first tenant for MVP
        COALESCE(NEW.raw_user_meta_data->>'first_name', 'New'),
        COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to get current user profile
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
    AND up.tenant_id = current_setting('app.current_tenant')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user profile
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
    AND tenant_id = current_setting('app.current_tenant')::uuid;

    RETURN QUERY
    SELECT * FROM get_current_user_profile();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;