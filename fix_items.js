import fs from 'fs';

const filePath = 'src/data/prompts/items.ts';
let content = fs.readFileSync(filePath, 'utf8');

// The botched script duplicated the header and made a mess.
// Let's restore the basic structure and fix the entries.

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

// Clean content: remove the double import/header
content = content.replace(/import \{ PromptItem \} from '\.\/types';\s*export const promptItems: PromptItem\[\] = \[\s*\{import \{ PromptItem \} from '\.\/types';\s*export const promptItems: PromptItem\[\] = \[\s*\{/, 'import { PromptItem } from \'./types\';\n\nexport const promptItems: PromptItem[] = [\n  {');

// Now, for each item, ensure it has the fields and only once.
// I'll split by "  }," which should be at the end of every item.
const items = content.split('  },').filter(it => it.includes('slug:'));

let newContent = 'import { PromptItem } from \'./types\';\n\nexport const promptItems: PromptItem[] = [\n';

for (let i = 0; i < items.length; i++) {
    let itemStr = items[i].trim();
    if (!itemStr.startsWith('{')) itemStr = '{' + itemStr;
    
    // Remove existing views/likes/saves/shares if any (to avoid duplicates from previous run)
    itemStr = itemStr.replace(/\s+views: \d+,/g, '');
    itemStr = itemStr.replace(/\s+likes: \d+,/g, '');
    itemStr = itemStr.replace(/\s+saves: \d+,/g, '');
    itemStr = itemStr.replace(/\s+shares: \d+,/g, '');
    
    const s = seeds[i % seeds.length];
    
    // Inject before updatedAt
    itemStr = itemStr.replace('updatedAt:', `views: ${s.views},\n    likes: ${s.likes},\n    saves: ${s.saves},\n    shares: ${s.shares},\n    updatedAt:`);
    
    newContent += '  ' + itemStr + (i === items.length - 1 ? '\n  }' : '\n  },') + '\n';
}

newContent += '];\n';

fs.writeFileSync(filePath, newContent);
