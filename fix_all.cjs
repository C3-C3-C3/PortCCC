const fs = require('fs');

function replaceFile(path, replacements) {
    if(!fs.existsSync(path)) return;
    let text = fs.readFileSync(path, 'utf8');
    let original = text;
    for(const [search, repl] of replacements) {
        text = text.replace(search, repl);
    }
    if(text !== original) {
        fs.writeFileSync(path, text);
        console.log("Updated", path);
    }
}

// 1. ServicesSection.tsx fixes
replaceFile('src/components/ServicesSection.tsx', [
    [/isHovered \? 'tracking-wider cyan-500' : 'text-brand-red tracking-wide'/g, "isHovered ? 'tracking-wider text-cyan-500' : 'text-zinc-900 tracking-wide'"],
    [/shadow-\[inset_0_0_30px_6px_rgba\(27,242,163,0\.25\)\]/g, "shadow-[inset_0_0_30px_6px_rgba(0,255,255,0.4)]"]
]);

// 2. index.css unused styles
replaceFile('src/index.css', [
    [/\/\* Force metal-fx button boxes to have transparent backgrounds and allow glow overflow \*\/\n\.metal-fx-root,\n\.metal-fx-root\[data-theme='light'\],\n\.metal-fx-root\[data-theme='dark'\] \{\n  background: transparent !important;\n  overflow: visible !important;\n\}\n?/g, ""]
]);

