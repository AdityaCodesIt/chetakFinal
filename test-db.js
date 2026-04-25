import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vhpsaeyfdeiczytgtsvw.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocHNhZXlmZGVpY3p5dGd0c3Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA1NDQyMCwiZXhwIjoyMDkyNjMwNDIwfQ.tLFADU_v3cLi1OAagsJnvQkoqvI9C9HXvDdJBy2_wm8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function test() {
  // Test reading
  console.log("Checking if table exists...");
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error("Select Error:", error);
    return;
  }
  console.log("Select successful, table exists.");
  
  // Try inserting a fake user to see schema issues
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const { error: insertError } = await supabase.from('users').insert([{
    auth_id: null,
    full_name: 'Test',
    email: 'test@example.com',
    phone_number: '123',
    country: 'US',
    state: 'CA',
    region: 'LA',
    pin: '90001',
    preferred_language: 'EN',
    detected_locale: 'EN',
    emergency_override_english: true
  }]);
  
  if (insertError) {
    console.error("Insert Error:", insertError);
  } else {
    console.log("Insert successful! Deleting test record...");
    await supabase.from('users').delete().eq('email', 'test@example.com');
  }
}

test();
