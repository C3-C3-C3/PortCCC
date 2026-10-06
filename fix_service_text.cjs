const fs = require('fs');
const file = 'src/components/ServicesSection.tsx';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(/isHovered \? 'tracking-wider text-cyan-500' : 'text-brand-red tracking-wide'/g, "isHovered ? 'tracking-wider text-brand-red brightness-110 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : 'text-brand-red tracking-wide'");

fs.writeFileSync(file, content);
console.log("Updated service text.");
