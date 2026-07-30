// All site text lives here in both languages. The `en` object defines the
// shape; `sw` must provide the same keys, so TypeScript catches any missing
// translation.

const en = {
  nav: {
    home: 'Home',
    about: 'About Us',
    services: 'Services',
    projects: 'Our Work',
    team: 'Our Team',
    contact: 'Contact',
    getQuote: 'Get a Quote',
  },

  footer: {
    blurb:
      'Professional electrical installations and engineering for residential, commercial and industrial projects across Tanzania — done safely, on time and to standard.',
    quickLinks: 'Quick Links',
    contactUs: 'Contact Us',
    whatsappUs: 'WhatsApp Us',
    rights: 'All Rights Reserved.',
  },

  home: {
    heroBadge: 'Certified Electrical Contractors \u2022 Tanzania',
    heroTitle: { pre: 'Every great building deserves ', accent: 'flawless power' },
    heroLead:
      'Kilele Electricals wires Tanzania\u2019s homes, high-rises and industries — from the first conduit in the slab to the final flip of the switch.',
    heroBtnQuote: 'Get a Free Quote',
    heroBtnWork: 'See Our Work',

    stats: ['Projects Delivered', 'Skilled Technicians', 'Safety-First Culture', 'Client Support'],

    svcKicker: 'What We Do',
    svcTitle: { pre: 'Complete electrical services, ', accent: 'one trusted team' },
    svcLead:
      'Whatever the size of your project, we handle the full electrical scope from design to commissioning.',
    services: [
      {
        title: 'Electrical Installations',
        text: 'Complete wiring for residential, commercial and industrial buildings — from first fix to final testing.',
      },
      {
        title: 'Conduit & Slab Piping',
        text: 'Precise conduit routing laid in slabs and walls during construction, keeping every cable protected and serviceable.',
      },
      {
        title: 'Distribution Boards',
        text: 'Design, installation and termination of distribution boards, switchgear and protection systems.',
      },
      {
        title: 'Power Systems',
        text: 'Reliable site power, metering and load management for construction projects and completed facilities.',
      },
      {
        title: 'Maintenance & Repairs',
        text: 'Fault-finding, upgrades and preventive maintenance that keep your building powered without surprises.',
      },
      {
        title: 'Site Safety Compliance',
        text: 'Every job is executed by certified, fully-equipped technicians following strict safety procedures.',
      },
    ],
    exploreServices: 'Explore All Services',

    whyKicker: 'Why Kilele',
    whyTitle: { pre: 'The team contractors ', accent: 'call back' },
    whyLead:
      'We treat every building like our own — that is why site managers and homeowners keep choosing Kilele Electricals.',
    why: [
      {
        title: 'Certified & experienced crew',
        text: 'Our technicians are trained, badged and experienced across large construction sites and finished buildings.',
      },
      {
        title: 'Safety before speed',
        text: '\u201cTunafika Kileleni Kwa Usalama\u201d — we reach the top safely. Full PPE, safe procedures and clean handovers on every project.',
      },
      {
        title: 'Built to standard',
        text: 'Installations that pass inspection the first time, using quality-approved materials and workmanship.',
      },
      {
        title: 'On time, on budget',
        text: 'We coordinate closely with contractors and owners so the electrical scope never delays your programme.',
      },
    ],

    workKicker: 'Recent Work',
    workTitle: { pre: 'Straight from ', accent: 'our sites' },
    workLead: 'Real photos from real projects — no stock images, just our crew doing the work.',
    viewGallery: 'View Full Gallery',

    ctaBadges: ['Certified Technicians', 'Full PPE & Safety Compliance', 'On-Time Delivery'],
    ctaTitle: 'Have a project that needs power?',
    ctaLead:
      'Tell us about your building or site and we will respond with a clear, honest quotation — usually within 24 hours.',
    ctaBtn: 'Talk to Us Today',
  },

  about: {
    heroKicker: 'About Us',
    heroTitle: { pre: 'The people behind ', accent: 'the power' },
    heroLead:
      'Kilele Electricals is a Tanzanian electrical installations company built around one promise — we reach the top safely.',

    storyKicker: 'Our Story',
    storyTitle: { pre: 'Grown on real sites, ', accent: 'proven on real projects' },
    storyParas: [
      'Kilele Electricals started on the construction sites of Tanzania, where our founders learned the trade the hard way — laying conduits in fresh slabs, pulling cables through busy buildings and terminating boards under real deadlines.',
      'Today we are a full electrical installations team serving homeowners, contractors and businesses. Our crews handle everything from first-fix wiring during construction to distribution boards, site power and maintenance of finished buildings.',
      'What has not changed is how we work: certified technicians, proper safety gear, clean workmanship and honest communication from quotation to handover.',
    ],
    sloganExplain:
      'Our slogan means \u201cWe reach the top safely\u201d — the peak (kilele) stands for both the heights we work at and the standard we hold ourselves to.',

    valuesKicker: 'Our Values',
    valuesTitle: { pre: 'What we ', accent: 'stand on' },
    valuesLead: 'Three principles guide every cable we pull and every board we terminate.',
    values: [
      {
        title: 'Safety First',
        text: 'No shortcut is worth an injury. Full PPE, safe isolation and disciplined site procedures on every single job.',
      },
      {
        title: 'Integrity',
        text: 'Honest quotations, quality-approved materials and workmanship we are proud to sign our name under.',
      },
      {
        title: 'Craftsmanship',
        text: 'Clean conduit runs, tidy boards and installations that pass inspection the first time — every time.',
      },
    ],

    teamKicker: 'Our Team',
    teamTitle: { pre: 'Meet ', accent: 'the crew' },
    teamLead:
      'Certified, experienced and proud of their work — these are the people who will show up on your site.',
    teamRoles: [
      'Founder & Director',
      'Site Supervisor',
      'Senior Electrical Technician',
      'Electrical Technician',
      'Electrical Technician',
      'Electrical Technician',
    ],

    cultureKicker: 'Team Life',
    cultureTitle: { pre: 'One crew, ', accent: 'one journey' },
    cultureLead:
      'Wherever the project takes us — across the city or across the water — we move as one team.',
    workWithUs: 'Work With Us',
  },

  services: {
    heroKicker: 'Our Services',
    heroTitle: { pre: 'Everything electrical, ', accent: 'done properly' },
    heroLead:
      'From the first conduit in the slab to the final test at handover — one team, full accountability.',
    serviceLabel: 'Service',
    items: [
      {
        title: 'Electrical Installations & Wiring',
        text: 'Complete first-fix and second-fix wiring for residential houses, apartments, offices and commercial buildings — designed for safety, capacity and future expansion.',
        points: [
          'Full house and building wiring',
          'Lighting circuits and LED installations',
          'Socket outlets, switches and accessories',
          'Testing, inspection and certification support',
        ],
      },
      {
        title: 'Conduit & Slab Piping',
        text: 'Our specialty on construction sites: laying PVC electrical conduits inside slabs, columns and walls before concrete is poured, so every cable stays protected and replaceable.',
        points: [
          'Slab and column conduit routing',
          'Coordination with steel-fixers and casting crews',
          'Draw boxes and junction planning',
          'Neat, inspection-ready layouts',
        ],
      },
      {
        title: 'Distribution Boards & Switchgear',
        text: 'Supply, installation and termination of distribution boards, busbars, breakers and fuse links — the heart of a safe electrical system.',
        points: [
          'Main and sub-distribution boards',
          'Busbar and fuse-link termination',
          'Circuit labelling and load balancing',
          'Earthing and protection systems',
        ],
      },
      {
        title: 'Site Power & Metering',
        text: 'Temporary and permanent power solutions for construction sites and completed facilities, including metering and load management.',
        points: [
          'Temporary site power setups',
          'Utility connection coordination',
          'Metering and sub-metering',
          'Load assessment and upgrades',
        ],
      },
      {
        title: 'Maintenance, Repairs & Upgrades',
        text: 'Fast fault-finding and honest repairs for homes and businesses — plus planned maintenance that prevents problems before they cost you.',
        points: [
          'Fault diagnosis and emergency repairs',
          'Rewiring of old or unsafe installations',
          'Preventive maintenance contracts',
          'Energy-saving upgrades',
        ],
      },
    ],

    stepsKicker: 'How We Work',
    stepsTitle: { pre: 'Simple process, ', accent: 'zero surprises' },
    stepsLead: 'Four clear steps from your first call to a fully powered, tested installation.',
    steps: [
      {
        title: 'Site Visit & Survey',
        text: 'We visit your site or review your drawings to understand the full electrical scope.',
      },
      {
        title: 'Clear Quotation',
        text: 'You receive an itemised, honest quotation — materials, labour and timeline.',
      },
      {
        title: 'Safe Execution',
        text: 'Our certified crew executes the works with full PPE and daily progress updates.',
      },
      {
        title: 'Testing & Handover',
        text: 'Every circuit is tested and documented before we hand over a clean, working system.',
      },
    ],
    requestQuote: 'Request a Quotation',
  },

  projects: {
    heroKicker: 'Our Work',
    heroTitle: { pre: 'Proof, not promises — ', accent: 'from our sites' },
    heroLead:
      'Every photo below was taken by our own crew on real projects. This is the standard you can expect on yours.',
    filters: {
      all: 'All',
      conduit: 'Conduit Works',
      site: 'On Site',
      install: 'Installations',
      team: 'Our Team',
    },
    captions: [
      'Slab conduit routing before casting',
      'Distribution board termination',
      'Measurement and setting-out on the deck',
      'Preparing PVC conduits for the slab',
      'The crew between tasks',
      'Indoor wiring and cable management',
      'Coordinating with the steel-fixing crew',
      'Conduit network taking shape',
      'Fuse links and protection gear',
      'Ready for the day\u2019s work',
      'Working the reinforcement deck',
      'Switchgear installation in progress',
      'Conduits positioned across the deck',
      'Focused before the pour',
      'Progress on a commercial project',
      'External wiring works',
      'Slab piping, inspection-ready',
      'One crew, one standard',
      'High-rise deck works',
      'Travelling to the next project',
    ],
    ctaLead: 'Want your project to look like this? Let\u2019s talk.',
    ctaBtn: 'Start Your Project',
  },

  contact: {
    heroKicker: 'Contact Us',
    heroTitle: { pre: 'Let\u2019s power ', accent: 'your project' },
    heroLead:
      'Tell us what you are building or fixing — we usually respond with a quotation within 24 hours.',
    callUs: 'Call Us',
    whatsapp: 'WhatsApp',
    whatsappSub: 'Chat with us directly',
    email: 'Email',
    location: 'Location',
    formTitle: 'Request a Quotation',
    formSub: 'Fill in the details below and send it straight to our team via WhatsApp or email.',
    nameLabel: 'Your Name',
    namePlaceholder: 'e.g. John Michael',
    phoneLabel: 'Phone Number',
    phonePlaceholder: 'e.g. +255 7XX XXX XXX',
    serviceLabel: 'Service Needed',
    serviceOptions: [
      'Electrical Installation / Wiring',
      'Conduit & Slab Piping',
      'Distribution Boards & Switchgear',
      'Site Power & Metering',
      'Maintenance & Repairs',
      'Other',
    ],
    messageLabel: 'Project Details',
    messagePlaceholder:
      'Describe your project — location, building type, what you need done...',
    sendWhatsApp: 'Send via WhatsApp',
    sendEmail: 'Send by Email',
  },
};

