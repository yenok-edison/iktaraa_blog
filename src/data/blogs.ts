/**
 * Iktaraa Music Blog & Magazine Data File
 * ----------------------------------------------------------------------------
 * Maintain, edit, add, or delete blog articles directly in this file.
 * Each article supports rich markdown-ready sections, quotes, pro-tips,
 * specifications, audio demos, tags, and author credentials.
 */
import {
  siInstagram,
  siYoutube,
  siSpotify,
  siWhatsapp,
} from "simple-icons";

export interface Author {
  name: string;
  avatar: string;
  role: string;
  bio: string;
}

export interface BlogSection {
  heading: string;
  body: string;
  quote?: string;
  quoteAuthor?: string;
  proTip?: string;
  specs?: { label: string; value: string }[];
}

export interface AudioSnippet {
  title: string;
  artist: string;
  duration: string;
  genre: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  date: string;
  isoDate: string; // Used for accurate date sorting (YYYY-MM-DD)
  readTime: string;
  likes: number;
  views: number;
  commentsCount: number;
  image: string;
  imageAlt: string;
  imageCredit?: string;
  author: Author;
  tags: string[];
  isHighlight?: boolean;
  highlightBadge?: string;
  isTrending?: boolean;
  trendingRank?: number;
  audioSnippet?: AudioSnippet;
  content: {
    introduction: string;
    highlights: string[];
    sections: BlogSection[];
    conclusion: string;
  };
  relatedIds: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  color: string;
  badgeBg: string;
  iconName: string;
}

export interface MusicEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  city: string;
  genre: string;
  badge: string;
  price: string;
  spotsLeft: number;
}

// -----------------------------------------------------------------------------
// CATEGORIES LIST (Easily edit, reorder or add categories)
// -----------------------------------------------------------------------------
export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    id: "all",
    name: "All Categories",
    slug: "all",
    count: 12,
    color: "#0F766E",
    badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
    iconName: "Sparkles",
  },
  {
    id: "instruments",
    name: "Instruments & Gear",
    slug: "instruments-gear",
    count: 4,
    color: "#E11D48",
    badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
    iconName: "Guitar",
  },
  {
    id: "learning",
    name: "Learn & Master",
    slug: "learn-master",
    count: 3,
    color: "#2563EB",
    badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
    iconName: "GraduationCap",
  },
  {
    id: "events",
    name: "Live & Events",
    slug: "live-events",
    count: 2,
    color: "#D97706",
    badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
    iconName: "Calendar",
  },
  {
    id: "production",
    name: "Audio & Tech",
    slug: "audio-tech",
    count: 2,
    color: "#7C3AED",
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
    iconName: "Sliders",
  },
  {
    id: "artists",
    name: "Artist Stories",
    slug: "artist-stories",
    count: 1,
    color: "#0D9488",
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconName: "Mic2",
  },
];

