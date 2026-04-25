import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vhpsaeyfdeiczytgtsvw.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocHNhZXlmZGVpY3p5dGd0c3Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA1NDQyMCwiZXhwIjoyMDkyNjMwNDIwfQ.tLFADU_v3cLi1OAagsJnvQkoqvI9C9HXvDdJBy2_wm8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function check() {
  const { data, error } = await supabase.from('users').select('*');
  console.log("Users in DB:", data);
  console.log("Error:", error);
}

check();
