import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    MessageCircle, X, Send, ShoppingCart, Sparkles,
    ChevronDown, RotateCcw, Check, ExternalLink,
    Mic, MicOff, Copy, Heart, TrendingUp, Palette,
    Zap, Star, Brain
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useCart } from '../../context/CartContext';
import { API_ENDPOINTS } from '../../config/api';
import './AIChatbot.css';

// ─── Groq API (Free) ───────────────────────────────────────────────────────────
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile'; // Free, fast, very capable

// ─── Season Detection ──────────────────────────────────────────────────────────
const getCurrentSeason = () => {
    const month = new Date().getMonth(); // 0-indexed
    if (month >= 2 && month <= 4) return 'Spring (Holi / Summer prep) — light cotton & pastels are trending';
    if (month >= 5 && month <= 8) return 'Monsoon/Summer — breathable fabrics like linen, cotton, georgette are ideal';
    if (month >= 9 && month <= 10) return 'Autumn (Navratri / Diwali) — rich silks, velvets, and festive lehengas are hot right now';
    return 'Winter Wedding Season — heavy embroidered pieces, velvets, and shawls are in demand';
};

// ─── Style Personalities ───────────────────────────────────────────────────────
const STYLE_PERSONAS = [
    { id: 'ethnic', emoji: '🪔', label: 'Ethnic Queen', desc: 'Sarees, lehengas & traditional wear', color: '#f59e0b' },
    { id: 'modern', emoji: '✨', label: 'Modern Chic', desc: 'Fusion & contemporary styles', color: '#8b5cf6' },
    { id: 'boho', emoji: '🌸', label: 'Boho Soul', desc: 'Free-spirited, earthy & layered', color: '#10b981' },
    { id: 'classic', emoji: '👑', label: 'Classic Elegance', desc: 'Timeless, structured & refined', color: '#3b82f6' },
];

// ─── Occasions / Sizes / Colors ────────────────────────────────────────────────
const OCCASIONS = [
    { label: '💒 Wedding', value: 'wedding' },
    { label: '🎉 Party', value: 'party' },
    { label: '👗 Casual', value: 'casual' },
    { label: '🏢 Office', value: 'office' },
    { label: '🪔 Festival', value: 'festival' },
    { label: '🌙 Date Night', value: 'date night' },
    { label: '🏖️ Beach', value: 'beach' },
    { label: '🎓 Graduation', value: 'graduation' },
];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const COLOR_PALETTES = [
    { label: '🔴 Bold Reds', value: 'red crimson maroon', color: '#ef4444' },
    { label: '🩷 Pinks', value: 'pink blush rose dusty rose', color: '#ec4899' },
    { label: '🟣 Purples', value: 'purple violet lavender', color: '#8b5cf6' },
    { label: '🔵 Blues', value: 'blue navy royal cerulean', color: '#3b82f6' },
    { label: '🟢 Greens', value: 'green emerald sage mint', color: '#10b981' },
    { label: '🟡 Yellows', value: 'yellow golden saffron mustard', color: '#f59e0b' },
    { label: '⚪ Neutrals', value: 'white ivory cream beige nude', color: '#e5e7eb' },
    { label: '🖤 Dark & Bold', value: 'black charcoal dark midnight', color: '#374151' },
];

