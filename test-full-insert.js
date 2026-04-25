import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vhpsaeyfdeiczytgtsvw.supabase.co';
const SUPABASE_SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocHNhZXlmZGVpY3p5dGd0c3Z3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA1NDQyMCwiZXhwIjoyMDkyNjMwNDIwfQ.tLFADU_v3cLi1OAagsJnvQkoqvI9C9HXvDdJBy2_wm8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function testFullInsert() {
  const { data, error } = await supabase.from('users').insert([{
    auth_id: '11111111-1111-1111-1111-111111111111', // Fake UUID
    full_name: 'Aditya Dwivedi',
    phone_number: '9999999999',
    country: 'INDIA',
    state: 'MAHARASHTRA',
    region: 'MUMBAI',
    pin: '400001',
    email: 'aditya@example.com',
    verification_phone: '',
    preferred_language: 'ENGLISH',
    detected_locale: 'EN-IN',
    emergency_override_english: false
  }]);
  
  console.log("Full Insert Data:", data);
  console.log("Full Insert Error:", error);
}

testFullInsert();