const sw: Translations = {
  nav: {
    home: 'Mwanzo',
    about: 'Kuhusu Sisi',
    services: 'Huduma',
    projects: 'Kazi Zetu',
    team: 'Timu Yetu',
    contact: 'Wasiliana Nasi',
    getQuote: 'Omba Bei',
  },

  footer: {
    blurb:
      'Ufungaji wa umeme wa kitaalamu na uhandisi kwa miradi ya makazi, biashara na viwanda kote Tanzania — kwa usalama, kwa wakati na kwa viwango.',
    quickLinks: 'Viungo vya Haraka',
    contactUs: 'Wasiliana Nasi',
    whatsappUs: 'Tuandikie WhatsApp',
    rights: 'Haki Zote Zimehifadhiwa.',
  },

  home: {
    heroBadge: 'Wakandarasi wa Umeme Waliothibitishwa \u2022 Tanzania',
    heroTitle: { pre: 'Kila jengo bora linastahili ', accent: 'umeme usio na dosari' },
    heroLead:
      'Kilele Electricals inafunga umeme kwenye nyumba, maghorofa na viwanda vya Tanzania — kuanzia bomba la kwanza kwenye slabu hadi kuwasha swichi ya mwisho.',
    heroBtnQuote: 'Omba Bei Bure',
    heroBtnWork: 'Ona Kazi Zetu',

    stats: ['Miradi Iliyokamilika', 'Mafundi Wenye Ujuzi', 'Usalama Kwanza', 'Huduma kwa Wateja'],

    svcKicker: 'Tunachofanya',
    svcTitle: { pre: 'Huduma kamili za umeme, ', accent: 'timu moja ya kuaminika' },
    svcLead:
      'Hata mradi wako ni mkubwa kiasi gani, tunashughulikia kazi zote za umeme kuanzia usanifu hadi ukamilishaji.',
    services: [
      {
        title: 'Ufungaji wa Umeme',
        text: 'Wiring kamili kwa nyumba, majengo ya biashara na viwanda — kuanzia hatua ya kwanza hadi upimaji wa mwisho.',
      },
      {
        title: 'Mabomba ya Umeme kwenye Slabu',
        text: 'Upangaji sahihi wa mabomba ndani ya slabu na kuta wakati wa ujenzi, kulinda kila waya na kurahisisha matengenezo.',
      },
      {
        title: 'Bodi za Kugawa Umeme',
        text: 'Usanifu, ufungaji na uunganishaji wa bodi za umeme, switchgear na mifumo ya ulinzi.',
      },
      {
        title: 'Mifumo ya Nguvu za Umeme',
        text: 'Umeme wa uhakika kwa maeneo ya ujenzi, mita na usimamizi wa matumizi kwa miradi na majengo yaliyokamilika.',
      },
      {
        title: 'Matengenezo na Ukarabati',
        text: 'Kutafuta hitilafu, kuboresha na matengenezo ya kuzuia yanayohakikisha jengo lako halikosi umeme.',
      },
      {
        title: 'Uzingatiaji wa Usalama Kazini',
        text: 'Kila kazi inafanywa na mafundi wenye vyeti na vifaa kamili, wakifuata taratibu kali za usalama.',
      },
    ],
    exploreServices: 'Angalia Huduma Zote',

    whyKicker: 'Kwa Nini Kilele',
    whyTitle: { pre: 'Timu ambayo makandarasi ', accent: 'huirudia tena' },
    whyLead:
      'Tunalitunza kila jengo kama letu — ndiyo maana wasimamizi wa miradi na wenye nyumba wanaendelea kuchagua Kilele Electricals.',
    why: [
      {
        title: 'Mafundi wenye vyeti na uzoefu',
        text: 'Mafundi wetu wamefunzwa, wana vitambulisho na uzoefu wa maeneo makubwa ya ujenzi na majengo yaliyokamilika.',
      },
      {
        title: 'Usalama kabla ya kasi',
        text: '\u201cTunafika Kileleni Kwa Usalama\u201d — vifaa kamili vya kujikinga, taratibu salama na makabidhiano safi katika kila mradi.',
      },
      {
        title: 'Kazi kwa viwango',
        text: 'Ufungaji unaopita ukaguzi mara ya kwanza, kwa vifaa vilivyoidhinishwa na ufundi wa hali ya juu.',
      },
      {
        title: 'Kwa wakati, kwa bajeti',
        text: 'Tunashirikiana kwa karibu na makandarasi na wamiliki ili kazi za umeme zisichelewesha mradi wako.',
      },
    ],

    workKicker: 'Kazi za Hivi Karibuni',
    workTitle: { pre: 'Moja kwa moja ', accent: 'kutoka maeneo yetu ya kazi' },
    workLead:
      'Picha halisi kutoka miradi halisi — hakuna picha za kuazima, ni timu yetu ikifanya kazi.',
    viewGallery: 'Tazama Picha Zote',

    ctaBadges: ['Mafundi Wenye Vyeti', 'Vifaa Kamili vya Usalama', 'Ukamilishaji kwa Wakati'],
    ctaTitle: 'Una mradi unaohitaji umeme?',
    ctaLead:
      'Tuambie kuhusu jengo au eneo lako la kazi, nasi tutakujibu na bei ya wazi na ya uaminifu — mara nyingi ndani ya saa 24.',
    ctaBtn: 'Wasiliana Nasi Leo',
  },

  about: {
    heroKicker: 'Kuhusu Sisi',
    heroTitle: { pre: 'Watu walio nyuma ya ', accent: 'umeme' },
    heroLead:
      'Kilele Electricals ni kampuni ya Kitanzania ya ufungaji wa umeme iliyojengwa juu ya ahadi moja — tunafika kileleni kwa usalama.',

    storyKicker: 'Historia Yetu',
    storyTitle: { pre: 'Tumekulia kwenye maeneo halisi, ', accent: 'tumethibitika kwenye miradi halisi' },
    storyParas: [
      'Kilele Electricals ilianzia kwenye maeneo ya ujenzi ya Tanzania, ambako waanzilishi wetu walijifunza fani hii kwa vitendo — kuweka mabomba kwenye slabu mpya, kuvuta nyaya kwenye majengo yenye shughuli nyingi na kuunganisha bodi za umeme chini ya muda halisi wa kazi.',
      'Leo hii sisi ni timu kamili ya ufungaji wa umeme inayohudumia wenye nyumba, makandarasi na biashara. Timu zetu zinashughulikia kila kitu — kuanzia wiring wa awali wakati wa ujenzi hadi bodi za kugawa umeme, umeme wa eneo la kazi na matengenezo ya majengo yaliyokamilika.',
      'Kilichobaki vilevile ni jinsi tunavyofanya kazi: mafundi wenye vyeti, vifaa sahihi vya usalama, ufundi safi na mawasiliano ya uwazi kuanzia bei hadi makabidhiano.',
    ],
    sloganExplain:
      'Kauli mbiu yetu inamaanisha kufika juu kabisa kwa usalama — kilele kinawakilisha urefu tunaofanyia kazi na kiwango tunachojiwekea.',

    valuesKicker: 'Maadili Yetu',
    valuesTitle: { pre: 'Misingi ', accent: 'tunayosimamia' },
    valuesLead: 'Kanuni tatu zinaongoza kila waya tunaovuta na kila bodi tunayounganisha.',
    values: [
      {
        title: 'Usalama Kwanza',
        text: 'Hakuna njia ya mkato inayostahili jeraha. Vifaa kamili vya kujikinga na taratibu za nidhamu kwenye kila kazi.',
      },
      {
        title: 'Uadilifu',
        text: 'Bei za uwazi, vifaa vilivyoidhinishwa na kazi tunazojivunia kuweka jina letu.',
      },
      {
        title: 'Ufundi Bora',
        text: 'Mabomba yaliyonyooka, bodi safi na ufungaji unaopita ukaguzi mara ya kwanza — kila mara.',
      },
    ],

    teamKicker: 'Timu Yetu',
    teamTitle: { pre: 'Kutana na ', accent: 'timu yetu' },
    teamLead:
      'Wenye vyeti, uzoefu na wanaojivunia kazi yao — hawa ndio watu watakaofika kwenye eneo lako la kazi.',
    teamRoles: [
      'Mwanzilishi na Mkurugenzi',
      'Msimamizi wa Kazi',
      'Fundi Mkuu wa Umeme',
      'Fundi wa Umeme',
      'Fundi wa Umeme',
      'Fundi wa Umeme',
    ],

    cultureKicker: 'Maisha ya Timu',
    cultureTitle: { pre: 'Timu moja, ', accent: 'safari moja' },
    cultureLead:
      'Popote mradi unapotupeleka — mjini au ng\u2019ambo ya maji — tunasonga kama timu moja.',
    workWithUs: 'Fanya Kazi Nasi',
  },

  services: {
    heroKicker: 'Huduma Zetu',
    heroTitle: { pre: 'Kila kitu cha umeme, ', accent: 'kikifanywa ipasavyo' },
    heroLead:
      'Kuanzia bomba la kwanza kwenye slabu hadi upimaji wa mwisho wakati wa makabidhiano — timu moja, uwajibikaji kamili.',
    serviceLabel: 'Huduma',
    items: [
      {
        title: 'Ufungaji wa Umeme na Wiring',
        text: 'Wiring kamili wa hatua ya kwanza na ya pili kwa nyumba, apartments, ofisi na majengo ya biashara — kwa usalama, uwezo wa kutosha na upanuzi wa baadaye.',
        points: [
          'Wiring kamili wa nyumba na majengo',
          'Mizunguko ya taa na ufungaji wa LED',
          'Soketi, swichi na vifaa vingine',
          'Upimaji, ukaguzi na msaada wa vyeti',
        ],
      },
      {
        title: 'Mabomba ya Umeme kwenye Slabu',
        text: 'Utaalamu wetu kwenye maeneo ya ujenzi: kuweka mabomba ya PVC ndani ya slabu, nguzo na kuta kabla zege halijamwagwa, ili kila waya ubaki salama na uweze kubadilishwa.',
        points: [
          'Upangaji wa mabomba kwenye slabu na nguzo',
          'Ushirikiano na mafundi chuma na timu za kumwaga zege',
          'Upangaji wa draw boxes na junctions',
          'Mipangilio safi iliyo tayari kwa ukaguzi',
        ],
      },
      {
        title: 'Bodi za Kugawa Umeme na Switchgear',
        text: 'Ununuzi, ufungaji na uunganishaji wa bodi za umeme, busbars, breakers na fuse links — moyo wa mfumo salama wa umeme.',
        points: [
          'Bodi kuu na bodi ndogo za kugawa umeme',
          'Uunganishaji wa busbar na fuse-link',
          'Uwekaji wa lebo na usawazishaji wa mizigo',
          'Mifumo ya earthing na ulinzi',
        ],
      },
      {
        title: 'Umeme wa Eneo la Kazi na Mita',
        text: 'Suluhisho la umeme wa muda na wa kudumu kwa maeneo ya ujenzi na majengo yaliyokamilika, ikiwemo mita na usimamizi wa matumizi.',
        points: [
          'Umeme wa muda kwa maeneo ya ujenzi',
          'Uratibu wa kuunganishwa na shirika la umeme',
          'Mita na mita ndogo',
          'Tathmini ya matumizi na maboresho',
        ],
      },
      {
        title: 'Matengenezo, Ukarabati na Maboresho',
        text: 'Utambuzi wa hitilafu kwa haraka na ukarabati wa uaminifu kwa nyumba na biashara — pamoja na matengenezo ya kuzuia matatizo kabla hayajakugharimu.',
        points: [
          'Utambuzi wa hitilafu na ukarabati wa dharura',
          'Kubadilisha wiring chakavu au hatari',
          'Mikataba ya matengenezo ya kuzuia',
          'Maboresho ya kuokoa nishati',
        ],
      },
    ],

    stepsKicker: 'Jinsi Tunavyofanya Kazi',
    stepsTitle: { pre: 'Mchakato rahisi, ', accent: 'bila mshangao' },
    stepsLead: 'Hatua nne wazi kuanzia simu yako ya kwanza hadi ufungaji kamili uliopimwa.',
    steps: [
      {
        title: 'Ukaguzi wa Eneo',
        text: 'Tunatembelea eneo lako au kupitia michoro yako ili kuelewa kazi zote za umeme.',
      },
      {
        title: 'Bei ya Wazi',
        text: 'Unapokea bei iliyoainishwa kwa uwazi na uaminifu — vifaa, kazi na muda.',
      },
      {
        title: 'Utekelezaji Salama',
        text: 'Timu yetu yenye vyeti inatekeleza kazi kwa vifaa kamili vya usalama na taarifa za maendeleo kila siku.',
      },
      {
        title: 'Upimaji na Makabidhiano',
        text: 'Kila mzunguko unapimwa na kurekodiwa kabla ya kukabidhi mfumo safi unaofanya kazi.',
      },
    ],
    requestQuote: 'Omba Bei',
  },

  projects: {
    heroKicker: 'Kazi Zetu',
    heroTitle: { pre: 'Ushahidi, si ahadi — ', accent: 'kutoka maeneo yetu ya kazi' },
    heroLead:
      'Kila picha hapa chini ilipigwa na timu yetu kwenye miradi halisi. Hiki ndicho kiwango utakachopata kwenye mradi wako.',
    filters: {
      all: 'Zote',
      conduit: 'Kazi za Mabomba',
      site: 'Eneo la Kazi',
      install: 'Ufungaji',
      team: 'Timu Yetu',
    },
    captions: [
      'Upangaji wa mabomba kwenye slabu kabla ya kumwaga zege',
      'Uunganishaji wa bodi ya kugawa umeme',
      'Upimaji na upangaji kwenye sakafu ya kazi',
      'Kuandaa mabomba ya PVC kwa ajili ya slabu',
      'Timu ikipumzika kati ya kazi',
      'Wiring wa ndani na upangaji wa nyaya',
      'Ushirikiano na timu ya mafundi chuma',
      'Mtandao wa mabomba ukikamilika',
      'Fuse links na vifaa vya ulinzi',
      'Tayari kwa kazi za siku',
      'Kazi kwenye sakafu ya nondo',
      'Ufungaji wa switchgear ukiendelea',
      'Mabomba yakiwa yamepangwa kwenye sakafu',
      'Umakini kabla ya kumwaga zege',
      'Maendeleo ya mradi wa kibiashara',
      'Kazi za wiring wa nje',
      'Mabomba ya slabu, tayari kwa ukaguzi',
      'Timu moja, kiwango kimoja',
      'Kazi kwenye jengo refu',
      'Safari kuelekea mradi unaofuata',
    ],
    ctaLead: 'Unataka mradi wako uonekane hivi? Tuwasiliane.',
    ctaBtn: 'Anza Mradi Wako',
  },

  contact: {
    heroKicker: 'Wasiliana Nasi',
    heroTitle: { pre: 'Tuwashe ', accent: 'mradi wako' },
    heroLead:
      'Tuambie unachojenga au kutengeneza — mara nyingi tunajibu na bei ndani ya saa 24.',
    callUs: 'Tupigie Simu',
    whatsapp: 'WhatsApp',
    whatsappSub: 'Ongea nasi moja kwa moja',
    email: 'Barua Pepe',
    location: 'Mahali',
    formTitle: 'Omba Bei',
    formSub:
      'Jaza taarifa hapa chini na uitume moja kwa moja kwa timu yetu kupitia WhatsApp au barua pepe.',
    nameLabel: 'Jina Lako',
    namePlaceholder: 'mf. Juma Hamisi',
    phoneLabel: 'Namba ya Simu',
    phonePlaceholder: 'mf. +255 7XX XXX XXX',
    serviceLabel: 'Huduma Unayohitaji',
    serviceOptions: [
      'Ufungaji wa Umeme / Wiring',
      'Mabomba ya Umeme kwenye Slabu',
      'Bodi za Kugawa Umeme na Switchgear',
      'Umeme wa Eneo la Kazi na Mita',
      'Matengenezo na Ukarabati',
      'Nyingine',
    ],
    messageLabel: 'Maelezo ya Mradi',
    messagePlaceholder:
      'Eleza mradi wako — mahali, aina ya jengo, unachohitaji kifanyike...',
    sendWhatsApp: 'Tuma kwa WhatsApp',
    sendEmail: 'Tuma kwa Barua Pepe',
  },
};

export type Translations = typeof en;
export const TRANSLATIONS: Record<'en' | 'sw', Translations> = { en, sw };
