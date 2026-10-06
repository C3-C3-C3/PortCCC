const fs = require('fs');
let content = fs.readFileSync('src/components/ServicesSection.tsx', 'utf-8');

if (!content.includes("import { SafeMetalFx }")) {
  content = content.replace("import { Service } from '../types';", 
    "import { Service } from '../types';\nimport { SafeMetalFx } from './SafeMetalFx';");
}

const targetButton = `<button
                onClick={onBackToProjects}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/30 hover:border-brand-green text-brand-red hover:text-brand-green text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
              >
                ← Volver a Proyectos
              </button>`;

const replacementButton = `<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2} disabled={isCovered || !!selectedService}>
                <button
                  onClick={onBackToProjects}
                  className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/30 hover:border-brand-green text-brand-red hover:text-brand-green text-xs font-sans font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-none shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)]"
                >
                  ← Volver a Proyectos
                </button>
              </SafeMetalFx>`;

content = content.replace(targetButton, replacementButton);
fs.writeFileSync('src/components/ServicesSection.tsx', content);
