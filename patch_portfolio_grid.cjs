const fs = require('fs');
let content = fs.readFileSync('src/components/PortfolioGrid.tsx', 'utf-8');

if (!content.includes("import { SafeMetalFx }")) {
  content = content.replace("import ProjectCard from './ProjectCard';", 
    "import ProjectCard from './ProjectCard';\nimport { SafeMetalFx } from './SafeMetalFx';");
}

const targetButton = `<button
            onClick={() => onNavigate('services')}
            className="font-sans text-[11px] font-bold tracking-wider text-brand-red hover:text-brand-green uppercase transition-all duration-300 bg-zinc-900 border border-white/30 hover:border-brand-green px-4 py-2 rounded-lg cursor-none flex items-center justify-center shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
          >
            Servicios & Sobre mí →
          </button>`;

const replacementButton = `<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2}>
            <button
              onClick={() => onNavigate('services')}
              className="font-sans text-[11px] font-bold tracking-wider text-brand-red hover:text-brand-green uppercase transition-all duration-300 bg-zinc-900 border border-white/30 hover:border-brand-green px-4 py-2 rounded-lg cursor-none flex items-center justify-center shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
            >
              Servicios & Sobre mí →
            </button>
          </SafeMetalFx>`;

content = content.replace(targetButton, replacementButton);
fs.writeFileSync('src/components/PortfolioGrid.tsx', content);
