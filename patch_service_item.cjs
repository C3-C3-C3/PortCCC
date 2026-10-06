const fs = require('fs');
let content = fs.readFileSync('src/components/ServicesSection.tsx', 'utf-8');

const target = `<div
          className="service-item relative bg-zinc-900 border border-white/30 hover:border-brand-green p-4 px-8 w-full h-full min-h-[56px] flex items-center justify-between transition-all duration-300 rounded-lg shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] overflow-hidden cursor-none"
        >`;

const replacement = `<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2} disabled={isCovered} className="w-full h-full min-h-[56px]">
        <div
          className="service-item relative bg-zinc-900 border border-white/30 hover:border-brand-green p-4 px-8 w-full h-full min-h-[56px] flex items-center justify-between transition-all duration-300 rounded-lg shadow-md hover:shadow-[0_0_15px_rgba(27,242,163,0.3)] overflow-hidden cursor-none"
        >`;

const endTarget = `          />
        </div>`;

const endReplacement = `          />
        </div>
        </SafeMetalFx>`;

if (content.includes(target)) {
  let [part1, part2] = content.split(target);
  let newContent = part1 + replacement + part2.replace(endTarget, endReplacement);
  fs.writeFileSync('src/components/ServicesSection.tsx', newContent);
}

