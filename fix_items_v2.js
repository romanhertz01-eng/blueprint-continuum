import fs from 'fs';

const filePath = 'src/data/prompts/items.ts';
let content = fs.readFileSync(filePath, 'utf8');

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

// 1. Remove the double header mess
content = content.replace(/import \{ PromptItem \} from '\.\/types';\s*export const promptItems: PromptItem\[\] = \[\s*\{import \{ PromptItem \} from '\.\/types';\s*export const promptItems: PromptItem\[\] = \[\s*\{/, 'import { PromptItem } from \'./types\';\n\nexport const promptItems: PromptItem[] = [\n  {');

// 2. We need to split the items correctly. They are currently separated by "  }," (missing in the botched version? no, let's see).
// Looking at the log, line 24 ends with '}', not '  },'.
// So items are like:
// {
//   ...
//   body: { ... }
// }
// Wait, the body object has its own closing brace.
// The items in prompts/items.ts have:
// status: 'published',
// source: 'editorial',
// publishedAt: '2026-08-11',
// updatedAt: '2026-08-11'
// }

// Let's use a smarter approach: find 'slug:' to identify items.
// But first, let's fix the missing status/source/dates if they were wiped.
// In the log, line 23 is mistakes, line 24 is '  },' (or similar).

// Actually, I'll just rewrite the file by extracting the parts I know should be there.
// Each item starts with '  {' and ends with '  },' (except the last).
// If the '  },' is missing, I'll look for the next '  { slug:'.

const itemsRaw = content.split(/\n  \{/).slice(1);
let newContent = 'import { PromptItem } from \'./types\';\n\nexport const promptItems: PromptItem[] = [\n';

itemsRaw.forEach((raw, i) => {
    let clean = raw.trim();
    // Remove trailing '},' or '}' or '];'
    clean = clean.replace(/\}\s*,\s*$/, '');
    clean = clean.replace(/\}\s*$/, '');
    clean = clean.replace(/\];\s*$/, '');
    
    // Ensure it ends with dates and new fields
    // If it doesn't have status/source/dates, add them.
    if (!clean.includes('status:')) clean += `,\n    status: 'published'`;
    if (!clean.includes('source:')) clean += `,\n    source: 'editorial'`;
    if (!clean.includes('publishedAt:')) clean += `,\n    publishedAt: '2026-08-11'`;
    
    const s = seeds[i % seeds.length];
    clean += `,\n    views: ${s.views},\n    likes: ${s.likes},\n    saves: ${s.saves},\n    shares: ${s.shares}`;
    clean += `,\n    updatedAt: '2026-08-11'`;

    newContent += '  {\n    ' + clean + '\n  }' + (i === itemsRaw.length - 1 ? '' : ',') + '\n';
});

newContent += '];\n';

fs.writeFileSync(filePath, newContent);
