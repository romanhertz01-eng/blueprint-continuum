import fs from 'fs';

const filePath = 'src/data/prompts/items.ts';
let content = fs.readFileSync(filePath, 'utf8');

// I need to generate 24 unique sets of reactions
// views 40–800, likes 0–35, saves 0–20, shares 0–8
// likes < views/10, saves < likes, shares < saves

const seeds = [
    { views: 412, likes: 31, saves: 18, shares: 7 },
    { views: 567, likes: 28, saves: 12, shares: 5 },
    { views: 800, likes: 35, saves: 20, shares: 8 },
    { views: 40,  likes: 2,  saves: 1,  shares: 0 },
    { views: 123, likes: 10, saves: 5,  shares: 2 },
    { views: 750, likes: 32, saves: 15, shares: 6 },
    { views: 245, likes: 18, saves: 9,  shares: 4 },
    { views: 333, likes: 25, saves: 14, shares: 7 },
    { views: 600, likes: 30, saves: 19, shares: 8 },
    { views: 450, likes: 22, saves: 11, shares: 5 },
    { views: 180, likes: 12, saves: 6,  shares: 3 },
    { views: 520, likes: 29, saves: 17, shares: 8 },
    { views: 95,  likes: 7,  saves: 3,  shares: 1 },
    { views: 680, likes: 34, saves: 16, shares: 7 },
    { views: 210, likes: 15, saves: 8,  shares: 4 },
    { views: 390, likes: 20, saves: 10, shares: 5 },
    { views: 550, likes: 27, saves: 13, shares: 6 },
    { views: 720, likes: 33, saves: 18, shares: 7 },
    { views: 150, likes: 9,  saves: 4,  shares: 2 },
    { views: 480, likes: 23, saves: 12, shares: 5 },
    { views: 630, likes: 31, saves: 15, shares: 6 },
    { views: 280, likes: 16, saves: 8,  shares: 3 },
    { views: 350, likes: 19, saves: 10, shares: 4 },
    { views: 590, likes: 26, saves: 13, shares: 5 },
];

let index = 0;
// We find objects and inject fields before updatedAt or publishedAt
// Each item in items.ts has publishedAt and updatedAt.
// We can use a regex to replace each item's closing part.

const items = content.split('  {').filter(i => i.trim() !== 'import { PromptItem } from \'./types\';' && i.trim() !== 'export const promptItems: PromptItem[] = [');

let newContent = 'import { PromptItem } from \'./types\';\n\nexport const promptItems: PromptItem[] = [\n';

for (let i = 0; i < items.length; i++) {
    let itemStr = items[i];
    const s = seeds[i % seeds.length];
    
    // Inject before updatedAt
    itemStr = itemStr.replace('updatedAt:', `views: ${s.views},\n    likes: ${s.likes},\n    saves: ${s.saves},\n    shares: ${s.shares},\n    updatedAt:`);
    
    newContent += '  {' + itemStr;
}

fs.writeFileSync(filePath, newContent);
