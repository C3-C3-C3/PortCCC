const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectCard.tsx', 'utf-8');

// Ensure no stray green shadows in ProjectCard buttons
content = content.replace(/hover:text-brand-green/g, 'hover:text-cyan-400');
content = content.replace(/border-brand-green/g, 'border-cyan-400');
content = content.replace(/rgba\(27,242,163/g, 'rgba(0,255,255');

fs.writeFileSync('src/components/ProjectCard.tsx', content);
