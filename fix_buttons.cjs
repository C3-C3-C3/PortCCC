const fs = require('fs');

const files = [
  'src/components/PortfolioGrid.tsx',
  'src/components/ServicesSection.tsx',
  'src/components/ServiceDetailModal.tsx',
  'src/components/ProjectDetailModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace old dark mode button styles
  content = content.replace(/bg-zinc-900 border border-white\/30 hover:border-brand-green/g, 'bg-white text-zinc-900 hover:text-zinc-700 shadow-md hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]');
  
  // Replace the white mode button styles that have dark borders
  content = content.replace(/bg-white border border-zinc-900/g, 'bg-white shadow-md hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]');
  
  // Fix text colors in modals that might still say text-white hover:text-brand-green
  content = content.replace(/text-white hover:text-brand-green/g, 'text-zinc-900 hover:text-zinc-700');
  
  // Replace any lingering hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] with the new cyan one
  content = content.replace(/hover:shadow-\[0_0_15px_rgba\(27,242,163,0\.3\)\]/g, 'hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]');
  
  // For the service items where I removed the border but it still has p-4 etc
  // We just want to make sure it looks good.
  
  fs.writeFileSync(file, content);
});
