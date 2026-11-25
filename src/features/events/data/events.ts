import { EventItem, HeroPromoCard, BookingRecord } from '../types/event';

export const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'steinway-grand-masterclass',
    title: 'Vintage Steinway & Sons Model B Grand Piano: Acoustic Voicing & Restoration',
    nativeTitle: 'ஸ்டீன்வே பியானோ மாஸ்டர்கிளாஸ் | Steinway Masterclass',
    subtitle: 'Acoustic resonance teardown, mechanical hammer felt voicing, and soundboard harmonics.',
    category: 'Workshops',
    genre: 'Piano Craft & Acoustics',
    tagline: 'Hands-on soundboard regulation, pinblock tuning, and vintage cast-iron resonance',
    description:
      'Explore the architectural engineering and timbral voicing of a historic 1890s Hamburg Steinway Model B concert grand piano with certified master concert technicians.',
    detailedAbout: [
      'Welcome to the definitive acoustic masterclass on historic concert grand piano restoration and soundboard regulation.',
      'In this exclusive residency session, master piano technician Harish Ramachandran and classical concert pianist Aditi Venkatesh guide you through the anatomy of acoustic piano tone: from duplex scale stringing to soundboard crown resonance.',
      'Learn how hammer felt density changes tone brightness, and examine the historic cast-iron rim acoustics in an intimate listening environment.',
      'Participants receive a certified course completion certificate, high-resolution acoustic impulse response captures, and complimentary espresso refreshments.'
    ],
    date: 'Oct 20, 2026',
    isoDate: '2026-10-20',
    time: '10:30 AM – 1:30 PM',
    venue: 'Iktaraa Piano Atelier & Sound Lab',
    locality: '100ft Road, Indiranagar',
    city: 'Bengaluru',
    duration: '5 min read · 3 hr clinic',
    language: 'English',
    price: 1499,
    originalPrice: 2000,
    image: '/src/assets/images/vintage_grand_piano_1794209793753.jpg',
    coverImage: '/src/assets/images/vintage_grand_piano_1794209793753.jpg',
    audioSampleTitle: 'Steinway Model B Hammer Attack Test',
    audioSampleUrl: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
    isSellingFast: true,
    isRecommended: true,
    interestedCount: 42,
    capacity: 25,
    bookedCount: 19,
    tags: ['LearnPage', 'Bengaluru', 'Piano', 'Masterclass', 'AcousticVoicing', 'Featured'],
    comforts: [
      { id: '1', iconName: 'Coffee', label: 'Artisanal Coffee & Tea Included' },
      { id: '2', iconName: 'Volume2', label: 'Treated Room Acoustics' },
      { id: '3', iconName: 'QrCode', label: 'Instant Digital QR Check-In' },
      { id: '4', iconName: 'Home', label: 'Air-Conditioned Piano Atelier' }
    ],
    ticketTiers: [
      {
        id: 'tier-steinway-pass',
        name: 'Masterclass Access Pass',
        price: 1499,
        description: 'Complete hands-on attendance, workbook, coffee, and certificate.',
        perks: ['Masterclass Admission', 'Acoustic Impulse Pack', 'Artisan Coffee', 'Course Certificate'],
        available: 6
      }
    ],
    uploadedBy: {
      id: 'user-yenok-host',
      name: 'Yenok Kumar',
      email: 'yenok@iktaraa.com',
      role: 'host',
      timestamp: 1793400000000,
    },
    host: {
      id: 'host-steinway',
      name: 'Iktaraa Acoustic Piano Guild',
      avatar: '/src/assets/images/vintage_grand_piano_1794209793753.jpg',
      role: 'Master Piano Technicians',
      bio: 'Restoring historic European & American grand pianos and teaching the science of acoustic sound.',
      rating: 4.98,
      eventsCount: 16,
      followersCount: 11200,
      verified: true
    },
    faqs: []
  },
  {
    id: 'kathaipomaa-10',
    title: 'Kathaipomaa? Edition 10 — Stories & Coffee',
    nativeTitle: 'கதைப்போமா? | Kathaipomaa? Edition 10',
    subtitle: 'One Story. One Evening. A Room Full of People.',
    category: 'Events',
    genre: 'Storytelling & Acoustic',
    tagline: 'An intimate Tamil storytelling & acoustic experience with Kani Thiru',
    description:
      'Where the timeless works of celebrated Tamil authors come alive through the art of narration, warmth of freshly brewed filter coffee, and acoustic notes.',
    detailedAbout: [
      'Hello! A warm welcome to Edition 10 — கதைப்போமா? | Kathaipomaa?',
      'Kathaipomaa is an intimate Tamil storytelling and acoustic musical experience with Kani Thiru, where the works of published Tamil authors come alive through the art of narration and soulful acoustic chords.',
      "It's a sacred space where we come together to pause, listen, laugh, reflect, and rediscover the simple, heartfelt joy of a good story told by an open hearth.",
      'Every edition brings a new experience, with the author and story kept as a little surprise until the narration begins! The room is limited to just 45 guests to preserve natural resonance and conversational warmth.',
      "Whether you're an avid reader or simply someone who enjoys listening to stories while sipping artisan filter coffee, there's a dedicated place for you here.",
      'Join us for a lovely evening of storytelling, coffee, refreshments, and meaningful conversations that linger long after the curtains fall.'
    ],
    date: 'Sun, 29 Nov 2026',
    isoDate: '2026-11-29',
    time: '4:00 PM – 6:30 PM',
    venue: 'Rasoham Cultural Center',
    locality: '28, Murrays Gate Road, Alwarpet',
    city: 'Chennai',
    duration: '2 hr 30 min',
    language: 'Tamil & English',
    price: 999,
    originalPrice: 1250,
    image: '/src/assets/images/event_story_coffee_1794043988015.jpg',
    coverImage: '/src/assets/images/event_story_coffee_1794043988015.jpg',
    audioSampleTitle: 'Kathaipomaa Acoustic Prelude (Tanpura & Coffee Chimes)',
    audioSampleUrl: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
    isSellingFast: true,
    isRecommended: true,
    interestedCount: 34,
    capacity: 45,
    bookedCount: 37,
    tags: ['Chennai', 'Edition10', 'Kathaipomaa', 'Storytelling', 'CoffeeVibes', 'Acoustic'],
    comforts: [
      { id: '1', iconName: 'Coffee', label: 'Refreshments & Filter Coffee Included' },
      { id: '2', iconName: 'QrCode', label: 'Fast QR Check-In' },
      { id: '3', iconName: 'Users', label: 'Intimate Social Mixer' },
      { id: '4', iconName: 'Volume2', label: 'Acoustic Unamplified Warmth' },
      { id: '5', iconName: 'ShieldCheck', label: 'Suitable for All Ages' },
      { id: '6', iconName: 'Home', label: 'Indoor Air-Conditioned Heritage Hall' },
      { id: '7', iconName: 'HeartHandshake', label: 'Family & Solo-Friendly' },
      { id: '8', iconName: 'Car', label: 'Valet Parking Available' }
    ],
    ticketTiers: [
      {
        id: 'tier-std',
        name: 'Story & Coffee Pass',
        price: 999,
        description: 'Single admission, open gallery seating, complimentary single-origin filter coffee & artisanal savory refreshments.',
        perks: ['Single Entry Ticket', 'Unlimited Artisan Filter Coffee', 'Fresh Snack Box', 'Kathaipomaa Bookmark & Postcard'],
        available: 8
      },
      {
        id: 'tier-vip',
        name: 'Front Row Patron & Artist Circle',
        price: 1499,
        description: 'Reserved front-row lounge seating, dedicated Q&A with Kani Thiru, signed literary souvenir notebook.',
        perks: ['Front-Row Armchair Reserved', 'Artist Green-Room Meet & Greet', 'Curated Book Gift Hamper', 'Priority Coffee Service'],
        available: 3
      },
      {
        id: 'tier-student',
        name: 'Student & Youth Pass',
        price: 699,
        description: 'Valid student ID required at entry gate. Full event and refreshment access.',
        perks: ['Student Tier Admission', 'Artisan Coffee & Snacks', 'Student Community Access'],
        available: 4
      }
    ],
    addOns: [
      { id: 'addon-mug', name: 'Kathaipomaa Ceramic Coffee Mug', price: 349, description: 'Handmade stoneware mug with edition emblem.' },
      { id: 'addon-beans', name: 'Estate Roast Coffee Beans (250g)', price: 420, description: 'Signature dark-roast chicory blend served during the narration.' },
      { id: 'addon-tote', name: 'Limited Edition Canvas Book Tote', price: 299, description: 'Eco-friendly tote bag with typography quote.' }
    ],
    uploadedBy: {
      id: 'user-yenok-host',
      name: 'Yenok Kumar',
      email: 'yenok@iktaraa.com',
      role: 'host',
      timestamp: 1793500000000,
    },
    host: {
      id: 'host-kani',
      name: 'Kani Thiru & Kathaipomaa Collective',
      avatar: '/src/assets/images/event_story_coffee_1794043988015.jpg',
      role: 'Storyteller & Cultural Curator',
      bio: 'Award-winning narrator, voice artist, and custodian of contemporary & classic vernacular storytelling across South India.',
      rating: 4.96,
      eventsCount: 14,
      followersCount: 12800,
      verified: true
    },
    faqs: [
      {
        question: 'What is the language of the storytelling?',
        answer: 'The primary narration is delivered in conversational, poetic Tamil. Introductory context, banter, and audience interactions are comfortably bilingual in Tamil and English.'
      },
      {
        question: 'Are there age restrictions?',
        answer: 'Edition 10 is welcoming to teenagers, young adults, and senior citizens alike. Children above 10 years who enjoy listening to spoken narrative are welcome.'
      },
      {
        question: 'What is the refund and cancellation policy?',
        answer: 'You receive a 100% instant refund to your original payment method if cancelled at least 24 hours prior to event start.'
      },
      {
        question: 'Is parking available at Rasoham?',
        answer: 'Yes, dedicated valet parking is available inside the Rasoham campus off Murrays Gate Road.'
      }
    ]
  },
  {
    id: 'iktaraa-sunset-strings',
    title: 'Iktaraa Unplugged: Sitar, Sarod & Spanish Guitar',
    subtitle: 'An East-West Acoustic Dialogue at Golden Hour',
    category: 'Events',
    genre: 'Indie & Classical Fusion',
    tagline: 'World-renowned instrumentalists blending raga improvisations with flamenco picking',
    description:
      'Immerse yourself in acoustic resonance where classical Indian strings intertwine with Iberian nylon rhythms in a natural stone amphitheater.',
    detailedAbout: [
      'Experience the magic of true acoustic resonance with Iktaraa Unplugged.',
      'Our featured trio brings together Ustad Farhan Khan (Sitar), Ananya Roy (Sarod), and Spanish maestro Diego Ramirez (Flamenco Guitar) for an unamplified, sacred musical dialogue.',
      'Designed exclusively for music lovers who appreciate the raw timbral beauty of wood, brass, and gut strings without synthetic digital processing.',
      'Limited to 80 seated attendees. Herbal teas and Kashmiri kahwa served during the interval.'
    ],
    date: 'Sat, 21 Nov 2026',
    isoDate: '2026-11-21',
    time: '5:30 PM – 8:00 PM',
    venue: 'Bangalore International Centre (BIC)',
    locality: '7, 4th Main Road, Domlur II Stage',
    city: 'Bengaluru',
    duration: '2 hr 30 min',
    language: 'Instrumental',
    price: 899,
    originalPrice: 1200,
    image: '/src/assets/images/hero_acoustic_live_1794043985230.jpg',
    coverImage: '/src/assets/images/hero_acoustic_live_1794043985230.jpg',
    audioSampleTitle: 'Sitar & Spanish Nylon Dialogue Excerpt',
    audioSampleUrl: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
    isSellingFast: true,
    isRecommended: true,
    interestedCount: 52,
    capacity: 80,
    bookedCount: 68,
    tags: ['Bengaluru', 'IktaraaSpecials', 'AcousticFusion', 'Sitar', 'Classical'],
    comforts: [
      { id: '1', iconName: 'Volume2', label: 'Treated Auditorium Acoustics' },
      { id: '2', iconName: 'Coffee', label: 'Kashmiri Kahwa & Herbal Infusions' },
      { id: '3', iconName: 'QrCode', label: 'Instant Mobile QR Entry' },
      { id: '4', iconName: 'Car', label: 'BIC Underground Parking' }
    ],
    ticketTiers: [
      {
        id: 'tier-sunset-std',
        name: 'Auditorium Seat',
        price: 899,
        description: 'Standard tiered auditorium seat with optimal sightlines and acoustic dispersion.',
        perks: ['Event Admission', 'Program Booklet', 'Intermission Kahwa'],
        available: 12
      },
      {
        id: 'tier-sunset-patron',
        name: 'Patron Circle',
        price: 1399,
        description: 'Front 3 rows seating + private meet with artists after the concert.',
        perks: ['Front Rows Seating', 'Post-Show Artist Reception', 'Signed Album Vinyl Sleeve'],
        available: 5
      }
    ],
    uploadedBy: {
      id: 'user-yenok-host',
      name: 'Yenok Kumar',
      email: 'yenok@iktaraa.com',
      role: 'host',
      timestamp: 1793600000000,
    },
    host: {
      id: 'host-iktaraa-arts',
      name: 'Iktaraa Foundation for Pure Sound',
      avatar: '/src/assets/images/hero_acoustic_live_1794043985230.jpg',
      role: 'Curatorial Team',
      bio: 'Championing unamplified acoustic music, preserving rare string heritage, and connecting contemporary audiences to masters.',
      rating: 4.98,
      eventsCount: 32,
      followersCount: 24500,
      verified: true
    },
    faqs: [
      {
        question: 'Are children permitted?',
        answer: 'Children 8 years and older are welcome. We kindly request keeping mobile devices silenced during the raga exposition.'
      }
    ]
  },
  {
    id: 'analog-keys-clinic',
    title: 'Casio & Yamaha Stage Piano & Synth Masterclass',
    subtitle: 'Hands-on Sound Design, Voicing & Live Performance',
    category: 'Workshops',
    genre: 'Keys & Audio Tech',
    tagline: 'Unlock synthesis, jazz harmony voicings, and digital stage gear with industry veterans',
    description:
      'A practical 4-hour hands-on masterclass where every participant gets access to a dedicated 88-key weighted workstation and vintage analog synth.',
    detailedAbout: [
      'Step into the state-of-the-art Iktaraa Sound Labs for an immersive deep-dive into keyboard voicing and modern synthesizers.',
      'Led by renowned keyboardist and Berklee educator Samuel Paul, this masterclass demystifies synthesis architecture (LFO, envelopes, cutoff filters) alongside practical neo-soul and contemporary worship jazz voicings.',
      'Instruments provided courtesy of Casio Privia and Yamaha Stage Series. Each desk comes with professional studio monitor headphones.',
      'All attendees receive a certified course certificate and 200+ proprietary MIDI chord presets.'
    ],
    date: 'Sun, 22 Nov 2026',
    isoDate: '2026-11-22',
    time: '10:00 AM – 2:30 PM',
    venue: 'Iktaraa Audio Labs & Studio',
    locality: '100ft Road, Indiranagar',
    city: 'Bengaluru',
    duration: '4 hr 30 min',
    language: 'English',
    price: 1499,
    originalPrice: 2200,
    image: '/src/assets/images/promo_keyboards_synths_1794043985420.jpg',
    coverImage: '/src/assets/images/promo_keyboards_synths_1794043985420.jpg',
    audioSampleTitle: 'Analog Polyphonic Pad Demonstration',
    audioSampleUrl: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
    isSellingFast: false,
    isRecommended: true,
    interestedCount: 29,
    capacity: 20,
    bookedCount: 14,
    tags: ['Workshops', 'Bengaluru', 'Piano', 'Synthesizer', 'AudioTech'],
    comforts: [
      { id: '1', iconName: 'Cpu', label: 'Individual 88-Key Station Provided' },
      { id: '2', iconName: 'Headphones', label: 'Audio-Technica Headphones at Each Desk' },
      { id: '3', iconName: 'Award', label: 'Course Completion Certificate' },
      { id: '4', iconName: 'Coffee', label: 'Lunch & Artisanal Coffee Included' }
    ],
    ticketTiers: [
      {
        id: 'tier-ws-single',
        name: 'Workstation Access Pass',
        price: 1499,
        description: 'Complete hands-on participation with assigned keyboard, lunch, certificate, and MIDI pack.',
        perks: ['Dedicated Workstation', 'Buffet Lunch & Coffee', 'Certificate', 'Preset Pack'],
        available: 6
      }
    ],
    uploadedBy: {
      id: 'user-samuel-host',
      name: 'Samuel Paul (Berklee Fellow)',
      email: 'samuel.paul@soundlabs.in',
      role: 'host',
      timestamp: 1793700000000,
    },
    host: {
      id: 'host-soundlab',
      name: 'Iktaraa Academy of Sound',
      avatar: '/src/assets/images/promo_keyboards_synths_1794043985420.jpg',
      role: 'Music Education Guild',
      bio: 'Equipping musicians and producers with real-world acoustic intuition and modern synthesis mastery.',
      rating: 4.93,
      eventsCount: 18,
      followersCount: 8900,
      verified: true
    },
    faqs: [
      {
        question: 'Do I need prior piano experience?',
        answer: 'Basic familiarity with scales or simple chord shapes is helpful, but beginner-intermediate musicians will find the curriculum structured and approachable.'
      }
    ]
  },
  {
    id: 'kna-pickups-clinic',
    title: 'Acoustic Transducers & KNA Pickups Studio Clinic',
    subtitle: 'Amplifying Violins, Guitars & Folk Instruments Faithfully',
    category: 'Workshops',
    genre: 'Audio Hardware & String Craft',
    tagline: 'Learn how to mount, EQ, and pre-amp wooden string instruments without invasive drilling',
    description:
      'Master the engineering behind wooden piezo pickups and bridge transducers for live gigging, soundboard balance, and high-fidelity stage monitoring.',
    detailedAbout: [
      'Struggling with quack, feedback, or unnatural piezo harshness when playing live violin or acoustic guitar?',
      'In this clinic, certified luthier and touring sound engineer Harish Ramachandran breaks down transducer placement, bridge impedance matching, and pre-amplification signal chains.',
      'Live demonstrations on acoustic violins, flamenco guitars, and cajons with KNA portable wooden pickups.',
      'Attendees can bring their own instruments for a free inspection and customized pickup fitment advice.'
    ],
    date: 'Fri, 4 Dec 2026',
    isoDate: '2026-12-04',
    time: '5:00 PM – 8:00 PM',
    venue: 'Symphony Acoustic Atelier',
    locality: 'Bandra West, Near Pali Hill',
    city: 'Mumbai',
    duration: '3 hr',
    language: 'English & Hindi',
    price: 649,
    originalPrice: 950,
    image: '/src/assets/images/promo_sound_pickups_1794043989428.jpg',
    coverImage: '/src/assets/images/promo_sound_pickups_1794043989428.jpg',
    audioSampleTitle: 'Violin Bridge Piezo Clarity Test',
    audioSampleUrl: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
    isSellingFast: true,
    isRecommended: false,
    interestedCount: 22,
    capacity: 35,
    bookedCount: 29,
    tags: ['Mumbai', 'Workshops', 'Violin', 'Guitar', 'GearClinic'],
    comforts: [
      { id: '1', iconName: 'Tool', label: 'Free Luthier Instrument Inspection' },
      { id: '2', iconName: 'Tag', label: 'Exclusive 20% Discount on KNA Pickups' },
      { id: '3', iconName: 'Coffee', label: 'Evening Chai & Snacks' }
    ],
    ticketTiers: [
      {
        id: 'tier-clinic-entry',
        name: 'Clinic Entry + Luthier Checkup',
        price: 649,
        description: 'Admission, workshop notes, instrument inspection slot, and tea.',
        perks: ['Workshop Admission', 'Free Instrument Sound Check', '20% Gear Voucher'],
        available: 6
      }
    ],
    uploadedBy: {
      id: 'user-harish-host',
      name: 'Harish Ramachandran (Luthier)',
      email: 'harish.luthier@iktaraa.com',
      role: 'host',
      timestamp: 1793750000000,
    },
    host: {
      id: 'host-harish',
      name: 'Harish Ramachandran (Luthier)',
      avatar: '/src/assets/images/promo_sound_pickups_1794043989428.jpg',
      role: 'Master Luthier & Audio Consultant',
      bio: 'Crafting and servicing classical string instruments for over 22 years across Mumbai and Chennai concert halls.',
      rating: 4.95,
      eventsCount: 9,
      followersCount: 6400,
      verified: true
    },
    faqs: [
      {
        question: 'Can I bring my own instrument?',
        answer: 'Yes! You are encouraged to bring your violin, cello, acoustic guitar, or ukulele.'
      }
    ]
  },
  {
    id: 'chamber-strings-delhi',
    title: 'Hindustani & Carnatic Chamber Strings Collective',
    subtitle: 'Score & String Chamber Ensemble Showcase',
    category: 'Events',
    genre: 'Classical & Fusion',
    tagline: 'Ten virtuosos playing violins, cellos, sarangi, and acoustic upright bass in harmony',
    description:
      'A sublime orchestral tribute to traditional ragas arranged in polyphonic chamber harmony. An enchanting acoustic sanctuary in the heart of Delhi.',
    detailedAbout: [
      'The Iktaraa Chamber Strings Collective unites award-winning violinists, cellists, and classical percussionists in an unforgettable auditory journey.',
      'The ensemble will present original arrangements of historic thumris, varnams, and modern symphonic compositions.',
      'Held under the vaulted ceilings of the historic Alliance Française gallery, where natural reverb brings out every microtonal nuance.'
    ],
    date: 'Sun, 6 Dec 2026',
    isoDate: '2026-12-06',
    time: '6:30 PM – 9:00 PM',
    venue: 'Alliance Française Auditorium',
    locality: '72, Lodhi Estate, Max Mueller Marg',
    city: 'Delhi-NCR',
    duration: '2 hr 30 min',
    language: 'Instrumental',
    price: 750,
    originalPrice: 1000,
    image: '/src/assets/images/promo_instruments_studio_1794043985261.jpg',
    coverImage: '/src/assets/images/promo_instruments_studio_1794043985261.jpg',
    audioSampleTitle: 'Chamber Violin Harmony Movement',
    audioSampleUrl: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
    isSellingFast: false,
    isRecommended: true,
    interestedCount: 41,
    capacity: 120,
    bookedCount: 88,
    tags: ['Delhi', 'Classical', 'Violin', 'Orchestra', 'ChamberMusic'],
    comforts: [
      { id: '1', iconName: 'Volume2', label: 'Cathedral Acoustic Reverb' },
      { id: '2', iconName: 'Home', label: 'Heated Winter Auditorium' },
      { id: '3', iconName: 'ShieldCheck', label: 'All Ages Welcome' }
    ],
    ticketTiers: [
      {
        id: 'tier-chamber-gen',
        name: 'General Gallery',
        price: 750,
        description: 'Standard tiered gallery seat.',
        perks: ['Concert Pass', 'Souvenir Program Sheet'],
        available: 22
      },
      {
        id: 'tier-chamber-prem',
        name: 'Center Circle Premium',
        price: 1200,
        description: 'Prime center acoustic zone for maximum harmonic clarity.',
        perks: ['Center Seating', 'Program Booklet', 'Reserved Row'],
        available: 10
      }
    ],
    uploadedBy: {
      id: 'user-delhi-curator',
      name: 'Delhi Classical Guild',
      email: 'curator@delhiclassical.org',
      role: 'host',
      timestamp: 1793800000000,
    },
    host: {
      id: 'host-delhi-strings',
      name: 'Delhi Classical Guild',
      avatar: '/src/assets/images/promo_instruments_studio_1794043985261.jpg',
      role: 'Arts Organization',
      bio: 'Bringing classical heritage to new generation acoustic listeners in historic venues.',
      rating: 4.88,
      eventsCount: 26,
      followersCount: 15400,
      verified: true
    },
    faqs: []
  },
  {
    id: 'studio-recording-jam',
    title: 'Live-in-the-Studio Acoustic Sessions & Open Jam',
    subtitle: 'Direct-to-Tape Multi-track Session with Audience',
    category: 'Music Studio',
    genre: 'Indie Pop & Live Jam',
    tagline: 'Be part of the live audience and interactive backing chorus for an authentic vinyl recording',
    description:
      'Step behind the glass into a legendary analogue recording facility. Watch 4 rising indie singer-songwriters track live direct to 2-inch tape, followed by a collaborative jam.',
    detailedAbout: [
      'Have you ever wondered what happens inside a world-class sound control room when a hit record is made?',
      'Iktaraa Sound Sanctuary opens its studio doors for an exclusive 25-person live-in-the-studio listening and jamming session.',
      'Hear playback directly through studio master monitors, ask the producers questions, and join the acoustic open mic circle during the final hour.'
    ],
    date: 'Sat, 12 Dec 2026',
    isoDate: '2026-12-12',
    time: '4:00 PM – 8:00 PM',
    venue: 'Sanctuary Soundstage Studios',
    locality: 'Road No. 45, Jubilee Hills',
    city: 'Hyderabad',
    duration: '4 hr',
    language: 'Telugu, Hindi & English',
    price: 1199,
    originalPrice: 1600,
    image: '/src/assets/images/hero_acoustic_live_1794043985230.jpg',
    coverImage: '/src/assets/images/hero_acoustic_live_1794043985230.jpg',
    audioSampleTitle: 'Direct-to-Tape Neve Console Outtake',
    audioSampleUrl: 'https://cdn.freesound.org/previews/415/415729_5121236-lq.mp3',
    isSellingFast: true,
    isRecommended: true,
    interestedCount: 38,
    capacity: 25,
    bookedCount: 21,
    tags: ['Hyderabad', 'MusicStudio', 'Indie', 'LiveJam', 'Recording'],
    comforts: [
      { id: '1', iconName: 'Headphones', label: 'Studio Monitor Direct Feed' },
      { id: '2', iconName: 'Mic', label: 'Participate in Open Mic Session' },
      { id: '3', iconName: 'Coffee', label: 'Studio Artisanal Refreshments' }
    ],
    ticketTiers: [
      {
        id: 'tier-studio-pass',
        name: 'Studio Audience & Jam Pass',
        price: 1199,
        description: 'Complete 4-hour studio access, headphones feed, and jam participation.',
        perks: ['Live Tracking Access', 'High-Res Audio Download of Session', 'Evening Snacks'],
        available: 4
      }
    ],
    uploadedBy: {
      id: 'user-sanctuary-rep',
      name: 'Sanctuary Sound Team',
      email: 'studio@sanctuarysounds.in',
      role: 'host',
      timestamp: 1793850000000,
    },
    host: {
      id: 'host-sanctuary',
      name: 'Sanctuary Sound Labs',
      avatar: '/src/assets/images/hero_acoustic_live_1794043985230.jpg',
      role: 'Analog Recording Studio',
      bio: 'Hyderabad premier acoustic live tracking studio, recording indie artists with vintage Neve consoles and warm tube mics.',
      rating: 4.97,
      eventsCount: 21,
      followersCount: 19300,
      verified: true
    },
    faqs: []
  }
];

