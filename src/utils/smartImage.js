/**
 * smartImage.js
 * Resolves the correct product image URL based on product name keywords.
 * Uses only verified, stable Unsplash numeric photo IDs.
 * Image pools provide variety — different products of the same category get different images.
 */

// Shorthand for Unsplash numeric-ID photo URLs (ONLY these work; short IDs like dCuCMZ return 404)
const U = (id) => `https://images.unsplash.com/photo-${id}?w=600&h=800&fit=crop&q=80`;

// ─── Verified image pools per category ────────────────────────────────────────
const POOLS = {
    saree: [
        U('1610030469983-98e550d6193c'), // Indian woman in purple/gold saree
        U('1617627143750-d86bc21e42bb'), // Elegant  saree
        U('1594938298603-e8d9a85a18f6'), // Bridal/festive saree
    ],
    lehenga: [
        U('1614671065516-3e0a4b0b6e0e'), // Indian ethnic festive outfit
        U('1617627143750-d86bc21e42bb'), // Bridal lehenga
        U('1585487000160-6ebcfceb0d03'), // Colorful ethnic wear
    ],
    kurti: [
        U('1559598467-f8b76c8155d0'),    // Kurti / ethnic top
        U('1614671065516-3e0a4b0b6e0e'), // Ethnic chikankari/kurti
        U('1503342394128-c104d54dba01'), // Printed kurti
    ],
    suit: [
        U('1585487000160-6ebcfceb0d03'), // Salwar suit / palazzo
        U('1614671065516-3e0a4b0b6e0e'), // Ethnic suit
        U('1559598467-f8b76c8155d0'),    // Straight suit
    ],
    dupatta: [
        U('1558618666-fcd25c85cd64'),    // Silk/fabric dupatta
        U('1610030469983-98e550d6193c'), // Indian fashion with dupatta
    ],
    jewelry: [
        U('1515562141207-7a18b5ce7142'), // Gold Indian necklace
        U('1599643478518-a784e5dc4c8f'), // Ethnic earrings/jhumka
        U('1602173574767-37ac01994b2a'), // Gold bangles
        U('1535632787350-4e68ef0ac584'), // Maang tikka / headpiece
    ],
    fabric: [
        U('1558618666-fcd25c85cd64'),    // Silk fabric close-up
    ],
    dress: [
        U('1572804013309-59a88b7e92f1'), // Maxi dress / gown
        U('1496217590455-aa63a8350eea'), // Wrap/midi dress
        U('1567401893414-76b7b1e5a7a5'), // Party/bodycon dress
        U('1574201635302-388dd92a4c3f'), // Indo-western fusion
    ],
    shirt: [
        U('1596755094514-f87e34085b2c'), // Casual shirt
    ],
    generic: [
        U('1610030469983-98e550d6193c'), // Saree (universal Indian fashion fallback)
        U('1559598467-f8b76c8155d0'),    // Kurti fallback
    ],
};

// Per-category rotation counters for variety
const counters = {};
function fromPool(key) {
    if (!(key in counters)) counters[key] = 0;
    const pool = POOLS[key] || POOLS.generic;
    const url = pool[counters[key] % pool.length];
    counters[key]++;
    return url;
}

