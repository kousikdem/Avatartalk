import { supabase } from './integrations/supabase/client';

// Test Supabase connection and check database structure
async function testSupabaseConnection() {
  console.log('=== Testing Supabase Connection ===');
  
  // Test 1: Check if client is initialized
  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + '...');
  
  try {
    // Test 2: Check auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth Status:', authError ? 'Error' : 'Connected');
    if (authError) console.error('Auth Error:', authError);
    
    // Test 3: Try to query users table (might be 'users' or 'profiles')
    console.log('\n=== Checking Tables ===');
    
    // Try 'users' table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, full_name, display_name')
      .limit(5);
    
    if (!usersError && usersData) {
      console.log('✓ "users" table found with', usersData.length, 'users');
      console.log('Sample user:', usersData[0]);
      console.log('Columns:', Object.keys(usersData[0] || {}));
    } else {
      console.log('✗ "users" table:', usersError?.message);
    }
    
    // Try 'profiles' table
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (!profilesError && profilesData) {
      console.log('✓ "profiles" table found with', profilesData.length, 'profiles');
      console.log('Sample profile:', profilesData[0]);
      console.log('Columns:', Object.keys(profilesData[0] || {}));
    } else {
      console.log('✗ "profiles" table:', profilesError?.message);
    }
    
    // Test 4: Check RPC function
    console.log('\n=== Checking RPC Functions ===');
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_public_profile', { 
      profile_id: 'test-id' 
    });
    
    if (rpcError) {
      console.log('✗ get_public_profile RPC:', rpcError.message);
    } else {
      console.log('✓ get_public_profile RPC exists');
    }
    
  } catch (error) {
    console.error('Connection Error:', error);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run test
testSupabaseConnection();

export { testSupabaseConnection };
