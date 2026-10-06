const fs = require('fs');

const filesToClean = [
  'src/components/PortfolioGrid.tsx',
  'src/components/ServicesSection.tsx',
  'src/components/ServiceDetailModal.tsx',
  'src/components/ProjectDetailModal.tsx'
];

filesToClean.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    let originalContent = content;
    
    // Remove import
    content = content.replace(/import\s+\{\s*SafeMetalFx\s*\}\s+from\s+['"].\/SafeMetalFx['"];?\n?/g, '');
    
    // Remove opening tags (multiline or single line)
    content = content.replace(/<SafeMetalFx[^>]*>/g, '');
    
    // Remove closing tags
    content = content.replace(/<\/SafeMetalFx>/g, '');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`Cleaned ${file}`);
    }
  }
});