// -----------------------------------------------------------------------------
// BLOG POSTS REPOSITORY (Easily add or modify blogs below)
// -----------------------------------------------------------------------------
export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "ultimate-acoustic-guitar-buying-guide-2026",
    title: "The Ultimate Acoustic Guitar Buying Guide: Tone Woods, Shapes & Action",
    category: "Instruments & Gear",
    shortDescription: "Deciphering solid spruce vs cedar tops, dreadnought vs grand auditorium body dynamics, and setting up ideal action for soulful fingerstyle resonance.",
    date: "Sep 28, 2026",
    isoDate: "2026-09-28",
    readTime: "7 min read",
    likes: 55,
    views: 1120,
    commentsCount: 8,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Acoustic guitar craftsmanship with rich spruce wood grains and rosette",
    imageCredit: "Photo by Iktaraa Studio / Unsplash",
    isHighlight: true,
    highlightBadge: "🔥 Most Read This Week",
    isTrending: true,
    trendingRank: 1,
    author: {
      name: "Rohan Varma",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      role: "Luthier & Principal Gear Reviewer",
      bio: "Rohan has inspected over 1,400 acoustic guitars across India and Europe, consulting for bespoke luthiers and stage touring artists.",
    },
    tags: ["Acoustic Guitar", "Tone Woods", "Gear Guide", "Fingerstyle", "Setup"],
    audioSnippet: {
      title: "Solid Sitka Spruce vs Western Red Cedar Resonance Sample",
      artist: "Iktaraa Acoustic Lab",
      duration: "1:42",
      genre: "Acoustic Fingerstyle",
    },
    content: {
      introduction: "Stepping into a musical instrument showroom or browsing online for your next acoustic guitar can quickly become overwhelming. Between Sitka Spruce, Western Red Cedar, Mahogany back and sides, and mysterious terms like scalloped X-bracing, how do you discover the instrument that sings in harmony with your fingers?",
      highlights: [
        "Solid wood vs. laminate tops: why the vibrating soundboard accounts for 80% of dynamic expression.",
        "Choosing body shapes: Dreadnought (booming low-end) vs Grand Auditorium (balanced fingerstyle precision).",
        "Scale length and fretboard radius considerations for player ergonomics and zero finger fatigue.",
        "Professional setup checklist: truss rod relief, nut slot depth, and saddle height adjustment.",
      ],
      sections: [
        {
          heading: "1. The Heart of the Guitar: Tonewood Alchemy",
          body: "The soundboard (top) is the true vocal cord of any acoustic guitar. When your pick or fingernail excites a string, kinetic energy transmits across the bone saddle down into the bridge plate and radiates throughout the spruce or cedar top.",
          quote: "A great guitar does not just produce notes; it blooms with harmonic overtones that mirror the nuance in your hands.",
          quoteAuthor: "Master Luthier Michael Bashkin",
          proTip: "If you sing while playing, mahogany tops produce a warm, dry midrange that nests beneath your vocal range without clashing with higher registers.",
          specs: [
            { label: "Sitka Spruce", value: "Bright, punchy attack, tremendous headroom when strumming hard" },
            { label: "Western Red Cedar", value: "Warm, dark, responsive to ultra-soft fingerstyle touch" },
            { label: "Solid Rosewood Back/Sides", value: "Bell-like highs, scooped midrange, rich sustained bass" },
          ],
        },
        {
          heading: "2. Body Ergonomics: Finding Your True Silhouette",
          body: "Bigger does not universally mean better. While the iconic Dreadnought remains the king of bluegrass jams and campfire projection, parlor and concert sizes provide unmatched articulate string separation under recording studio microphones.",
          proTip: "Before purchasing, sit down without a strap. If your right shoulder feels pushed upward or your elbow pinches within 15 minutes, step down to an OM (Orchestra Model) or 000 shape.",
        },
        {
          heading: "3. Action & Playability: Don't Let High Strings Break Your Will",
          body: "More beginner musicians abandon guitar due to poor initial setup than lack of musical talent. A factory guitar rarely leaves its shipping container dialed into optimal action. Ensure your local music technician sets string clearance at the 12th fret to approximately 2.2mm on the low E and 1.8mm on the high E.",
        },
      ],
      conclusion: "Your dream guitar isn't simply the most expensive badge on the headstock. It is the one whose physical resonance prompts you to pick it up every morning before your first cup of chai. Visit your local Iktaraa partner stores to test these instruments with your own ears.",
    },
    relatedIds: ["blog-2", "blog-4", "blog-6"],
  },
  {
    id: "blog-2",
    slug: "mastering-indian-classical-ragas-on-western-keys",
    title: "Bridging Worlds: Translating Indian Classical Ragas to Western Piano & Synth",
    category: "Learn & Master",
    shortDescription: "How to interpret microtonal meend and gamaka on twelve-tone equal temperament keyboards without losing the soul of the raga.",
    date: "Sep 25, 2026",
    isoDate: "2026-09-25",
    readTime: "9 min read",
    likes: 88,
    views: 2450,
    commentsCount: 24,
    image: "https://images.pexels.com/photos/12143197/pexels-photo-12143197.jpeg",
    imageAlt: "Pianist hands gracefully playing ivory keys under warm ambient stage lights",
    imageCredit: "Photo by Iktaraa Fusion Workshop / Unsplash",
    isHighlight: true,
    highlightBadge: "⭐ Maestro Masterclass",
    isTrending: true,
    trendingRank: 2,
    author: {
      name: "Dr. Ananya Sen",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      role: "Concert Pianist & Carnatic Theorist",
      bio: "Dr. Ananya holds doctorates in Western classical piano and Carnatic musicology, leading cross-cultural ensembles globally.",
    },
    tags: ["Piano", "Indian Classical", "Raga Theory", "Fusion", "Synthesizer"],
    audioSnippet: {
      title: "Raga Yaman Improvisation - Western Piano Voicings",
      artist: "Dr. Ananya Sen Trio",
      duration: "2:15",
      genre: "Classical Fusion",
    },
    content: {
      introduction: "At first glance, the rigid twelve equal-tempered semitones of a grand piano appear fundamentally at war with the continuous, microtonal slides (meend and gamakas) of Indian classical traditions. Yet, maestros from Charanjit Singh to Utsav Lal have unlocked stunning spiritual depths on the keyboard.",
      highlights: [
        "Re-imagining the Tanpura drone: Root-Fifth modal pedal points on piano bass registers.",
        "Emulating gamaka through grace notes, subtle tremolos, and pitch-bend wheel articulation on modern MPE keyboards.",
        "Dissecting Raga Yaman (Kalyan thaat) and Raga Bhairav through modal western voicings.",
        "Freeing your left hand from Western functional harmony cadence traps (V-I cadence restrictions).",
      ],
      sections: [
        {
          heading: "1. The Fundamental Paradox: Shruti vs. Equal Temperament",
          body: "Indian classical music is fundamentally horizontal and microtonal, whereas Western keyboard composition evolved around vertical polyphony. To render a raga truthfully, the pianist must abandon chord changes that enforce functional Western cadences.",
          quote: "When playing a raga on piano, you are not playing chords; you are weaving shadows and morning light around a solitary note.",
          quoteAuthor: "Pandit Ravi Shankar",
        },
        {
          heading: "2. The Art of Simulated Slides (Kan Swaras)",
          body: "While acoustic piano keys cannot physically bend pitch like a sitar string pulled sideways, rapid diatonic touch grace notes (kan swaras) trick the human auditory cortex into perceiving continuous fluidity.",
          proTip: "Use pitch-bend wheels calibrated to +/- 2 semitones or use an MPE (MIDI Polyphonic Expression) controller like the Roli Seaboard to execute authentic meend.",
        },
      ],
      conclusion: "Experimentation is where new genres are born. Sit down at your keyboard today, strike a low C and G fifth drone, and let your right hand slowly explore the sharp fourth of Yaman.",
    },
    relatedIds: ["blog-1", "blog-3", "blog-5"],
  },
  {
    id: "blog-3",
    slug: "home-recording-studio-setup-under-50k",
    title: "Building an Acoustic Oasis: Home Music Production Studio Setup on a Budget",
    category: "Audio & Tech",
    shortDescription: "Acoustic treatment over fancy mics: where to allocate your hard-earned budget for pristine vocal tracks and tight punchy bass mixes.",
    date: "Sep 21, 2026",
    isoDate: "2026-09-21",
    readTime: "8 min read",
    likes: 128,
    views: 4180,
    commentsCount: 12,
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Modern home music production studio with studio monitors and audio interface",
    imageCredit: "Photo by Iktaraa Tech Review / Unsplash",
    isHighlight: false,
    isTrending: true,
    trendingRank: 3,
    author: {
      name: "Kabir Mehta",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      role: "Mix & Mastering Engineer",
      bio: "Kabir has engineered billboard-charting indie singles and runs studio acoustic consultations across metropolitan recording spaces.",
    },
    tags: ["Music Production", "Studio Gear", "Acoustic Treatment", "Audio Interfaces", "Mixing"],
    audioSnippet: {
      title: "Untreated Bedroom vs Treated Bass Trap Vocal AB Test",
      artist: "Iktaraa Sound Labs",
      duration: "0:58",
      genre: "Production Demo",
    },
    content: {
      introduction: "The golden rule of modern music production is simple: an average microphone in an acoustically treated room sounds infinitely superior to a $3,000 vintage tube microphone placed in a square bedroom with bare plaster walls.",
      highlights: [
        "The 40-30-30 rule: Splitting funds between room acoustics, audio monitoring, and recording inputs.",
        "Why DIY dense fiberglass bass traps destroy flimsy foam egg-cartons in low-frequency absorption.",
        "Choosing between USB audio interfaces: Preamp noise floor, dynamic range, and latency stability.",
        "Monitor positioning: The equilateral triangle and decoupling speaker stands from wooden desks.",
      ],
      sections: [
        {
          heading: "1. Taming Room Modes: Why Foam Squares Are A Myth",
          body: "Thin 1-inch foam pyramids only absorb ultra-high frequencies, leaving your boomy low-mid resonances untouched. What you end up with is a lifeless, muffled room where your kicks sound bloated and boomy in cars.",
          proTip: "Focus on the tri-corners of your room first. Dense 50kg/m³ rockwool panels hung across corners will tighten your bottom-end instantly.",
        },
        {
          heading: "2. The Signal Chain: Pristine Conversion",
          body: "Modern 2-channel 24-bit/192kHz audio interfaces under ₹15,000 have cleaner preamps than multi-million dollar recording consoles from the 1970s. Don't fall for marketing hype—clean gain is now universally accessible.",
        },
      ],
      conclusion: "Invest in your ears first, your room second, and your instruments third. Everything else is secondary decoration.",
    },
    relatedIds: ["blog-1", "blog-5", "blog-7"],
  },
  {
    id: "blog-4",
    slug: "independent-musician-touring-checklist-guide",
    title: "The Indie Musician's Survival Guide to Touring: Soundchecks, Gear & Hospitality",
    category: "Live & Events",
    shortDescription: "From stage plots and DI boxes to vocal health on overnight road trips, here is everything seasoned gigging artists pack in their road cases.",
    date: "Sep 18, 2026",
    isoDate: "2026-09-18",
    readTime: "6 min read",
    likes: 295,
    views: 1890,
    commentsCount: 19,
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Live band performing on stage bathed in magenta and teal concert spotlights",
    imageCredit: "Photo by Iktaraa Stage Live / Unsplash",
    isHighlight: true,
    highlightBadge: "🎤 Tour Diaries",
    isTrending: false,
    trendingRank: 4,
    author: {
      name: "Zoya Merchant",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      role: "Touring Vocalist & Band Manager",
      bio: "Frontwoman for 8-piece folk-rock ensemble 'Dastaan', Zoya has navigated over 120 city gigs, music festivals, and college campus fests.",
    },
    tags: ["Live Shows", "Gigging", "Vocal Health", "Stage Sound", "Indie Music"],
    content: {
      introduction: "There is nothing quite like the adrenaline rush of stepping onto a festival stage with thousands of voices singing your lyrics back to you. But getting from your rehearsal room to that stage requires military-grade logistical discipline.",
      highlights: [
        "Crafting a bulletproof stage plot & technical input rider for venue front-of-house sound engineers.",
        "The 'Do Not Forget' gig emergency kit: Gaffer tape, spare 9V batteries, string winders, and grounding plugs.",
        "In-Ear Monitoring (IEMs) vs Wedge stage monitors: protecting your hearing while staying in pitch.",
        "Maintaining your vocal cords during dry hotel air-conditioning and back-to-back travel days.",
      ],
      sections: [
        {
          heading: "1. Making Friends With The Sound Engineer",
          body: "The sound engineer behind the mixing console can make you sound like celestial gods or a muddy mess. Send your stage plot and technical rider at least 10 days in advance, and greet the team with respect the moment you load in.",
          quote: "A prepared musician who arrives on time for soundcheck is already 90% ahead of the competition.",
          quoteAuthor: "Praveen Kumar, Senior Live Sound Engineer",
        },
        {
          heading: "2. The Essential Emergency Bag",
          body: "Never travel without a dedicated hard-case containing extra guitar cables, solderless patch cords, a reliable multi-meter, earplugs, throat soothing herbal lozenges, and a direct injection (DI) box with ground-lift capabilities.",
        },
      ],
      conclusion: "Play every gig—whether to 15 people in a rainy café or 5,000 at an outdoor festival—with identical heart. Word of mouth among venue curators travels faster than social media ads.",
    },
    relatedIds: ["blog-2", "blog-6", "blog-8"],
  },
  {
    id: "blog-5",
    slug: "analog-synthesizers-vs-vst-plugins-sonic-truth",
    title: "Analog Hardware Synthesizers vs. Modern VSTs: The Sonic Truth Revealed",
    category: "Audio & Tech",
    shortDescription: "Does analog warmth truly justify thousands of dollars, or have modern algorithmic plugins reached indistinguishable physical parity?",
    date: "Sep 14, 2026",
    isoDate: "2026-09-14",
    readTime: "7 min read",
    likes: 340,
    views: 2890,
    commentsCount: 31,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Analog synthesizer patch cords, dials, and illuminated filters in sound lab",
    imageCredit: "Photo by Iktaraa Synthesizer Vault / Unsplash",
    isHighlight: false,
    isTrending: false,
    author: {
      name: "Vikramaditya Roy",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      role: "Electronic Composer & Modular Synth Enthusiast",
      bio: "Vikramaditya builds custom Eurorack modules and scores independent cinematic thrillers utilizing vintage analog synthesis.",
    },
    tags: ["Synthesizers", "VST Plugins", "Sound Design", "Audio Tech", "Electronic"],
    content: {
      introduction: "The debate between tactile hardware synthesizers with drifting voltage-controlled oscillators (VCOs) and software virtual instruments running inside digital audio workstations is one of the most passionate in modern electronic music.",
      highlights: [
        "What is 'analog drift'? The subtle micro-imperfections in pitch and filter resonance that create musical warmth.",
        "Blind testing results: Can seasoned mixing engineers reliably distinguish high-end emulations in a busy mix?",
        "Workflow advantages: Knobs and sliders vs mouse clicks and automation curves.",
      ],
      sections: [
        {
          heading: "1. The Psychology of the Tactile Knob",
          body: "The biggest differentiator between hardware and software is not pure audio waveform math; it is tactile kinesthetic feedback. When both hands tweak a resonance knob and filter envelope simultaneously, musical decisions happen organically that never occur when dragging a mouse pointer.",
        },
      ],
      conclusion: "Use software for instant recall, multi-layering, and convenience on the road; keep one inspiring hardware synthesizer on your studio desk for spark and happy accidents.",
    },
    relatedIds: ["blog-3", "blog-7", "blog-1"],
  },
  {
    id: "blog-6",
    slug: "caring-for-classical-indian-instruments-humidity-seasons",
    title: "Monsoon & Winter Care: Preserving Sitars, Tablas & Violins Across Indian Climates",
    category: "Instruments & Gear",
    shortDescription: "Extreme weather variations can warp wood, crack gourds, and detune animal-skin heads. Here are proven luthier preservation secrets.",
    date: "Sep 10, 2026",
    isoDate: "2026-09-10",
    readTime: "8 min read",
    likes: 470,
    views: 3410,
    commentsCount: 29,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Intricate wooden violin and acoustic instrument bridge in soft golden backlight",
    imageCredit: "Photo by Iktaraa Heritage Workshop / Unsplash",
    isHighlight: true,
    highlightBadge: "🌿 Instrument Preservation",
    isTrending: false,
    author: {
      name: "Ustad Salim Khan",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      role: "Third-Generation Heritage Craftsman",
      bio: "Ustad Salim repairs and preserves 100-year-old sitars, sarods, and esrajs from his historic workshop in Miraj.",
    },
    tags: ["Indian Classical", "Sitar", "Tabla", "Violin", "Instrument Care", "Humidity"],
    content: {
      introduction: "Indian classical musical instruments are living, breathing entities crafted from seasoned tun wood, dried bottle gourds (tumba), goat parchment, and natural bone bridges (jawari). When the Indian subcontinent shifts from 85% monsoon humidity to dry winter chill, your instruments experience immense physical stress.",
      highlights: [
        "Why sudden humidity drops cause the seasoned wood of sitars and sarods to contract and crack along the grain.",
        "Managing the syahi (black iron-dough patch) of the tabla during damp monsoon rain spells.",
        "Boveda two-way humidity packs: maintaining a stable 45-55% relative humidity inside hard cases.",
        "Natural oils and cleaning rituals for preserving ebony and rosewood fingerboards.",
      ],
      sections: [
        {
          heading: "1. The Sitar's Delicate Gourd (Tumba)",
          body: "The dried bottle gourd that forms the lower resonance chamber of a sitar is remarkably thin and sensitive. Never store your sitar standing upright against an exterior wall during winter. Thermal transfer through cold bricks can cause microscopic stress fractures.",
          proTip: "Keep a digital hygrometer inside your instrument gig bag. If humidity drops below 40%, slip in a damp sponge enclosed in a perforated ziplock bag.",
        },
      ],
      conclusion: "Treat your instrument with reverence. It is not just dead wood and metal; it is the physical vehicle for your artistic expression.",
    },
    relatedIds: ["blog-1", "blog-2", "blog-8"],
  },
  {
    id: "blog-7",
    slug: "vocal-mastery-breath-support-pitch-control",
    title: "Vocal Mastery: Breath Support, Riyaz Routines & Pitch Perfection Without Strain",
    category: "Learn & Master",
    shortDescription: "Unlock effortless high notes, expand your range, and build rock-solid breath support with vocal routines rooted in both Bel Canto and Dhrupad.",
    date: "Sep 06, 2026",
    isoDate: "2026-09-06",
    readTime: "6 min read",
    likes: 310,
    views: 2210,
    commentsCount: 18,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Vocalist singing passionately into a vintage condenser studio microphone",
    imageCredit: "Photo by Iktaraa Vocal Academy / Unsplash",
    isHighlight: false,
    isTrending: false,
    author: {
      name: "Meera Krishnan",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      role: "Vocal Pedagogue & Playback Artist",
      bio: "Meera coaches aspiring playback singers and stage performers across contemporary pop, semi-classical, and musical theater.",
    },
    tags: ["Vocals", "Singing", "Riyaz", "Breath Control", "Music Lessons"],
    content: {
      introduction: "Your vocal cords (vocal folds) are tiny muscles no bigger than your thumbnail. Pushing excessive air pressure against them in search of volume or high notes is like trying to lift 200 kilograms without stretching.",
      highlights: [
        "The Kharaj riyaz (morning low-note practice): calming the throat and anchoring pitch.",
        "Diaphragmatic expansion: breathing horizontally rather than lifting shoulder blades.",
        "Blending chest voice and head voice: smoothly crossing the vocal passagio.",
      ],
      sections: [
        {
          heading: "1. The Magic of Straw Phonation (SOVTE)",
          body: "Singing warmups through a narrow drinking straw submerged in a glass of water balances pressure above and below the vocal folds, giving you maximum vocal workout with zero muscular collision or irritation.",
        },
      ],
      conclusion: "Patience and gentle daily riyaz will always triumph over sporadic 4-hour shouting marathons. Respect your vocal health.",
    },
    relatedIds: ["blog-2", "blog-4", "blog-8"],
  },
  {
    id: "blog-8",
    slug: "behind-the-soundtrack-evolution-of-indie-cinema-scores",
    title: "Behind the Soundtrack: How Folk Instruments Are Revolutionizing Modern Cinema Scores",
    category: "Artist Stories",
    shortDescription: "From the raw resonance of the sarangi to the earthy pluck of the rabab, composers are discarding synthesizers in favor of indigenous sonic identities.",
    date: "Aug 29, 2026",
    isoDate: "2026-08-29",
    readTime: "8 min read",
    likes: 398,
    views: 2750,
    commentsCount: 22,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Dramatic stage lighting, orchestra musicians, and musical score sheets",
    imageCredit: "Photo by Iktaraa Cinema Sessions / Unsplash",
    isHighlight: false,
    isTrending: false,
    author: {
      name: "Arjun Divakar",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      role: "Film Score Composer & Multi-Instrumentalist",
      bio: "Arjun has composed orchestral and folk-infused scores for internationally acclaimed independent films and OTT series.",
    },
    tags: ["Film Score", "Folk Music", "Sarangi", "Soundtracks", "Cinema", "Composer"],
    content: {
      introduction: "For decades, blockbuster cinema scoring was dominated by uniform Hollywood brass stabs and symphonic string ostinatos. Today, a new wave of visionary composers is searching ancient regional traditions for raw, visceral instruments.",
      highlights: [
        "The haunting vocal-like cries of the Sarangi in emotional cinematic climaxes.",
        "Combining organic bamboo flutes (Bansuri) with ambient modular synthesizers.",
        "Case study: Scoring tension with asymmetric Indian rhythmic cycles (Jhaptaal and Rupak).",
      ],
      sections: [
        {
          heading: "1. The Soul of the Bow: Sarangi's Return",
          body: "With over 30 sympathetic steel strings vibrating beneath three primary gut strings, the sarangi carries an innate melancholy that no digital sound library can duplicate.",
        },
      ],
      conclusion: "When storytelling honors cultural roots, universal emotional resonance naturally follows.",
    },
    relatedIds: ["blog-2", "blog-4", "blog-6"],
  },
];

