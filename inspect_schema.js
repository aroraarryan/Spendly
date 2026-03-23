const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

async function inspectSchema() {
  console.log('Inspecting Supabase REST API schema via native fetch...');
  
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const schema = await response.json();
    const tables = Object.keys(schema.definitions || {});
    
    console.log('Available tables in schema cache:');
    tables.sort().forEach(t => console.log(`- ${t}`));

    if (tables.includes('liabilities')) {
       console.log('\nSUCCESS: liabilities is in the schema cache.');
    } else {
       console.log('\nFAILURE: liabilities is NOT in the schema cache.');
       console.log('Hint: Try running "NOTIFY pgrst, \'reload schema\';" in the Supabase SQL Editor.');
    }
  } catch (error) {
    console.error('Error inspecting schema:', error.message);
  }
}

inspectSchema();
