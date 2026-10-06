const fs = require('fs');

const files = [
  'src/components/PortfolioGrid.tsx',
  'src/components/ServicesSection.tsx',
  'src/components/ServiceDetailModal.tsx',
  'src/components/ProjectDetailModal.tsx',
  'src/components/Navigation.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  // 1. Update text color to brand-red
  content = content.replace(/text-zinc-900 hover:text-zinc-700/g, 'text-brand-red hover:brightness-110');
  
  // Update the service item text color if it was changed to text-zinc-900
  content = content.replace(/text-zinc-900 tracking-wide/g, 'text-brand-red tracking-wide');
  
  // 2. Make the cyan shadow much stronger and add a base shadow so white buttons are visible on white backgrounds
  // We'll replace the existing hover shadow with a stronger one and a default shadow-md
  content = content.replace(/hover:shadow-\[0_0_15px_rgba\(0,255,255,0\.6\)\]/g, 'shadow-md hover:shadow-[0_0_20px_4px_rgba(0,255,255,0.8)]');
  
  // If there's already a shadow-md shadow-md duplicated, clean it up
  content = content.replace(/shadow-md\s+shadow-md/g, 'shadow-md');
  
  // For the inner shadow in ServicesSection (glowing hover inner shadow)
  content = content.replace(/shadow-\[inset_0_0_30px_6px_rgba\(0,255,255,0\.4\)\]/g, 'shadow-[inset_0_0_30px_8px_rgba(0,255,255,0.8)]');

  fs.writeFileSync(file, content);
});
console.log("Updated styles.");
