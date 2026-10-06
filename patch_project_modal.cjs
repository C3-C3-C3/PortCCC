const fs = require('fs');
let text = fs.readFileSync('./src/components/ProjectDetailModal.tsx', 'utf-8');

// Add import if missing
if (!text.includes("import { SafeMetalFx }")) {
  text = text.replace("import { Project } from '../types';", "import { Project } from '../types';\nimport { SafeMetalFx } from './SafeMetalFx';");
}

// Wrap specific buttons
const regexes = [
  /(<button(?:(?!<button)[\s\S])*?onClick={onClose}[\s\S]*?<\/button>)/g,
  /(<button(?:(?!<button)[\s\S])*?onClick={onGoHome}[\s\S]*?<\/button>)/g,
  /(<button(?:(?!<button)[\s\S])*?onClick={handleCopyLink}[\s\S]*?<\/button>)/g,
  /(<button(?:(?!<button)[\s\S])*?onClick={handlePrevProject}[\s\S]*?<\/button>)/g,
  /(<button(?:(?!<button)[\s\S])*?onClick={handleNextProject}[\s\S]*?<\/button>)/g
];

regexes.forEach((regex, idx) => {
  const isCircle = idx >= 3; // prev and next are circles
  text = text.replace(regex, (match) => {
    // Only wrap if it's not already wrapped
    if (match.includes("SafeMetalFx")) return match; // fallback check
    return `<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2}${isCircle ? ' variant="circle"' : ''}>\n${match}\n</SafeMetalFx>`;
  });
});

fs.writeFileSync('./src/components/ProjectDetailModal.tsx', text);
