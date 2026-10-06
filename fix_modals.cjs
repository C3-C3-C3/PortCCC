const fs = require('fs');

const files = [
  'src/components/ServiceDetailModal.tsx',
  'src/components/ProjectDetailModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Revert buttons to transparent background, white text, white border
  content = content.replace(/bg-white text-brand-red hover:brightness-110/g, 'bg-transparent border border-white/30 text-white hover:border-brand-green hover:text-brand-green');
  content = content.replace(/shadow-md hover:shadow-\[0_0_20px_4px_rgba\(0,255,255,0\.8\)\]/g, 'shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]');
  
  fs.writeFileSync(file, content);
});
console.log("Updated modals.");