// ─── Trending suggestions (quick access) ──────────────────────────────────────
const TRENDING = [
    { label: '🔥 Trending this week', query: 'What is trending in Indian fashion this week?' },
    { label: '💎 Under ₹999', query: 'Suggest stylish outfits under 999 rupees' },
    { label: '🌸 Pastel Collection', query: 'Show me pastel colored dresses and kurtis' },
    { label: '👰 Bridal Picks', query: 'Recommend bridal lehengas and wedding outfits' },
    { label: '🌞 Summer Essentials', query: 'What should I wear in summer? Suggest breathable outfits' },
    { label: '🎁 Gift Ideas', query: 'What clothing makes a great gift for a woman?' },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=400&fit=crop';

// ─── Occasion Fallbacks ────────────────────────────────────────────────────────
const OCCASION_FALLBACKS = {
    wedding: (sz) => `For your wedding look in size ${sz}, a dusty rose silk lehenga or royal blue georgette anarkali with heavy embroidery would be stunning ✨ Both photograph brilliantly under wedding lights — look for mirror work or zari borders for extra glamour!\n\n[SEARCH: lehenga wedding silk embroidery]`,
    party: (sz) => `For a party in size ${sz}, a sequined bodycon or flowy palazzo in jewel tones (emerald, sapphire, burgundy) is perfect 🎉 These catch light beautifully all night.\n\n[SEARCH: party dress sequin palazzo]`,
    casual: (sz) => `For casual in size ${sz}, a relaxed cotton kurta with palazzo pants or a breezy maxi in pastels or earthy tones 👗 Comfortable and stylish all day.\n\n[SEARCH: kurta casual cotton maxi]`,
    office: (sz) => `For office in size ${sz}, a crisp cotton saree or tailored kurti with straight-cut pants in navy, grey, or olive would project confidence ✔️\n\n[SEARCH: kurti office formal saree]`,
    festival: (sz) => `For festivals in size ${sz}, a vibrant bandhani or block-print cotton kurta with mirror-work details is stunning 🪔 Saffron, magenta, and turquoise radiate festive energy!\n\n[SEARCH: kurta festival bandhani block-print]`,
    'date night': (sz) => `For a date night in size ${sz}, a deep jewel-toned wrap dress in chiffon or a flirty A-line in dusty rose 🌙 — effortlessly romantic and flattering.\n\n[SEARCH: dress chiffon wrap romantic]`,
    beach: (sz) => `For the beach in size ${sz}, a flowy layered maxi in white or aqua, or a linen co-ord set 🏖️ Light fabrics keep you cool and chic.\n\n[SEARCH: maxi dress beach linen rayon]`,
    graduation: (sz) => `For graduation in size ${sz}, a sophisticated saree in muted gold or ivory, or a structured anarkali suit would be elegant and memorable 🎓\n\n[SEARCH: saree anarkali formal graduation]`,
};

const buildSystemPrompt = (userName, persona, season, inventoryCtx, orderHistoryCtx) => `You are StyleAI, an expert AI fashion stylist for "White House" — a premium Indian textile and fashion e-commerce store.
${userName ? `The customer's name is ${userName}. Use their name once naturally early in the conversation.` : ''}
${persona ? `The customer's style personality is: "${persona.label}" — ${persona.desc}. Tailor ALL recommendations to this style.` : ''}

Current fashion season context: ${season}
${inventoryCtx ? `\n[LIVE INVENTORY]: ${inventoryCtx}\n* You can only recommend items if they seem matching to what is in-stock.*` : ''}
${orderHistoryCtx ? `\n[USER ORDER HISTORY]: ${orderHistoryCtx}\n* Reference their past purchases if they ask for something similar, or to welcome them back!*` : ''}

Personality: Warm, enthusiastic, deeply knowledgeable. Use emojis expressively but tastefully.
MULTILINGUAL SUPPORT: You must fluently respond in the exact same language the user speaks to you (e.g., if they speak Hindi, reply in Hindi. If Tamil, reply in Tamil).

CRITICAL CONVERSATION FLOW (Follow these exact steps):
1. GREETING: Welcome warmly, introduce yourself, ask what OCCASION they are shopping for.
2. OCCASION GIVEN -> ASK SIZE: If they tell you the occasion but haven't mentioned size, YOU MUST ASK "What is your dress size?" in your reply. Do NOT recommend products yet.
3. SIZE & OCCASION GIVEN -> ASK COLOR: If they have given occasion and size, YOU MUST ASK "What color palette do you prefer?" in your reply. Do NOT recommend products yet.
4. ALL 3 GIVEN -> RECOMMEND PRODUCTS: Only once you know Occasion, Size, AND Color, you should describe the perfect outfit in 2-3 sentences and end your reply EXACTLY with: [SEARCH: keyword1 keyword2] (use the color and item type as keywords).

Rules:
- Give price-conscious suggestions if they ask for a budget.
- Never break character. You are always StyleAI.`;

// ─── Smart Fallback ────────────────────────────────────────────────────────────
const buildSmartFallback = (text, name, persona) => {
    const t = text.toLowerCase();
    const greetWords = ['hi', 'hello', 'hey', 'namaste', 'hii', 'helo', 'hai', 'hiya', 'sup', 'good morning', 'good evening'];
    if (greetWords.some(g => t.includes(g))) {
        return `Hi ${name || 'there'}! 👋 I'm StyleAI, your personal fashion stylist at White House Textiles ✨\n\nI'm here to help you find beautiful outfits for any occasion. What are you shopping for today?`;
    }
    for (const [key, fn] of Object.entries(OCCASION_FALLBACKS)) {
        if (t.includes(key)) {
            const sizeMatch = t.match(/\b(xs|s|m|l|xl|xxl|3xl)\b/i);
            return fn(sizeMatch ? sizeMatch[0].toUpperCase() : 'your');
        }
    }
    const sizeMatch = t.match(/\b(xs|s|m|l|xl|xxl|3xl)\b/i);
    if (sizeMatch) return `Great, size ${sizeMatch[0].toUpperCase()}! 📏 What's the occasion? That'll help me suggest the perfect style and fabric ✨\n\n[SEARCH: ${sizeMatch[0].toLowerCase()} dress kurta]`;
    if (t.includes('price') || t.includes('budget') || t.includes('cheap') || t.includes('afford'))
        return `At White House Textiles, we have stunning outfits across all budgets 💰 From everyday kurtas starting at ₹499 to premium silk lehengas. What occasion are you dressing for?\n\n[SEARCH: affordable dress budget collection]`;
    if (t.includes('trend') || t.includes('latest') || t.includes('new'))
        return `Right now, ${getCurrentSeason()} 🔥 Co-ord sets, organza sarees, and Anarkali suits with floral embroidery are topping the charts. Want me to pick something for a specific occasion?\n\n[SEARCH: trending new collection]`;
    if (t.includes('silk')) return `Silk is the queen of fabrics ✨ Perfect for weddings and formal events — it drapes beautifully and has a natural sheen. Want a specific silk recommendation?\n\n[SEARCH: silk saree lehenga]`;
    if (t.includes('cotton')) return `Cotton is breathable, comfortable, and incredibly versatile 🌿 Perfect for daily wear, casual outings, and even festive kurtis. What occasion are you shopping for?\n\n[SEARCH: cotton kurta dress casual]`;
    if (t.includes('gift')) return `A beautiful silk saree, a premium kurti set, or an embroidered dupatta makes a gorgeous gift 🎁 Who is it for and what's the occasion?\n\n[SEARCH: gift saree kurti dupatta]`;
    return `I'd love to help you find the perfect outfit! 👗 Could you share:\n• What's the occasion?\n• What's your size?\n\nWith those details I'll give you spot-on recommendations ✨`;
};

