const fs = require('fs');
let text = fs.readFileSync('./src/components/ServiceDetailModal.tsx', 'utf-8');

// Strip all opening SafeMetalFx tags that were wrongly added
text = text.replace(/<SafeMetalFx[^>]*>/g, '');
text = text.replace(/<\/SafeMetalFx>/g, '');

// Now safely add SafeMetalFx
text = text.replace(
  /(<button[\s\S]*?onClick={onClose}[\s\S]*?<\/button>)/,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2}>\n$1\n</SafeMetalFx>'
);

text = text.replace(
  /(<button[\s\S]*?onClick={onGoHome}[\s\S]*?<\/button>)/,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2}>\n$1\n</SafeMetalFx>'
);

text = text.replace(
  /(<button[\s\S]*?onClick={handleCopyLink}[\s\S]*?<\/button>)/,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2}>\n$1\n</SafeMetalFx>'
);

text = text.replace(
  /(<button[\s\S]*?onClick={handlePrevService}[\s\S]*?<\/button>)/,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2} variant="circle">\n$1\n</SafeMetalFx>'
);

text = text.replace(
  /(<button[\s\S]*?onClick={handleNextService}[\s\S]*?<\/button>)/,
  '<SafeMetalFx preset="chromatic" theme="light" ringCssPx={2} variant="circle">\n$1\n</SafeMetalFx>'
);

fs.writeFileSync('./src/components/ServiceDetailModal.tsx', text);
