const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('Checking Supabase connection...');
  
  // Try to query liabilities
  const { data, error } = await supabase
    .from('liabilities')
    .select('count', { count: 'exact', head: true });

  if (error) {
    console.log('Error querying liabilities table:', error.message);
    if (error.message.includes('not found')) {
      console.log('CONFIRMED: liabilities table is missing.');
    }
  } else {
    console.log('SUCCESS: liabilities table exists.');
  }

  // List all available tables via a simple query to an existing one
  const tablesToCheck = [
    'expenses', 'categories', 'events', 'budgets', 
    'income', 'savings_goals', 'investments', 'assets', 'liabilities'
  ];

  console.log('\nAuditing other core tables:');
  for (const table of tablesToCheck) {
    const { error: tableError } = await supabase
      .from(table)
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.log(`- ${table}: ❌ MISSING (${tableError.message})`);
    } else {
      console.log(`- ${table}: ✅ OK`);
    }
  }
}

checkTables();