// ─── Typing Indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
    <div className="chat-message ai-message">
        <div className="message-avatar">✨</div>
        <div className="typing-bubble">
            <span className="dot"></span><span className="dot"></span><span className="dot"></span>
        </div>
    </div>
);

// ─── Mini Product Card ─────────────────────────────────────────────────────────
const MiniProductCard = ({ product, onAddToCart, onWishlist, isWishlisted }) => {
    const [added, setAdded] = useState(false);
    const imageUrl = product.imageUrl || FALLBACK_IMAGE;

    const handleAdd = (e) => {
        e.preventDefault(); e.stopPropagation();
        onAddToCart(product); setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };
    const handleWish = (e) => {
        e.preventDefault(); e.stopPropagation();
        onWishlist(product);
    };

    return (
        <Link to={`/product/${product.id}`} className="mini-product-card">
            <img src={imageUrl} alt={product.name} className="mini-product-img"
                onError={e => { e.target.src = FALLBACK_IMAGE; }} />
            <div className="mini-product-info">
                <p className="mini-product-name">{product.name}</p>
                <p className="mini-product-price">₹{product.price?.toLocaleString()}</p>
                <div className="mini-product-actions">
                    <button className={`mini-add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
                        {added ? <><Check size={10} />Added</> : <><ShoppingCart size={10} />Add</>}
                    </button>
                    <button className={`mini-wish-btn ${isWishlisted ? 'wished' : ''}`} onClick={handleWish} title="Save">
                        <Heart size={10} fill={isWishlisted ? '#f43f5e' : 'none'} />
                    </button>
                    <span className="mini-view-btn"><ExternalLink size={10} /> View</span>
                </div>
            </div>
        </Link>
    );
};

// ─── Chat Message ──────────────────────────────────────────────────────────────
const ChatMessage = ({ message, onAddToCart, onWishlist, wishlist, onCopy }) => {
    const isAI = message.role === 'ai';
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.text).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 2000);
        });
        onCopy?.();
    };

    return (
        <motion.div className={`chat-message ${isAI ? 'ai-message' : 'user-message'}`}
            initial={{ opacity: 0, y: 14, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}>
            {isAI && <div className="message-avatar">✨</div>}
            <div className={`message-bubble ${isAI ? 'ai-bubble' : 'user-bubble'}`}>
                <p className="message-text">{message.text}</p>

                {/* Copy button on AI messages */}
                {isAI && message.text && (
                    <button className="copy-btn" onClick={handleCopy} title="Copy">
                        {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                    </button>
                )}

                {/* Product cards */}
                {message.products?.length > 0 && (
                    <div className="product-suggestions">
                        <p className="suggestions-label">🛍️ Top picks for you:</p>
                        <div className="mini-products-grid">
                            {message.products.slice(0, 3).map(p => (
                                <MiniProductCard key={p.id} product={p}
                                    onAddToCart={onAddToCart}
                                    onWishlist={onWishlist}
                                    isWishlisted={wishlist.some(w => w.id === p.id)} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick-reply chips */}
                {message.chips?.length > 0 && (
                    <div className="quick-chips">
                        {message.chips.map(chip => (
                            <button key={chip.value || chip.label} className="chip-btn" onClick={chip.onClick}>
                                {chip.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// ─── Style Quiz Panel ──────────────────────────────────────────────────────────
const StyleQuiz = ({ onSelect }) => (
    <motion.div className="style-quiz-panel"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.25 }}>
        <p className="quiz-title"><Brain size={14} /> What's your style personality?</p>
        <div className="quiz-grid">
            {STYLE_PERSONAS.map(p => (
                <button key={p.id} className="quiz-card" onClick={() => onSelect(p)}
                    style={{ '--persona-color': p.color }}>
                    <span className="quiz-emoji">{p.emoji}</span>
                    <span className="quiz-label">{p.label}</span>
                    <span className="quiz-desc">{p.desc}</span>
                </button>
            ))}
        </div>
    </motion.div>
);

// ─── Wishlist Panel ────────────────────────────────────────────────────────────
const WishlistPanel = ({ items, onRemove }) => (
    <motion.div className="wishlist-panel"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}>
        <p className="wishlist-title"><Heart size={13} fill="#f43f5e" color="#f43f5e" /> Saved Items ({items.length})</p>
        {items.length === 0
            ? <p className="wishlist-empty">No saved items yet. Tap ♥ on any product card!</p>
            : <div className="wishlist-list">
                {items.map(item => (
                    <div key={item.id} className="wishlist-item">
                        <Link to={`/product/${item.id}`} className="wishlist-name">{item.name}</Link>
                        <span className="wishlist-price">₹{item.price?.toLocaleString()}</span>
                        <button className="wishlist-remove" onClick={() => onRemove(item.id)}>×</button>
                    </div>
                ))}
            </div>
        }
    </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════════
//  Main Chatbot Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function AIChatbot() {
    const { user, isLoaded: clerkLoaded } = useUser();
    const userName = user?.firstName || user?.username || null;
    const displayName = userName || 'there';

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [aiOnline, setAiOnline] = useState(true);

    // New feature states
    const [persona, setPersona] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [activePanel, setActivePanel] = useState(null); // 'quiz' | 'wishlist' | 'trending' | 'colors'
    const [isListening, setIsListening] = useState(false);
    const [voiceSupport, setVoiceSupport] = useState(false);
    const [inventoryCtx, setInventoryCtx] = useState('');
    const [orderHistoryCtx, setOrderHistoryCtx] = useState('');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const chatHistory = useRef([]);
    const recognitionRef = useRef(null);
    const { addToCart } = useCart();
    const season = getCurrentSeason();

    // Check voice support
    useEffect(() => {
        setVoiceSupport('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            setTimeout(() => inputRef.current?.focus(), 350);
            if (!hasGreeted && clerkLoaded) {
                setHasGreeted(true);
                fetchContexts();
                startGreeting();
            }
        }
    }, [isOpen, clerkLoaded]);

    const fetchContexts = async () => {
        try {
            const res = await fetch(API_ENDPOINTS.products);
            if (res.ok) {
                const products = await res.json();
                const inStock = products.filter(p => p.stock > 0).map(p => p.name).join(', ');
                if (inStock) setInventoryCtx(`Available in store right now: ${inStock.substring(0, 1000)}`);
            }
        } catch (e) { console.error("Could not fetch inventory context"); }

        if (user?.id) {
            try {
                const res = await fetch(API_ENDPOINTS.userOrders(user.id));
                if (res.ok) {
                    const orders = await res.json();
                    if (orders && orders.length > 0) {
                        const purchased = orders.flatMap(o => o.items?.map(i => i.productSnapshot?.name || i.productId) || []).filter(Boolean);
                        if (purchased.length > 0) {
                            setOrderHistoryCtx(`Past purchases: ${purchased.join(', ')}`);
                        }
                    }
                }
            } catch (e) { console.error("Could not fetch order context"); }
        }
    };

    const addMsg = useCallback((msg) => {
        setMessages(prev => [...prev, { id: crypto.randomUUID(), ...msg }]);
        if (!isOpen && msg.role === 'ai') setUnreadCount(n => n + 1);
    }, [isOpen]);

    // ── Greeting ─────────────────────────────────────────────────────────────
    const startGreeting = () => {
        setMessages([]); chatHistory.current = [];
        setTimeout(() => {
            addMsg({
                role: 'ai',
                text: `Hi ${displayName}! 👋 I'm StyleAI, your personal fashion stylist at White House Textiles ✨\n\nI know the current season — ${season.split('—')[0].trim()} — so I'll tailor my picks for right now. What are you shopping for?`,
                chips: OCCASIONS.map(o => ({ label: o.label, value: o.value, onClick: () => handleChipSend(o.label) })),
            });
        }, 400);
    };

    // ── Voice Input ───────────────────────────────────────────────────────────
    const startVoice = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return;
        const recognition = new SR();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setInputValue(transcript);
            setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setIsListening(true);
    };
    const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };

    // ── Wishlist ──────────────────────────────────────────────────────────────
    const toggleWishlist = (product) => {
        setWishlist(prev =>
            prev.some(w => w.id === product.id)
                ? prev.filter(w => w.id !== product.id)
                : [...prev, product]
        );
    };
    const removeWishlist = (id) => setWishlist(prev => prev.filter(w => w.id !== id));

    // ── Style Quiz selection ──────────────────────────────────────────────────
    const handlePersonaSelect = (p) => {
        setPersona(p);
        setActivePanel(null);
        addMsg({ role: 'user', text: `My style personality: ${p.emoji} ${p.label}` });
        setTimeout(() => {
            addMsg({
                role: 'ai',
                text: `Love it! ${p.emoji} **${p.label}** — ${p.desc}! I'll curate all my recommendations around your style from now on ✨\n\nNow tell me — what occasion are you shopping for?`,
                chips: OCCASIONS.map(o => ({ label: o.label, value: o.value, onClick: () => handleChipSend(o.label) })),
            });
        }, 300);
    };

    // ── Color palette selection ───────────────────────────────────────────────
    const handleColorSelect = (color) => {
        setActivePanel(null);
        handleChipSend(`I love ${color.label} colors — recommend outfits in ${color.value}`);
    };

    // ── Chip send ─────────────────────────────────────────────────────────────
    const handleChipSend = (text) => {
        addMsg({ role: 'user', text });
        callGemini(text);
    };

    // ── Core Groq Call ────────────────────────────────────────────────────────
    const callGroqWithModel = async (messages) => {
        const res = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_KEY}`,
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages,
                max_tokens: 450,
                temperature: 0.9,
            }),
        });
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`Groq ${res.status}: ${errData?.error?.message || 'Unknown'}`);
        }
        const data = await res.json();
        const aiText = data?.choices?.[0]?.message?.content?.trim();
        if (!aiText) throw new Error('Empty response');
        return aiText;
    };

    const callGemini = async (userText) => {
        setIsTyping(true); setActivePanel(null);
        const systemPrompt = buildSystemPrompt(userName, persona, season, inventoryCtx, orderHistoryCtx);
        const newUserEntry = { role: 'user', parts: [{ text: userText }] };
        const updatedHistory = [...chatHistory.current, newUserEntry];

        // Build OpenAI-style messages for Groq
        const groqMessages = [
            { role: 'system', content: systemPrompt },
            // Flatten chat history
            ...updatedHistory.map(m => ({
                role: m.role === 'model' ? 'assistant' : 'user',
                content: m.parts[0].text,
            })),
        ];

        let aiText = null;
        try {
            aiText = await callGroqWithModel(groqMessages);
            setAiOnline(true);
        } catch (err) {
            console.warn('Groq fallback:', err.message);
            setAiOnline(false);
        }

        if (aiText) {
            chatHistory.current = [...updatedHistory, { role: 'model', parts: [{ text: aiText }] }];
            await finishResponse(aiText, userText);
        } else {
            const fb = buildSmartFallback(userText, userName, persona);
            chatHistory.current = [...updatedHistory, { role: 'model', parts: [{ text: fb }] }];
            await finishResponse(fb, userText);
        }
    };

    // ── Parse response → products ─────────────────────────────────────────────
    const finishResponse = async (rawText, userQuery) => {
        const searchMatch = rawText.match(/\[SEARCH:\s*([^\]]+)\]/);
        const cleanText = rawText.replace(/\[SEARCH:[^\]]*\]/g, '').trim();
        let products = [];
        if (searchMatch) products = await fetchProducts(searchMatch[1].trim(), userQuery);
        setIsTyping(false);

        // Detect what the AI is ASKING for (order matters — most specific first)
        const wantsColor = /what color|which color|color.*prefer|colour.*prefer|color palette|pick.*color|choose.*color|color.*vibe|shade.*prefer/i.test(cleanText) && products.length === 0;
        const wantsSize = /what.*size|which.*size|your size|size.*are you|tell me your size/i.test(cleanText) && products.length === 0;
        const wantsOccasion = /what.*occasion|which occasion|shopping for\?|what are you.*shopping|choose.*occasion|what.*looking for/i.test(cleanText) && products.length === 0;

        let chips = [];
        if (wantsColor) {
            chips = COLOR_PALETTES.map(c => ({ label: c.label, value: c.value, onClick: () => handleChipSend(`I prefer ${c.label}`) }));
        } else if (wantsSize) {
            chips = SIZES.map(s => ({ label: s, value: s, onClick: () => handleChipSend(`My size is ${s}`) }));
        } else if (wantsOccasion) {
            chips = OCCASIONS.map(o => ({ label: o.label, value: o.value, onClick: () => handleChipSend(o.label) }));
        }

        addMsg({
            role: 'ai', text: cleanText, products,
            chips
        });
    };

    // ── Product fetch ─────────────────────────────────────────────────────────
    const fetchProducts = async (searchQuery, fallbackKeyword = '') => {
        try {
            const res = await fetch(API_ENDPOINTS.searchProducts(searchQuery));
            if (res.ok) { const data = await res.json(); if (Array.isArray(data) && data.length) return data.slice(0, 3); }
        } catch (_) { }
        try {
            const res = await fetch(API_ENDPOINTS.products);
            if (res.ok) {
                const all = await res.json();
                const kw = [...searchQuery.toLowerCase().split(/\s+/), ...fallbackKeyword.toLowerCase().split(/\s+/)].filter(k => k.length > 2);
                return all.filter(p => kw.some(k => `${p.name} ${p.category?.name || ''} ${p.description || ''}`.toLowerCase().includes(k))).slice(0, 3);
            }
        } catch (_) { }
        return [];
    };

    // ── Send ──────────────────────────────────────────────────────────────────
    const handleSend = async () => {
        const text = inputValue.trim();
        if (!text || isTyping) return;
        setInputValue('');
        addMsg({ role: 'user', text });
        await callGemini(text);
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
    const handleReset = () => { chatHistory.current = []; setHasGreeted(false); setMessages([]); setPersona(null); setActivePanel(null); setTimeout(startGreeting, 100); };

    const togglePanel = (name) => setActivePanel(prev => prev === name ? null : name);

    // ═════════════════════════════════════════════════════════════════════════
    //  Render
    // ═════════════════════════════════════════════════════════════════════════
    return (
        <>
            {/* ── Floating Action Button ── */}
            <motion.button className="chat-fab" onClick={() => setIsOpen(p => !p)}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} aria-label="Open StyleAI">
                <div className="fab-pulse-ring"></div>
                <div className="fab-pulse-ring delay"></div>
                <AnimatePresence mode="wait">
                    {isOpen
                        ? <motion.span key="c" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><ChevronDown size={26} /></motion.span>
                        : <motion.span key="o" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><MessageCircle size={26} /></motion.span>
                    }
                </AnimatePresence>
                {!isOpen && unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                {!isOpen && <div className="fab-label">Style AI</div>}
            </motion.button>

            {/* ── Chat Window ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div className="chat-window"
                        initial={{ opacity: 0, y: 28, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 28, scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 330, damping: 28 }}>

                        {/* Header */}
                        <div className="chat-header">
                            <div className="chat-header-info">
                                <div className="chat-avatar-wrapper"><Sparkles size={20} /></div>
                                <div>
                                    <h3 className="chat-title">StyleAI {persona && <span className="persona-badge" style={{ background: persona.color }}>{persona.emoji}</span>}</h3>
                                    <p className="chat-subtitle">
                                        <span className={`status-dot ${aiOnline ? 'online' : 'offline'}`}></span>
                                        {aiOnline ? 'AI Online' : 'Smart Mode'} · Fashion Stylist
                                    </p>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                <button className="header-btn" onClick={handleReset} title="Restart"><RotateCcw size={15} /></button>
                                <button className="header-btn close-btn" onClick={() => setIsOpen(false)}><X size={17} /></button>
                            </div>
                        </div>

                        {/* User pill */}
                        {userName && <div className="user-pill"><span>👤</span> Styling for <strong>{userName}</strong></div>}

                        {/* ── Feature Toolbar ── */}
                        <div className="feature-toolbar">
                            <button className={`toolbar-btn ${activePanel === 'quiz' ? 'active' : ''}`} onClick={() => togglePanel('quiz')} title="Style Quiz">
                                <Brain size={14} /> <span>Style Quiz</span>
                            </button>
                            <button className={`toolbar-btn ${activePanel === 'colors' ? 'active' : ''}`} onClick={() => togglePanel('colors')} title="My Colors">
                                <Palette size={14} /> <span>Colors</span>
                            </button>
                            <button className={`toolbar-btn ${activePanel === 'trending' ? 'active' : ''}`} onClick={() => togglePanel('trending')} title="Trending">
                                <TrendingUp size={14} /> <span>Trending</span>
                            </button>
                            <button className={`toolbar-btn ${activePanel === 'wishlist' ? 'active' : ''} ${wishlist.length > 0 ? 'has-items' : ''}`} onClick={() => togglePanel('wishlist')} title="Saved">
                                <Heart size={14} fill={wishlist.length ? '#f43f5e' : 'none'} color={wishlist.length ? '#f43f5e' : 'currentColor'} />
                                <span>Saved {wishlist.length > 0 && <span className="toolbar-count">{wishlist.length}</span>}</span>
                            </button>
                        </div>

                        {/* ── Slide-in Panels ── */}
                        <AnimatePresence>
                            {activePanel === 'quiz' && <StyleQuiz key="quiz" onSelect={handlePersonaSelect} />}
                            {activePanel === 'wishlist' && <WishlistPanel key="wish" items={wishlist} onRemove={removeWishlist} />}

                            {activePanel === 'trending' && (
                                <motion.div key="trending" className="trending-panel"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                                    <p className="panel-title"><TrendingUp size={13} /> Hot right now</p>
                                    <div className="trending-chips">
                                        {TRENDING.map(t => (
                                            <button key={t.label} className="trending-chip" onClick={() => { setActivePanel(null); handleChipSend(t.query); }}>
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activePanel === 'colors' && (
                                <motion.div key="colors" className="colors-panel"
                                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                                    <p className="panel-title"><Palette size={13} /> Pick your color vibe</p>
                                    <div className="color-chips">
                                        {COLOR_PALETTES.map(c => (
                                            <button key={c.value} className="color-chip" onClick={() => handleColorSelect(c)}
                                                style={{ '--chip-color': c.color }}>
                                                <span className="color-dot" style={{ background: c.color }}></span>
                                                {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Messages ── */}
                        <div className="chat-messages">
                            {messages.map(msg => (
                                <ChatMessage key={msg.id} message={msg}
                                    onAddToCart={addToCart}
                                    onWishlist={toggleWishlist}
                                    wishlist={wishlist}
                                    onCopy={() => { }} />
                            ))}
                            {isTyping && <TypingIndicator />}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* ── Input ── */}
                        <div className="chat-input-area">
                            {/* Voice button */}
                            {voiceSupport && (
                                <button className={`voice-btn ${isListening ? 'listening' : ''}`}
                                    onClick={isListening ? stopVoice : startVoice}
                                    title={isListening ? 'Stop listening' : 'Click to speak'}>
                                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                                </button>
                            )}
                            <input ref={inputRef} className="chat-input" type="text"
                                placeholder={isListening ? '🎙️ Listening...' : 'Ask me anything about fashion...'}
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isTyping} />
                            <button className={`send-btn ${(!inputValue.trim() || isTyping) ? 'disabled' : ''}`}
                                onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
                                {isTyping ? <Zap size={16} /> : <Send size={17} />}
                            </button>
                        </div>

                        <p className="chat-footer-note">
                            Powered by Gemini AI · <Star size={9} style={{ display: 'inline' }} /> White House Textiles
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
