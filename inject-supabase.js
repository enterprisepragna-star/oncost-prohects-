const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

const scripts = `
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="supabase-client.js"></script>
`;

for (let file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('supabase-client.js')) {
    content = content.replace('</head>', scripts + '</head>');
    fs.writeFileSync(file, content);
    console.log('Injected Supabase into ' + file);
  }
}
