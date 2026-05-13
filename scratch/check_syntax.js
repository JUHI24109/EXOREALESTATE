
const fs = require('fs');
const content = fs.readFileSync('agent.html', 'utf8');
const scripts = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi);

if (scripts) {
  scripts.forEach((s, i) => {
    const code = s.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '');
    if (code.trim()) {
      try {
        new Function(code);
        console.log(`Script ${i} is valid.`);
      } catch (e) {
        console.error(`Script ${i} has syntax error:`, e.message);
        // console.log(code);
      }
    }
  });
}
