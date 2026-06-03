const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const clientCode = fs.readFileSync('./supabase-client.js', 'utf8');
const supabaseUrlMatch = clientCode.match(/const SUPABASE_URL = ['"]([^'"]+)['"]/);
const supabaseKeyMatch = clientCode.match(/const SUPABASE_ANON_KEY = ['"]([^'"]+)['"]/);

if (supabaseUrlMatch && supabaseKeyMatch) {
  const supabase = createClient(supabaseUrlMatch[1], supabaseKeyMatch[1]);
  supabase.from('products').select('*').then(({ data, error }) => {
    console.log("Products:");
    console.log(JSON.stringify(data, null, 2));
    console.log("Error:", error);
  });
} else {
  console.log("Could not parse supabase credentials");
}