export const HERO_PROMOS: HeroPromoCard[] = [
  {
    id: 'promo-tcl-books',
    title: 'TCL BOOKS',
    highlightText: 'at Flat 15% Off',
    subtitle: 'Your Next Music Chapter Starts Here.',
    validity: 'May 15 to Jun 15 only',
    ctaText: 'EXPLORE MORE',
    actionType: 'promo',
    promoCode: 'TCL15OFF',
    discountBadge: 'Flat 15% OFF',
    image: '/src/assets/images/promo_instruments_studio_1794043985261.jpg',
    category: 'promotions',
    bgGradient: 'from-[#231E59] via-[#1c1847] to-[#23A2B3]'
  },
  {
    id: 'promo-kna-pickups',
    title: 'Violin & Guitar Pickups',
    highlightText: 'KNA Precision Transducers',
    subtitle: 'Natural acoustic tone with zero drilling or modification.',
    validity: 'Limited stocks available',
    ctaText: 'View More',
    actionType: 'event',
    targetEventId: 'kna-pickups-clinic',
    discountBadge: 'Special Edition',
    brandName: 'kna pickups',
    image: '/src/assets/images/promo_sound_pickups_1794043989428.jpg',
    category: 'promotions'
  },
  {
    id: 'promo-yamaha-keyboards',
    title: 'Portable Keyboards, Guitars',
    highlightText: 'Yamaha Stage Series',
    subtitle: 'Touch-sensitive weighted keys & pure CFX grand samples.',
    validity: 'Free bench & stand included',
    ctaText: 'View More',
    actionType: 'event',
    targetEventId: 'analog-keys-clinic',
    brandName: 'YAMAHA',
    image: '/src/assets/images/promo_keyboards_synths_1794043985420.jpg',
    category: 'promotions'
  },
  {
    id: 'promo-score-instruments',
    title: 'Guitars, Violins, Trumpets, Accessories',
    highlightText: 'Handcrafted Orchestral Line',
    subtitle: 'Seasoned tone woods crafted for concert acoustics.',
    validity: 'Free protective hardshell case',
    ctaText: 'View More',
    actionType: 'link',
    targetUrl: 'https://www.iktaraa.com/event/',
    discountBadge: 'SCORE',
    image: '/src/assets/images/promo_instruments_studio_1794043985261.jpg',
    category: 'promotions'
  },
  {
    id: 'promo-casio-pianos',
    title: 'Keyboard, Digital Piano',
    highlightText: 'Casio Privia & StagePro',
    subtitle: 'Smart hybrid hammer action with Bluetooth wireless audio.',
    validity: '3-Year Warranty & Free Tuition',
    ctaText: 'View More',
    actionType: 'link',
    targetUrl: 'https://www.iktaraa.com/webinar/',
    brandName: 'CASIO',
    image: '/src/assets/images/promo_keyboards_synths_1794043985420.jpg',
    category: 'promotions'
  },

  // Trending Events Tab Cards
  {
    id: 'trending-kathaipomaa',
    title: 'கதைப்போமா? Edition 10',
    highlightText: 'Stories & Filter Coffee',
    subtitle: 'The celebrated storytelling evening in Alwarpet, Chennai.',
    validity: 'Sun, 29 Nov 2026 · Selling Out Fast',
    ctaText: 'Book Now',
    actionType: 'event',
    targetEventId: 'kathaipomaa-10',
    discountBadge: 'Trending #1',
    image: '/src/assets/images/event_story_coffee_1794043988015.jpg',
    category: 'trending'
  },
  {
    id: 'trending-sunset-sitar',
    title: 'Iktaraa Unplugged: Sunset Strings',
    highlightText: 'Acoustic Fusion at BIC',
    subtitle: 'Sitar, Sarod & Flamenco Guitar in natural stone acoustics.',
    validity: 'Sat, 21 Nov 2026 · Bengaluru',
    ctaText: 'Reserve Seats',
    actionType: 'event',
    targetEventId: 'iktaraa-sunset-strings',
    discountBadge: 'Critically Acclaimed',
    image: '/src/assets/images/hero_acoustic_live_1794043985230.jpg',
    category: 'trending'
  },

  // Iktaraa Specials Tab Cards
  {
    id: 'special-unplugged-sessions',
    title: 'Iktaraa Acoustic Sanctuary',
    highlightText: 'Zero Microphones. Pure Resonance.',
    subtitle: 'Curated intimate sessions in historic heritage venues.',
    validity: 'Member Early Access Open',
    ctaText: 'Explore Series',
    actionType: 'event',
    targetEventId: 'iktaraa-sunset-strings',
    discountBadge: 'Iktaraa Original',
    image: '/src/assets/images/hero_acoustic_live_1794043985230.jpg',
    category: 'specials'
  },
  {
    id: 'special-studio-sessions',
    title: 'Sanctuary Direct-to-Tape',
    highlightText: 'Analog Studio Residency',
    subtitle: 'Watch master recordings happen live and jam with the artists.',
    validity: 'Strictly 25 seats only',
    ctaText: 'View Studio Pass',
    actionType: 'event',
    targetEventId: 'studio-recording-jam',
    discountBadge: 'Exclusive Access',
    image: '/src/assets/images/promo_keyboards_synths_1794043985420.jpg',
    category: 'specials'
  }
];

