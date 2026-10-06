const fs = require('fs');

function patchFile(filePath, regexes) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  regexes.forEach(({search, replace}) => {
    content = content.replace(search, replace);
  });
  fs.writeFileSync(filePath, content);
  console.log(`Patched ${filePath}`);
}

// 1. PortfolioGrid.tsx
patchFile('src/components/PortfolioGrid.tsx', [
  {
    search: /className="[^"]*bg-zinc-900[^"]*Servicios \& Sobre mí →/s,
    replace: (match) => {
      // Replace the classes for the button
      return match.replace(
        /className="[^"]*"/,
        'className="font-sans text-[11px] font-bold tracking-wider text-zinc-900 hover:text-zinc-700 uppercase transition-all duration-300 bg-white border border-zinc-900 px-4 py-2 rounded-lg cursor-none flex items-center justify-center shadow-md hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"'
      );
    }
  }
]);

// 2. ServicesSection.tsx - Back button
patchFile('src/components/ServicesSection.tsx', [
  {
    search: /className="px-4 py-2 rounded-lg bg-zinc-900 border border-white\/30 hover:border-brand-green[^"]*"/g,
    replace: 'className="px-4 py-2 rounded-lg bg-white border border-zinc-900 text-zinc-900 hover:text-zinc-700 text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-md hover:shadow-[0_0_15px_rgba(0,255,255,0.6)]"'
  },
  // 3. ServicesSection.tsx - Service items
  {
    search: /className="service-item relative bg-zinc-900 border border-white\/30 hover:border-brand-green[^"]*"/g,
    replace: 'className="service-item relative bg-white border border-zinc-900 p-4 px-8 w-full h-full min-h-[56px] flex items-center justify-between transition-all duration-300 rounded-lg shadow-md hover:shadow-[0_0_15px_rgba(0,255,255,0.6)] overflow-hidden cursor-none"'
  },
  // 4. ServicesSection.tsx - text color for hovered state of service item
  // text-brand-green -> text-cyan-400 or something? Or just text-zinc-600
  // "tracking-wider text-brand-green" -> "tracking-wider text-cyan-500"
  {
    search: /text-brand-green'/g,
    replace: "cyan-500'" // Or wait, let's look at the actual code
  }
]);
