const fs = require('fs');

const files = [
  'src/components/PortfolioGrid.tsx',
  'src/components/ServicesSection.tsx',
  'src/components/ServiceDetailModal.tsx',
  'src/components/ProjectDetailModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Remove duplicates and conflicting colors
  content = content.replace(/text-brand-red hover:text-brand-green /g, '');
  content = content.replace(/shadow-md hover:shadow-\[0_0_15px_rgba\(0,255,255,0\.6\)\] px-4 py-2/g, 'px-4 py-2');
  content = content.replace(/bg-white text-zinc-900 hover:text-zinc-700 shadow-md hover:shadow-\[0_0_15px_rgba\(0,255,255,0\.6\)\] text-zinc-900 hover:text-zinc-700/g, 'bg-white text-zinc-900 hover:text-zinc-700 shadow-md hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]');
  
  // In ServicesSection, it might have double shadows
  content = content.replace(/shadow-md hover:shadow-\[0_0_15px_rgba\(0,255,255,0\.6\)\] text-zinc-900 hover:text-zinc-700/g, 'text-zinc-900 hover:text-zinc-700');
  content = content.replace(/text-zinc-900 hover:text-zinc-700 text-xs/g, 'text-zinc-900 hover:text-zinc-700 text-xs');
  
  fs.writeFileSync(file, content);
});
