const fs = require('fs');

const files = [
  'src/components/PortfolioGrid.tsx',
  'src/components/ServicesSection.tsx',
  'src/components/ServiceDetailModal.tsx',
  'src/components/ProjectDetailModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Make absolutely sure there are no stray border classes on these specific buttons
  content = content.replace(/border border-white\/[0-9]+/g, '');
  content = content.replace(/border border-zinc-900/g, '');
  content = content.replace(/border-brand-green/g, 'border-transparent');
  content = content.replace(/bg-zinc-900/g, 'bg-white');
  
  // Clean up any double shadows that might conflict
  content = content.replace(/shadow-md\s+hover:shadow-\[0_0_15px_rgba\(0,255,255,0\.6\)\]/g, 'hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]');
  content = content.replace(/shadow-md\s+hover:shadow-\[0_0_15px_rgba\(27,242,163,0\.3\)\]/g, 'hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]');
  
  fs.writeFileSync(file, content);
});

// Also fix the HeroSection buttons if any
if(fs.existsSync('src/components/HeroSection.tsx')){
   let content = fs.readFileSync('src/components/HeroSection.tsx', 'utf-8');
   content = content.replace(/bg-zinc-900/g, 'bg-white');
   fs.writeFileSync('src/components/HeroSection.tsx', content);
}

