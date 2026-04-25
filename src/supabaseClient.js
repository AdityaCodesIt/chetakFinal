import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vhpsaeyfdeiczytgtsvw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocHNhZXlmZGVpY3p5dGd0c3Z3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTQ0MjAsImV4cCI6MjA5MjYzMDQyMH0.euAy3lI-eZfOeoAq7JhoJ6Lz9AAvQyfdnva74E0PIV0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
