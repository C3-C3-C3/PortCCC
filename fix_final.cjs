const fs = require('fs');

// 1. Fix ProjectCard (Section 2 cards)
let projCard = fs.readFileSync('src/components/ProjectCard.tsx', 'utf-8');
projCard = projCard.replace(/cyan-400/g, 'brand-green');
projCard = projCard.replace(/rgba\(0,255,255/g, 'rgba(27,242,163');
fs.writeFileSync('src/components/ProjectCard.tsx', projCard);

// 2. Fix PortfolioGrid button (Section 2 button)
let portGrid = fs.readFileSync('src/components/PortfolioGrid.tsx', 'utf-8');
// Replace the whole className
portGrid = portGrid.replace(
  /className="font-sans text-\[11px\] font-bold tracking-wider uppercase transition-all duration-300 bg-white text-brand-red hover:brightness-110 px-4 py-2 rounded-lg cursor-none flex items-center justify-center shadow-md hover:shadow-\[0_0_30px_8px_rgba\(0,255,255,1\)\]"/g,
  'className="font-sans text-[11px] font-bold tracking-wider uppercase transition-all duration-300 bg-white text-brand-red px-4 py-2 rounded-lg cursor-none flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.6)] hover:text-brand-green hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"'
);
fs.writeFileSync('src/components/PortfolioGrid.tsx', portGrid);

// 3. Fix ServicesSection button and service-items
let servSec = fs.readFileSync('src/components/ServicesSection.tsx', 'utf-8');
// Button
servSec = servSec.replace(
  /className="px-4 py-2 rounded-lg bg-white text-brand-red hover:brightness-110 text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-md hover:shadow-\[0_0_30px_8px_rgba\(0,255,255,1\)\]"/g,
  'className="px-4 py-2 rounded-lg bg-white text-brand-red text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-[0_0_15px_rgba(0,255,255,0.6)] hover:text-brand-green hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"'
);
// Service Item Wrapper
servSec = servSec.replace(
  /className="service-item relative bg-white p-4 px-8 w-full h-full min-h-\[56px\] flex items-center justify-between transition-all duration-300 rounded-lg shadow-md hover:shadow-\[0_0_30px_8px_rgba\(0,255,255,1\)\] overflow-hidden cursor-none"/g,
  'className="service-item relative bg-white p-4 px-8 w-full h-full min-h-[56px] flex items-center justify-between transition-all duration-300 rounded-lg shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] hover:border-brand-green overflow-hidden cursor-none"'
);
// Service Item Text
servSec = servSec.replace(
  /isHovered \? 'tracking-wider text-brand-red brightness-110 drop-shadow-\[0_0_8px_rgba\(0,255,255,0\.8\)\]' : 'text-brand-red tracking-wide'/g,
  "isHovered ? 'tracking-wider text-brand-green' : 'text-brand-red tracking-wide'"
);
// Service Item inner shadow
servSec = servSec.replace(
  /shadow-\[inset_0_0_40px_12px_rgba\(0,255,255,1\)\]/g,
  'shadow-[inset_0_0_30px_6px_rgba(27,242,163,0.25)]'
);

fs.writeFileSync('src/components/ServicesSection.tsx', servSec);
console.log("Done");