// -----------------------------------------------------------------------------
// UPCOMING MUSIC EVENTS & WORKSHOPS (Rendered on Left Side)
// -----------------------------------------------------------------------------
export const UPCOMING_EVENTS: MusicEvent[] = [
  {
    id: "evt-1",
    title: "Acoustic Fingerstyle & Luthier Masterclass",
    date: "Oct 12, 2026",
    time: "4:00 PM - 7:30 PM",
    location: "Iktaraa Acoustic Lounge, Indiranagar",
    city: "Bangalore",
    genre: "Acoustic Guitar",
    badge: "Limited Seats",
    price: "₹799",
    spotsLeft: 8,
  },
  {
    id: "evt-2",
    title: "Indian Classical Fusion & Synth Jam Night",
    date: "Oct 18, 2026",
    time: "6:30 PM - 10:00 PM",
    location: "The Royal Opera House, Girgaon",
    city: "Mumbai",
    genre: "Classical Fusion",
    badge: "Selling Fast",
    price: "₹1,200",
    spotsLeft: 14,
  },
  {
    id: "evt-3",
    title: "Home Studio Acoustics & Vocal Production Camp",
    date: "Oct 25, 2026",
    time: "11:00 AM - 3:00 PM",
    location: "Iktaraa Sound Labs, Hauz Khas",
    city: "New Delhi",
    genre: "Audio Production",
    badge: "Weekend Camp",
    price: "₹1,499",
    spotsLeft: 5,
  },
  {
    id: "evt-4",
    title: "Heritage Instrument Care & Sitar Clinic",
    date: "Nov 02, 2026",
    time: "2:00 PM - 5:00 PM",
    location: "Music Heritage Bhavan",
    city: "Kolkata",
    genre: "Instrument Care",
    badge: "Free RSVP",
    price: "Free",
    spotsLeft: 22,
  },
];

