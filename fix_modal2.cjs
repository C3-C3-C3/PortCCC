const fs = require('fs');
let text = fs.readFileSync('./src/components/ServiceDetailModal.tsx', 'utf-8');

// Strip all opening and closing SafeMetalFx tags
text = text.replace(/<SafeMetalFx[^>]*>/g, '');
text = text.replace(/<\/SafeMetalFx>/g, '');

// A regex that won't jump across <button tags.
// It looks for a <button followed by no other <button until onClick={...} and then up to </button>
text = text.replace(
  /(<button(?:(?!<button)[\s\S])*?onClick={onClose}[\s\S]*?<\/button>)/g,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2}>\n$1\n</SafeMetalFx>'
);

text = text.replace(
  /(<button(?:(?!<button)[\s\S])*?onClick={onGoHome}[\s\S]*?<\/button>)/g,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2}>\n$1\n</SafeMetalFx>'
);

text = text.replace(
  /(<button(?:(?!<button)[\s\S])*?onClick={handleCopyLink}[\s\S]*?<\/button>)/g,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2}>\n$1\n</SafeMetalFx>'
);

text = text.replace(
  /(<button(?:(?!<button)[\s\S])*?onClick={handlePrevService}[\s\S]*?<\/button>)/g,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2} variant="circle">\n$1\n</SafeMetalFx>'
);

text = text.replace(
  /(<button(?:(?!<button)[\s\S])*?onClick={handleNextService}[\s\S]*?<\/button>)/g,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2} variant="circle">\n$1\n</SafeMetalFx>'
);

fs.writeFileSync('./src/components/ServiceDetailModal.tsx', text);