export const INITIAL_USER_BOOKINGS: BookingRecord[] = [
  {
    id: 'IKT-2026-7841',
    eventId: 'kathaipomaa-10',
    eventTitle: 'Kathaipomaa? Edition 10 — Stories & Coffee',
    nativeTitle: 'கதைப்போமா? | Kathaipomaa? Edition 10',
    eventDate: 'Sun, 29 Nov 2026',
    eventTime: '4:00 PM – 6:30 PM',
    venue: 'Rasoham Cultural Center, Alwarpet',
    city: 'Chennai',
    image: '/src/assets/images/event_story_coffee_1794043988015.jpg',
    tierId: 'tier-std',
    tierName: 'Story & Coffee Pass',
    unitPrice: 999,
    quantity: 2,
    addOnsTotal: 349,
    selectedAddOns: ['Kathaipomaa Ceramic Coffee Mug'],
    convenienceFee: 70,
    totalAmount: 2417,
    customerName: 'Yenok Kumar',
    customerEmail: 'yenok@iktaraa.com',
    customerPhone: '+91 98401 23456',
    paymentMethod: 'UPI',
    paymentId: 'pay_UPI_984201772',
    bookingTimestamp: 1794030000000,
    status: 'confirmed',
    qrCodeSeed: 'IKT-KATHAIPOMAA-ED10-TKT7841'
  }
];
