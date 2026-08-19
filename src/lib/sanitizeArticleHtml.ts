/**
 * Sanitizes HTML content for articles using a strict whitelist approach.
 * Designed to run in environments without a full DOM (like Cloudflare Workers / SSR).
 */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html) return "";

  // 1.1 Whitelist definition
  const whitelist: Record<string, string[]> = {
    p: [],
    br: [],
    strong: [],
    b: [],
    em: [],
    i: [],
    u: [],
    s: [],
    h2: ["id"],
    h3: ["id"],
    ul: [],
    ol: [],
    li: [],
    blockquote: [],
    a: ["href"],
    img: ["src", "alt"],
    table: [],
    thead: [],
    tbody: [],
    tr: [],
    th: [],
    td: [],
  };

  // 1.2 Step 1: Remove dangerous blocks entirely including content
  let sanitized = html
    .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, "")
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, "")
    .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gi, "")
    .replace(/<object\b[^>]*>([\s\S]*?)<\/object>/gi, "")
    .replace(/<embed\b[^>]*>([\s\S]*?)<\/embed>/gi, "")
    .replace(/<svg\b[^>]*>([\s\S]*?)<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Helper for attribute sanitization
  const sanitizeAttributes = (tagName: string, attrString: string): string => {
    const allowedAttrs = whitelist[tagName] || [];
    const attrRegex = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s">]+))/g;
    let match;
    let result = "";

    while ((match = attrRegex.exec(attrString)) !== null) {
      const attrName = match[1].toLowerCase();
      let attrValue = match[3] || match[4] || match[5] || "";

      if (allowedAttrs.includes(attrName)) {
        // Validation for href and src
        if (attrName === "href" || attrName === "src") {
          const cleanValue = attrValue.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, "").toLowerCase();
          const isSafe = cleanValue.startsWith("http://") || 
                         cleanValue.startsWith("https://") || 
                         cleanValue.startsWith("/") || 
                         (attrName === "href" && cleanValue.startsWith("mailto:"));
          
          if (!isSafe) continue;
        }

        // Escape values
        const escapedValue = attrValue
          .replace(/"/g, "&quot;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        
        result += ` ${attrName}="${escapedValue}"`;
      }
    }

    if (tagName === "a") {
      result += ' rel="noopener noreferrer nofollow"';
    }

    return result;
  };

  // 1.2 Step 2: Process all tags
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  sanitized = sanitized.replace(tagRegex, (match, tagName, attrs) => {
    const lowerTagName = tagName.toLowerCase();
    
    // Check whitelist
    if (!whitelist[lowerTagName]) return "";

    // Closing tag
    if (match.startsWith("</")) {
      return `</${lowerTagName}>`;
    }

    // Opening tag
    const sanitizedAttrs = sanitizeAttributes(lowerTagName, attrs);
    
    // Self-closing tags
    if (lowerTagName === "br" || lowerTagName === "img") {
      return `<${lowerTagName}${sanitizedAttrs}>`;
    }

    return `<${lowerTagName}${sanitizedAttrs}>`;
  });

  return sanitized;
}
