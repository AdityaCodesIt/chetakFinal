-- Drop table if it exists
DROP TABLE IF EXISTS public.users;

-- Create the users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    full_name TEXT,
    email TEXT UNIQUE,
    phone_number TEXT,
    verification_phone TEXT,
    country TEXT,
    state TEXT,
    region TEXT,
    pin TEXT,
    preferred_language TEXT,
    detected_locale TEXT DEFAULT 'AUTO-DETECT',
    emergency_override_english BOOLEAN DEFAULT false
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- 1. Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = auth_id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = auth_id);

-- 3. Allow insertion during registration (often requires a trigger or an insert policy)
CREATE POLICY "Users can insert their own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid() = auth_id OR auth_id IS NULL);
