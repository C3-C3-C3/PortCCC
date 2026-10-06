const fs = require('fs');

const files = [
  'src/components/PortfolioGrid.tsx',
  'src/components/ServicesSection.tsx',
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/hover:shadow-\[0_0_20px_4px_rgba\(0,255,255,0\.8\)\]/g, 'hover:shadow-[0_0_30px_8px_rgba(0,255,255,1)]');
  content = content.replace(/shadow-\[inset_0_0_30px_8px_rgba\(0,255,255,0\.8\)\]/g, 'shadow-[inset_0_0_40px_12px_rgba(0,255,255,1)]');
  
  fs.writeFileSync(file, content);
});
console.log("Updated shadows.");