// ─── Keyword rules (most-specific first) ─────────────────────────────────────
const RULES = [
    // Sarees
    { re: /kanjivaram|kanchipuram/i, key: 'saree', fixed: POOLS.saree[0] },
    { re: /banarasi/i, key: 'saree', fixed: POOLS.saree[1] },
    { re: /bridal saree|wedding saree|heavy saree/i, key: 'saree', fixed: POOLS.saree[2] },
    { re: /cotton saree|handloom saree|tant saree|kalamkari/i, key: 'saree', fixed: POOLS.saree[2] },
    { re: /silk saree|chanderi|pochampally|patola/i, key: 'saree', fixed: POOLS.saree[0] },
    { re: /saree|sari/i, key: 'saree' },

    // Lehengas
    { re: /bridal lehenga|wedding lehenga/i, key: 'lehenga', fixed: POOLS.lehenga[1] },
    { re: /girls lehenga|kids lehenga/i, key: 'lehenga', fixed: POOLS.lehenga[0] },
    { re: /lehenga|lehnga|ghagra/i, key: 'lehenga' },

    // Anarkali
    { re: /anarkali/i, key: 'kurti', fixed: POOLS.kurti[0] },

    // Salwar / Suits
    { re: /salwar suit|salwar kameez|churidar|punjabi suit/i, key: 'suit' },
    { re: /palazzo suit|palazzo set|straight suit|sharara suit/i, key: 'suit' },
    { re: /sherwani|achkan|pathani suit/i, key: 'suit', fixed: POOLS.suit[1] },

    // Kurtis
    { re: /anarkali kurti|long kurti/i, key: 'kurti', fixed: POOLS.kurti[0] },
    { re: /cotton kurti|printed kurti|block print/i, key: 'kurti', fixed: POOLS.kurti[2] },
    { re: /chikankari|embroidered kurti/i, key: 'kurti', fixed: POOLS.kurti[1] },
    { re: /kurti|kurtis/i, key: 'kurti' },

    // Kurtas
    { re: /bandhani kurta|mirror work kurta|festive kurta/i, key: 'kurti', fixed: POOLS.kurti[1] },
    { re: /boys kurta|kids kurta|girls kurta|dhoti kurta/i, key: 'kurti', fixed: POOLS.kurti[0] },
    { re: /kurta pajama/i, key: 'kurti', fixed: POOLS.kurti[0] },
    { re: /kurta/i, key: 'kurti' },

    // Dupattas / Shawls
    { re: /dupatta|stole|chunni|odhni|phulkari/i, key: 'dupatta' },
    { re: /shawl|pashmina|kashmiri/i, key: 'dupatta' },

    // Jewelry
    { re: /necklace|choker|haar|pendant/i, key: 'jewelry', fixed: POOLS.jewelry[0] },
    { re: /earring|jhumka|bali|studded|studs/i, key: 'jewelry', fixed: POOLS.jewelry[1] },
    { re: /bangles|bracelet|kada/i, key: 'jewelry', fixed: POOLS.jewelry[2] },
    { re: /maang tikka|mang tikka|tikka|kamarbandh/i, key: 'jewelry', fixed: POOLS.jewelry[3] },
    { re: /anklets|anklet/i, key: 'jewelry', fixed: POOLS.jewelry[3] },
    { re: /kundan|polki|jadau|meenakari/i, key: 'jewelry', fixed: POOLS.jewelry[0] },
    { re: /ring |rings\b/i, key: 'jewelry', fixed: POOLS.jewelry[0] },
    { re: /oxidized|jhumkas/i, key: 'jewelry', fixed: POOLS.jewelry[1] },
    { re: /jewelry|jewellery|ornament/i, key: 'jewelry' },
    { re: /pearl earring|pearl/i, key: 'jewelry', fixed: POOLS.jewelry[1] },

    // Fabric / Textile
    { re: /dress material|suit material|fabric|textile/i, key: 'fabric' },

    // Co-ord / Tops
    { re: /co.?ord set|coord set|matching set/i, key: 'suit' },
    { re: /crop top skirt|palazzo kurta/i, key: 'suit' },
    { re: /crop top|tube top|blouse|choli/i, key: 'kurti' },

    // Palazzos
    { re: /palazzo/i, key: 'suit' },

    // Western / Indo-western Dresses
    { re: /indo.?western|fusion/i, key: 'dress', fixed: POOLS.dress[3] },
    { re: /jumpsuit/i, key: 'dress', fixed: POOLS.dress[3] },
    { re: /maxi dress|floor.?length/i, key: 'dress', fixed: POOLS.dress[0] },
    { re: /bodycon|party dress|cocktail/i, key: 'dress', fixed: POOLS.dress[2] },
    { re: /wrap dress|midi dress|floral dress/i, key: 'dress', fixed: POOLS.dress[1] },
    { re: /gown/i, key: 'dress', fixed: POOLS.dress[0] },
    { re: /dress/i, key: 'dress' },

    // Shirts (menswear or any shirt)
    { re: /shirt/i, key: 'shirt' },

    // Bridal catch-all
    { re: /bridal|bride/i, key: 'lehenga', fixed: POOLS.lehenga[1] },

    // Jacket / Blazer
    { re: /jacket|blazer|bandi jacket/i, key: 'lehenga', fixed: POOLS.lehenga[0] },

    // Sharara / Gharara
    { re: /sharara|gharara|pattu pavadai/i, key: 'suit' },
];

/**
 * Checks if a URL is a valid user-provided image (not a placeholder or empty).
 * @param {string} url
 * @returns {boolean}
 */
function isValidStoredUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (trimmed === '') return false;
    // ✅ Accept base64 data: images (uploaded via admin panel)
    if (trimmed.startsWith('data:image/')) return true;
    // Skip known bad/placeholder patterns
    const BAD_PATTERNS = [
        'placeholder',
        'via.placeholder',
        'picsum',
        'lorempixel',
        'dummyimage',
        'no-image',
        'noimage',
        'default',
    ];
    const lower = trimmed.toLowerCase();
    if (BAD_PATTERNS.some(p => lower.includes(p))) return false;
    // Must look like a URL
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Resolves the correct product image URL.
 * Priority:
 *   1. If admin has set a valid imageUrl (Firebase, Pinterest, any HTTPS URL) → use it
 *   2. Otherwise → derive from product name using Unsplash pools
 *
 * @param {string} name - Product name
 * @param {string} description - Product description (optional)
 * @param {string} storedUrl - The stored imageUrl from the database
 * @returns {string} Image URL to display
 */
export function resolveProductImage(name = '', description = '', storedUrl = '') {
    // ✅ If a valid URL was stored (e.g. Pinterest, Firebase, Unsplash, etc.) — use it directly
    if (isValidStoredUrl(storedUrl)) {
        return storedUrl.trim();
    }

    // 🔄 No stored URL — derive from product name
    const combined = `${name} ${description || ''}`;
    for (const rule of RULES) {
        if (rule.re.test(combined)) {
            return rule.fixed ?? fromPool(rule.key);
        }
    }
    return fromPool('generic');
}