// -----------------------------------------------------------------------------
// SOCIAL MEDIA LINKS & CONTACT DETAILS (Rendered on Right Side)
// -----------------------------------------------------------------------------
export const SOCIAL_MEDIA_LINKS = [
  {
    name: "Instagram",
    handle: "@iktaraa_music",
    followers: "6K Musicians",
    url: "https://www.instagram.com/iktaraa_music/",
    color: "from-pink-500 via-rose-500 to-amber-500",
    icon: siInstagram,
  },
  {
    name: "YouTube",
    handle: "Iktaraa Music Studio",
    followers: "25K Subscribers",
    url: "https://www.youtube.com/@iktaraa-music-23",
    color: "from-red-600 to-rose-700",
    icon: siYoutube,
  },
  {
    name: "Spotify",
    handle: "Iktaraa Curated Playlists",
    followers: "85K Monthly Listeners",
    url: "https://spotify.com",
    color: "from-emerald-500 to-teal-700",
    icon: siSpotify,
  },
  {
    name: "WhatsApp Community",
    handle: "Iktaraa Gear Exchange",
    followers: "1K Active Members",
    url: "https://whatsapp.com",
    color: "from-green-500 to-emerald-600",
    icon: siWhatsapp,
  },
];

export const CONTACT_DETAILS = {
  headline: "Need Musical Assistance or Gear Advice?",
  subtext: "Connect directly with our in-house certified instrument specialists and sound engineers.",
  phone: "+91 7845205333",
  email: "support@iktaraa.com",
  editorialEmail: "support@iktaraa.com",
  storeHours: "Monday - Sunday: 10:00 AM - 9:00 PM IST",
  location: "No. 73, Anna Salai Road, Chennai - 600002, India",
};