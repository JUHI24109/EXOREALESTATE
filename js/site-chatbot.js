(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     CONFIGURATION
  ───────────────────────────────────────────── */
  const GEMINI_API_KEY = 'AIzaSyBH4inL1CrquXMRnGL6Z3fGybYr24HRz78';
  const GEMINI_MODEL = 'gemini-1.5-flash';
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const MAX_HISTORY_TURNS = 20;
  const MAX_INPUT_LENGTH = 1000;
  const RATE_LIMIT_MS = 1500;
  const MAX_RETRIES = 2;
  const WHATSAPP_PHONE = '351918445899';
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}`;
  const WHATSAPP_MESSAGES = {
    pt: 'Olá! Gostaria de saber mais sobre propriedades disponíveis em Portugal, por favor.',
    en: 'Hello! I would like to learn more about available properties in Portugal, please.',
    fr: 'Bonjour ! Je souhaite en savoir plus sur les propriétés disponibles au Portugal, s’il vous plaît.',
    nl: 'Hallo! Ik wil graag meer weten over beschikbare woningen in Portugal, alsjeblieft.',
    de: 'Hallo! Ich möchte bitte mehr über verfügbare Immobilien in Portugal erfahren.',
    zh: '您好！我想了解更多关于葡萄牙房产的信息，谢谢。',
    ar: 'مرحباً! أود معرفة المزيد عن العقارات المتاحة في البرتغال، من فضلك.'
  };

  const LANGUAGE_INSTRUCTIONS = {
    pt: {
      label: 'Português',
      prompt: 'Por favor, responda exclusivamente em Português. Não use Inglês.',
      acknowledgement: 'Ótimo! Vou responder em Português. Como posso ajudá-lo hoje?'
    },
    en: {
      label: 'English',
      prompt: 'Please answer exclusively in English. Do not use any other language.',
      acknowledgement: 'Great! I will answer in English. How can I help you today?'
    },
    fr: {
      label: 'Français',
      prompt: 'Veuillez répondre exclusivement en français. N’utilisez pas l’anglais.',
      acknowledgement: 'Super ! Je vais répondre en français. Comment puis-je vous aider aujourd’hui ?'
    },
    nl: {
      label: 'Nederlands',
      prompt: 'Beantwoord alstublieft uitsluitend in het Nederlands. Gebruik geen Engels.',
      acknowledgement: 'Geweldig! Ik zal in het Nederlands antwoorden. Hoe kan ik u vandaag helpen?'
    },
    de: {
      label: 'Deutsch',
      prompt: 'Bitte antworten Sie ausschließlich auf Deutsch. Verwenden Sie kein Englisch.',
      acknowledgement: 'Super! Ich werde auf Deutsch antworten. Wie kann Ihen heute helfen?'
    },
    zh: {
      label: 'Chinese (Mandarin)',
      prompt: '请务必仅使用中文回答。不要使用英文、葡萄牙文或任何其他语言。',
      acknowledgement: '太棒了！我将使用中文为您服务。请问今天有什么可以帮您的？'
    },
    ar: {
      label: 'Arabic',
      prompt: 'يرجى الرد باللغة العربية حصراً. لا تستخدم اللغة الإنجليزية أو أي لغة أخرى.',
      acknowledgement: 'ممتاز! سأجيب باللغة العربية. كيف يمكنني مساعدتك اليوم؟'
    }
  };

  const UI_LABELS = {
    pt: {
      welcomeTitle: 'Bem-vindo à Exo Real Estate',
      welcomeText: 'Sou o seu assistente virtual de imóveis. Por favor, escolha seu idioma preferido primeiro.',
      inputPlaceholder: 'Pergunte sobre propriedades, serviços…',
      quickActions: ['Propriedades', 'Golden Visa', 'Contacte-nos', 'Nossos escritórios'],
      status: 'Online — Pronto para ajudar',
      languageTitle: 'Escolha seu idioma',
      whatsAppPrompt: 'Para suporte rápido, clique no botão abaixo e envie sua mensagem diretamente via WhatsApp.',
      whatsAppButton: 'Enviar pelo WhatsApp'
    },
    en: {
      welcomeTitle: 'Welcome to Exo Real Estate',
      welcomeText: 'I’m your virtual property advisor. Please choose your preferred language first.',
      inputPlaceholder: 'Ask about properties, services…',
      quickActions: ['Properties', 'Golden Visa', 'Contact Us', 'Our Offices'],
      status: 'Online — Ready to help',
      languageTitle: 'Choose your language',
      whatsAppPrompt: 'For faster support, click the button below and send your message directly on WhatsApp.',
      whatsAppButton: 'Send on WhatsApp'
    },
    fr: {
      welcomeTitle: 'Bienvenue chez Exo Real Estate',
      welcomeText: 'Je suis votre conseiller immobilier virtuel. Veuillez d’abord choisir votre langue préférée.',
      inputPlaceholder: 'Demandez des propriétés, des services…',
      quickActions: ['Propriétés', 'Golden Visa', 'Contactez-nous', 'Nos Bureaux'],
      status: 'En ligne — Prêt à aider',
      languageTitle: 'Choisissez votre langue',
      whatsAppPrompt: 'Pour un support plus rapide, cliquez sur le bouton ci-dessous et envoyez votre message directement sur WhatsApp.',
      whatsAppButton: 'Envoyer sur WhatsApp'
    },
    nl: {
      welcomeTitle: 'Welkom bij Exo Real Estate',
      welcomeText: 'Ik ben uw virtuele vastgoedadviseur. Kies eerst uw voorkeurstaal.',
      inputPlaceholder: 'Vraag over woningen, diensten…',
      quickActions: ['Eigendom', 'Golden Visa', 'Contacteer ons', 'Onze Kantoren'],
      status: 'Online — Klaar om te helpen',
      languageTitle: 'Kies uw taal',
      whatsAppPrompt: 'Voor snellere ondersteuning, klik op de knop hieronder en stuur uw bericht rechtstreeks via WhatsApp.',
      whatsAppButton: 'Verstuur via WhatsApp'
    },
    de: {
      welcomeTitle: 'Willkommen bei Exo Real Estate',
      welcomeText: 'Ich bin Ihr virtueller Immobilienberater. Bitte wählen Sie zuerst Ihre bevorzugte Sprache.',
      inputPlaceholder: 'Fragen Sie nach Immobilien, Dienstleistungen…',
      quickActions: ['Immobilien', 'Golden Visa', 'Kontaktieren Sie uns', 'Unsere Büros'],
      status: 'Online — Bereit zu helfen',
      languageTitle: 'Wählen Sie Ihre Sprache',
      whatsAppPrompt: 'Für schnelleren Support klicken Sie auf die Schaltfläche unten und senden Sie Ihre Nachricht direkt über WhatsApp.',
      whatsAppButton: 'Auf WhatsApp senden'
    },
    zh: {
      welcomeTitle: '欢迎来到 Exo Real Estate',
      welcomeText: '我是您的虚拟房产顾问。请先选择您的常用语言。',
      inputPlaceholder: '咨询房产、服务等...',
      quickActions: ['房产列表', '黄金签证', '联系我们', '办公地点'],
      status: '在线 — 随时为您服务',
      languageTitle: '选择您的语言',
      whatsAppPrompt: '如需更快捷的支持，请点击下方按钮直接通过 WhatsApp 发送消息。',
      whatsAppButton: '通过 WhatsApp 发送'
    },
    ar: {
      welcomeTitle: 'مرحباً بكم في إكسو العقارية',
      welcomeText: 'أنا مستشارك العقاري الافتراضي. يرجى اختيار لغتك المفضلة أولاً.',
      inputPlaceholder: 'اسأل عن العقارات، الخدمات...',
      quickActions: ['العقارات', 'التأشيرة الذهبية', 'اتصل بنا', 'مكاتبنا'],
      status: 'متصل — جاهز للمساعدة',
      languageTitle: 'اختر لغتك',
      whatsAppPrompt: 'للحصول على دعم أسرع، انقر على الزر أدناه وأرسل رسالتك مباشرة عبر واتساب.',
      whatsAppButton: 'إرسال عبر واتساب'
    }
  };

  const FALLBACK_RESPONSES = {
    properties: "We offer luxury villas, beachfront apartments, and commercial properties across Portugal — including Lisbon, Algarve, Porto, and Madeira. You can browse our full collection on the **[Properties page](properties.html)** or send us a message via the WhatsApp button below.",
    goldenvisa: "Exo Real Estate specializes in Golden Visa eligible properties. Our team can guide you through the entire investment process, from property selection to visa application. Please **[contact us](contact.html)** or use the WhatsApp button to send your inquiry.",
    contact: "The best way to reach us is through our **[Contact page](contact.html)** or by clicking the WhatsApp button below to send a direct message.",
    team: "Our team of experienced property consultants includes Aline Uebe, Micaela Morgado, Maria Lúcia Maia, Vanessa Oliveira, Eduardo Almeida, and Cícera Ribeiro. Meet them on our **[Team page](team.html)**.",
    about: "Exo Real Estate is a licensed Portuguese real estate agency (AMI 18166) with 12+ years of expertise and 250+ projects delivered. We specialize in luxury properties and investment advisory across Portugal. Learn more on our **[About page](about.html)**.",
    office: "Our head office is at **Av. da Liberdade, 144, 2 DTO, 1250-146 Lisboa, Portugal**. Visit our **[Contact page](contact.html)** for a map and directions.",
    price: "Property prices vary by location, type, and size. Our portfolio includes options across different investment levels. For current pricing and personalized recommendations, please send a message via the WhatsApp button below or visit our contact page.",
    portugal: "Portugal ranks as the **7th safest country globally** (Global Peace Index) and offers an exceptional quality of life. It's a top destination for expats, with warm climate, excellent healthcare, and strong property investment potential. We'd love to help you explore your options.",
    project: "We have several exclusive development projects including **Sporting Club (Évora)**, **Abrantes Luxury Living Apartments**, **Project Santarém**, and **Padel & Fitness Santarém**. Explore them on our **[About page](about.html)** or contact us for details.",
    default: "Thank you for reaching out! I'd be happy to help you with information about our luxury properties, investment opportunities, Golden Visa programs, or any of our services. For personalized assistance, please use the WhatsApp button below or visit our **[Contact page](contact.html)**."
  };

  const FALLBACK_TRANSLATIONS = {
    pt: {
      properties: "Oferecemos villas de luxo, apartamentos à beira-mar e imóveis comerciais em Portugal — incluindo Lisboa, Algarve, Porto e Madeira. Você pode ver nossa coleção completa na **[página de Propriedades](properties.html)** ou enviar uma mensagem via o botão do WhatsApp abaixo.",
      goldenvisa: "A Exo Real Estate é especialista em imóveis elegíveis para Golden Visa. Nossa equipe pode orientá-lo em todo o processo de investimento, desde a seleção do imóvel até a aplicação do visto. Por favor, **[contate-nos](contact.html)** ou envie sua solicitação pelo botão do WhatsApp.",
      contact: "A melhor forma de nos contatar é através da **[página de Contato](contact.html)** ou clicando no botão do WhatsApp abaixo para enviar uma mensagem direta.",
      team: "Nossa equipe de consultores imobiliários experientes inclui Aline Uebe, Micaela Morgado, Maria Lúcia Maia, Vanessa Oliveira, Eduardo Almeida e Cícera Ribeiro. Conheça-os em nossa **[página de Equipe](team.html)**.",
      about: "A Exo Real Estate é uma agência imobiliária portuguesa licenciada (AMI 18166) com mais de 12 anos de experiência e mais de 250 projetos entregues. Especializamos em imóveis de luxo e consultoria de investimentos em Portugal. Saiba mais em nossa **[página Sobre](about.html)**.",
      office: "Nosso escritório central fica na **Av. da Liberdade, 144, 2 DTO, 1250-146 Lisboa, Portugal**. Visite nossa **[página de Contato](contact.html)** para mapa e direções.",
      price: "Os preços dos imóveis variam de acordo com localização, tipo e tamanho. Nosso portfólio inclui opções em diferentes faixas de investimento. Para preços atuais e recomendações personalizadas, envie uma mensagem pelo botão do WhatsApp abaixo ou visite nossa página de contato.",
      portugal: "Portugal é classificado como o **7º país mais seguro do mundo** (Global Peace Index) e oferece uma qualidade de vida excepcional. É um destino de destaque para expatriados, com clima ameno, excelente saúde e forte potencial de investimento imobiliário. Adoraríamos ajudá-lo a explorar suas opções.",
      project: "Temos vários projetos exclusivos, incluindo **Sporting Club (Évora)**, **Abrantes Luxury Living Apartments**, **Project Santarém** e **Padel & Fitness Santarém**. Explore-os em nossa **[página Sobre](about.html)** ou entre em contato para detalhes.",
      default: "Obrigado por entrar em contato! Ficarei feliz em ajudar com informações sobre nossos imóveis de luxo, oportunidades de investimento, programas Golden Visa ou qualquer um de nossos serviços. Para assistência personalizada, por favor use o botão do WhatsApp abaixo ou visite nossa **[página de Contato](contact.html)**."
    },
    fr: {
      properties: "Nous proposons des villas de luxe, des appartements en bord de mer et des biens commerciaux au Portugal — notamment à Lisbonne, Algarve, Porto et Madère. Vous pouvez consulter notre collection complète sur la **[page Propriétés](properties.html)** ou envoyer un message via le bouton WhatsApp ci-dessous.",
      goldenvisa: "Exo Real Estate est spécialisée dans les biens éligibles au Golden Visa. Notre équipe peut vous guider dans tout le processus d'investissement, de la sélection du bien à la demande de visa. Veuillez **[nous contacter](contact.html)** ou envoyer votre demande via le bouton WhatsApp.",
      contact: "La meilleure façon de nous joindre est via notre **[page Contact](contact.html)** ou en cliquant sur le bouton WhatsApp ci-dessous pour envoyer un message direct.",
      team: "Notre équipe de conseillers immobiliers expérimentés comprend Aline Uebe, Micaela Morgado, Maria Lúcia Maia, Vanessa Oliveira, Eduardo Almeida et Cícera Ribeiro. Rencontrez-les sur notre **[page Équipe](team.html)**.",
      about: "Exo Real Estate est une agence immobilière portugaise agréée (AMI 18166) avec plus de 12 ans d'expérience et plus de 250 projets réalisés. Nous sommes spécialisés dans l'immobilier de luxe et le conseil en investissement au Portugal. En savoir plus sur notre **[page À propos](about.html)**.",
      office: "Notre siège est situé au **Av. da Liberdade, 144, 2 DTO, 1250-146 Lisboa, Portugal**. Visitez notre **[page Contact](contact.html)** pour une carte et des directions.",
      price: "Les prix des biens varient selon l'emplacement, le type et la taille. Notre portefeuille propose des options dans différentes gammes d'investissement. Pour les tarifs actuels et des recommandations personnalisées, envoyez un message via le bouton WhatsApp ci-dessous ou visitez notre page de contact.",
      portugal: "Le Portugal est classé comme le **7e pays le plus sûr au monde** (Global Peace Index) et offre une qualité de vie exceptionnelle. C'est une destination de choix pour les expatriés, avec un climat agréable, d'excellents soins de santé et un fort potentiel d'investissement immobilier. Nous serions ravis de vous aider à explorer vos options.",
      project: "Nous avons plusieurs projets exclusifs, notamment **Sporting Club (Évora)**, **Abrantes Luxury Living Apartments**, **Project Santarém** et **Padel & Fitness Santarém**. Découvrez-les sur notre **[page À propos](about.html)** ou contactez-nous pour des détails.",
      default: "Merci de nous avoir contactés ! Je serais heureux de vous aider avec des informations sur nos biens de luxe, nos opportunités d'investissement, nos programmes Golden Visa ou l'un de nos services. Pour une assistance personnalisée, veuillez utiliser le bouton WhatsApp ci-dessous ou visiter notre **[page Contact](contact.html)**."
    },
    nl: {
      properties: "We bieden luxe villa's, appartementen aan zee en commerciële panden in Portugal — waaronder Lissabon, Algarve, Porto en Madeira. Bekijk onze volledige collectie op de **[pagina Eigendom](properties.html)** of stuur een bericht via de WhatsApp-knop hieronder.",
      goldenvisa: "Exo Real Estate is gespecialiseerd in Golden Visa-geschikte woningen. Ons team kan u begeleiden bij het hele investeringsproces, van woningselectie tot visumaanvraag. Neem alstublieft **[contact met ons op](contact.html)** of stuur uw aanvraag via de WhatsApp-knop.",
      contact: "De beste manier om ons te bereiken is via onze **[Contactpagina](contact.html)** of door op de WhatsApp-knop hieronder te klikken om een rechtstreeks bericht te sturen.",
      team: "Ons team van ervaren vastgoedadviseurs bestaat uit Aline Uebe, Micaela Morgado, Maria Lúcia Maia, Vanessa Oliveira, Eduardo Almeida en Cícera Ribeiro. Maak kennis met hen op onze **[Team pagina](team.html)**.",
      about: "Exo Real Estate is een erkend Portugees makelaarskantoor (AMI 18166) met meer dan 12 jaar ervaring en meer dan 250 afgeronde projecten. We zijn gespecialiseerd in luxe vastgoed en investeringsadvies in Portugal. Lees meer op onze **[Over pagina](about.html)**.",
      office: "Ons hoofdkantoor bevindt zich op **Av. da Liberdade, 144, 2 DTO, 1250-146 Lissabon, Portugal**. Bezoek onze **[Contactpagina](contact.html)** voor kaart en routebeschrijving.",
      price: "Vastgoedprijzen variëren per locatie, type en grootte. Ons aanbod bevat opties voor verschillende investeringsniveaus. Voor actuele prijzen en persoonlijke aanbevelingen stuurt u een bericht via de WhatsApp-knop hieronder of bezoekt u onze contactpagina.",
      portugal: "Portugal staat op de 7e plaats van de veiligste landen ter wereld (Global Peace Index) en biedt een uitzonderlijke levenskwaliteit. Het is een topbestemming voor expats, met een warm klimaat, uitstekende gezondheidszorg en sterke vastgoedbeleggingsmogelijkheden. We helpen u graag uw opties te verkennen.",
      project: "We hebben verschillende exclusieve projecten, waaronder **Sporting Club (Évora)**, **Abrantes Luxury Living Apartments**, **Project Santarém** en **Padel & Fitness Santarém**. Bekijk ze op onze **[Over pagina](about.html)** of neem contact op voor details.",
      default: "Bedankt voor uw bericht! Ik help u graag met informatie over onze luxe woningen, investeringsmogelijkheden, Golden Visa-programma's of een van onze diensten. Voor persoonlijke hulp kunt u de WhatsApp-knop hieronder gebruiken of onze **[Contactpagina](contact.html)** bezoeken."
    },
    de: {
      properties: "Wir bieten Luxusvillen, Strandwohnungen und Gewerbeimmobilien in Portugal an — einschließlich Lissabon, Algarve, Porto und Madeira. Sie können unsere vollständige Sammlung auf der **[Properties-Seite](properties.html)** ansehen oder eine Nachricht über die WhatsApp-Schaltfläche unten senden.",
      goldenvisa: "Exo Real Estate ist auf Golden-Visa-geeignete Immobilien spezialisiert. Unser Team kann Sie durch den gesamten Investitionsprozess führen, von der Immobilienauswahl bis zur Visumantragsstellung. Bitte **[kontaktieren Sie uns](contact.html)** oder senden Sie Ihre Anfrage über die WhatsApp-Schaltfläche.",
      contact: "Der beste Weg, uns zu erreichen, ist über unsere **[Kontaktseite](contact.html)** oder indem Sie auf die WhatsApp-Schaltfläche unten klicken, um eine direkte Nachricht zu senden.",
      team: "Unser Team erfahrener Immobilienberater umfasst Aline Uebe, Micaela Morgado, Maria Lúcia Maia, Vanessa Oliveira, Eduardo Almeida und Cícera Ribeiro. Lernen Sie sie auf unserer **[Teamseite](team.html)** kennen.",
      about: "Exo Real Estate ist ein lizenziertes portugiesisches Immobilienunternehmen (AMI 18166) mit über 12 Jahren Erfahrung und mehr als 250 abgeschlossenen Projekten. Wir spezialisieren uns auf Luxusimmobilien und Investmentberatung in Portugal. Erfahren Sie mehr auf unserer **[Über uns Seite](about.html)**.",
      office: "Unser Hauptbüro befindet sich in der **Av. da Liberdade, 144, 2 DTO, 1250-146 Lissabon, Portugal**. Besuchen Sie unsere **[Kontaktseite](contact.html)** für Karte und Wegbeschreibung.",
      price: "Immobilienpreise variieren je nach Lage, Typ und Größe. Unser Portfolio umfasst Optionen in verschiedenen Investitionsklassen. Für aktuelle Preise und persönliche Empfehlungen senden Sie eine Nachricht über die WhatsApp-Schaltfläche unten oder besuchen Sie unsere Kontaktseite.",
      portugal: "Portugal zählt zu den sichersten Ländern der Welt (Global Peace Index) und bietet eine außergewöhnliche Lebensqualität. Es ist ein Top-Ziel für Expats, mit mildem Klima, ausgezeichneter Gesundheitsversorgung und starkem Immobilieninvestmentpotenzial. Wir helfen Ihnen gerne, Ihre Optionen zu erkunden.",
      project: "Wir haben mehrere exklusive Entwicklungsprojekte, darunter **Sporting Club (Évora)**, **Abrantes Luxury Living Apartments**, **Project Santarém** und **Padel & Fitness Santarém**. Entdecken Sie sie auf unserer **[Über uns Seite](about.html)** oder kontaktieren Sie uns für Details.",
      default: "Danke für Ihre Nachricht! Ich helfe Ihnen gerne mit Informationen zu unseren Luxusimmobilien, Investitionsmöglichkeiten, Golden-Visa-Programmen oder einem unserer Services. Für persönliche Unterstützung können Sie die WhatsApp-Schaltfläche unten verwenden oder unsere **[Kontaktseite](contact.html)** besuchen."
    },
    zh: {
      properties: "我们提供葡萄牙全境的豪华别墅、海滨公寓和商业房产，包括里斯本、阿尔加维、波尔图和马德拉群岛。您可以浏览我们的**[房产页面](properties.html)**查看完整列表，或点击下方的 WhatsApp 按钮向我们发送消息。",
      goldenvisa: "Exo Real Estate 专注于符合黄金签证条件的房产。我们的团队可以为您提供从选房到签证申请的全程指导。请**[联系我们](contact.html)**或使用 WhatsApp 发送您的咨询。",
      contact: "联系我们的最佳方式是通过**[联系页面](contact.html)**，或点击下方的 WhatsApp 按钮直接发送消息。",
      team: "我们经验丰富的房产顾问团队包括 Aline Uebe、Micaela Morgado、Maria Lúcia Maia、Vanessa Oliveira、Eduardo Almeida 和 Cícera Ribeiro。请在我们的**[团队页面](team.html)**了解他们。",
      about: "Exo Real Estate 是一家获得许可的葡萄牙房地产代理公司 (AMI 18166)，拥有12年以上的专业经验，已完成250多个项目。我们专注于葡萄牙的奢华房产和投资咨询。请在我们的**[关于页面](about.html)**了解更多信息。",
      office: "我们的总部位于 **Av. da Liberdade, 144, 2 DTO, 1250-146 Lisboa, Portugal**。请访问我们的**[联系页面](contact.html)**查看地图和路线。",
      price: "房产价格因地点、类型和面积而异。我们的投资组合包括不同投资级别的选择。如需了解当前价格和个性化建议，请通过下方的 WhatsApp 按钮发送消息或访问我们的联系页面。",
      portugal: "葡萄牙在全球最安全国家排名中名列第7位（全球和平指数），并提供卓越的生活质量。这里是外籍人士的首选目的地，气候温和，拥有卓越的医疗保健系统和强大的房产投资潜力。我们很乐意帮助您探索各种选择。",
      project: "我们有多个独特的开发项目，包括 **Sporting Club (Évora)**、**Abrantes Luxury Living Apartments**、**Project Santarém** 和 **Padel & Fitness Santarém**。请在我们的**[关于页面](about.html)**进行探索，或联系我们了解详情。",
      default: "感谢您的联系！我很乐意为您提供有关我们奢华房产、投资机会、黄金签证计划或任何服务的信息。如需个性化帮助，请使用下方的 WhatsApp 按钮或访问我们的**[联系页面](contact.html)**。"
    },
    ar: {
      properties: "نحن نقدم فيلات فاخرة، شققاً مطلة على البحر، وعقارات تجارية في جميع أنحاء البرتغال — بما في ذلك لشبونة، ألغارف، بورتو، وماديرا. يمكنك تصفح مجموعتنا الكاملة على **[صفحة العقارات](properties.html)** أو مراسلتنا عبر زر واتساب أدناه.",
      goldenvisa: "تتخصص إكسو العقارية في العقارات المؤهلة للحصول على التأشيرة الذهبية. يمكن لفريقنا إرشادك خلال عملية الاستثمار بأكملها، من اختيار العقار إلى طلب التأشيرة. يرجى **[الاتصال بنا](contact.html)** أو استخدام زر واتساب لإرسال استفسارك.",
      contact: "أفضل طريقة للوصول إلينا هي عبر **[صفحة الاتصال](contact.html)** أو بالضغط على زر واتساب أدناه لإرسال رسالة مباشرة.",
      team: "يضم فريقنا من مستشاري العقارات ذوي الخبرة كلاً من ألين أويبي، ميكايلا مورغادو، ماريا لوسيا مايا، فانيسا أوليفيرا، إدواردو ألميدا، وسيسيرا ريبيرو. تعرف عليهم في **[صفحة الفريق](team.html)**.",
      about: "إكسو العقارية هي وكالة عقارية برتغالية مرخصة (AMI 18166) بخبرة تزيد عن 12 عاماً وأكثر من 250 مشروعاً تم تسليمه. نحن متخصصون في العقارات الفاخرة والاستشارات الاستثمارية في البرتغال. تعرف على المزيد في **[صفحة عنا](about.html)**.",
      office: "يقع مكتبنا الرئيسي في **Av. da Liberdade, 144, 2 DTO, 1250-146 Lisboa, Portugal**. قم بزيارة **[صفحة الاتصال](contact.html)** للحصول على خريطة واتجاهات.",
      price: "تختلف أسعار العقارات حسب الموقع والنوع والمساحة. تضم محفظتنا خيارات عبر مستويات استثمارية مختلفة. للحصول على الأسعار الحالية والتوصيات الشخصية، يرجى إرسال رسالة عبر زر واتساب أدناه أو زيارة صفحة الاتصال الخاصة بنا.",
      portugal: "تصنف البرتغال كـ **سابع أمن دولة عالمياً** (مؤشر السلام العالمي) وتقدم جودة حياة استثنائية. إنها وجهة رئيسية للمغتربين، مع مناخ دافئ ورعاية صحية ممتازة وإمكانيات استثمار عقاري قوية. يسعدنا مساعدتك في استكشاف خياراتك.",
      project: "لدينا العديد من المشاريع التطويرية الحصرية بما في ذلك **Sporting Club (Évora)** و **Abrantes Luxury Living Apartments** و **Project Santarém** و **Padel & Fitness Santarém**. استكشفها على **[صفحة عنا](about.html)** أو اتصل بنا للحصول على التفاصيل.",
      default: "شكراً لتواصلك معنا! سأكون سعيداً بمساعدتك في الحصول على معلومات حول عقاراتنا الفاخرة، أو فرص الاستثمار، أو برامج التأشيرة الذهبية، أو أي من خدماتنا. للحصول على مساعدة شخصية، يرجى استخدام زر واتساب أدناه أو زيارة **[صفحة الاتصال](contact.html)**."
    }
  };

  function localizeFallback(key, lang) {
    if (lang && FALLBACK_TRANSLATIONS[lang] && FALLBACK_TRANSLATIONS[lang][key]) {
      return FALLBACK_TRANSLATIONS[lang][key];
    }
    return FALLBACK_RESPONSES[key] || FALLBACK_RESPONSES.default;
  }

  function localizeRateLimit(lang) {
    const messages = {
      en: "I'm experiencing high demand right now. Please try again in about 30 seconds. In the meantime, feel free to browse our **[Properties](properties.html)** or **[Contact us](contact.html)** directly.",
      pt: "Estou com muita procura no momento. Por favor, tente novamente em cerca de 30 segundos. Enquanto isso, sinta-se à vontade para navegar em nossas **[Propriedades](properties.html)** ou **[Contacte-nos](contact.html)**.",
      fr: "Je rencontre une forte demande en ce moment. Veuillez réessayer dans environ 30 secondes. En attendant, n'hésitez pas à consulter nos **[Propriétés](properties.html)** ou **[Contactez-nous](contact.html)**.",
      nl: "Ik heb momenteel veel verzoeken. Probeer het over ongeveer 30 seconden opnieuw. Bekijk intussen gerust onze **[Eigendom](properties.html)** of **[Contacteer ons](contact.html)**.",
      de: "Ich habe derzeit eine hohe Nachfrage. Bitte versuchen Sie es in etwa 30 Sekunden erneut. In der Zwischenzeit können Sie gerne unsere **[Properties](properties.html)** oder **[Contact us](contact.html)** besuchen.",
      zh: "目前咨询量较大，请在大约 30 秒后重试。与此同时，您可以浏览我们的**[房产列表](properties.html)**或直接**[联系我们](contact.html)**。",
      ar: "أواجه طلباً كبيراً في الوقت الحالي. يرجى المحاولة مرة أخرى خلال 30 ثانية. في غضون ذلك، لا تتردد في تصفح **[عقاراتنا](properties.html)** أو **[الاتصال بنا](contact.html)** مباشرة."
    };
    return messages[lang] || messages.en;
  }

  function localizeSafetyResponse(lang) {
    const messages = {
      en: "I'm sorry, I can't respond to that particular question. Feel free to ask me about our properties, services, or how to get in touch with our team.",
      pt: "Desculpe, não posso responder a essa pergunta específica. Pergunte-me sobre nossas propriedades, serviços ou como entrar em contato com nossa equipe.",
      fr: "Désolé, je ne peux pas répondre à cette question particulière. N'hésitez pas à me poser des questions sur nos propriétés, services ou comment contacter notre équipe.",
      nl: "Sorry, ik kan niet op die specifieke vraag antwoorden. Vraag me gerust over onze woningen, diensten of hoe je contact kunt opnemen met ons team.",
      de: "Entschuldigung, ich kann auf diese spezielle Frage nicht antworten. Fragen Sie mich gerne nach unseren Immobilien, Dienstleistungen oder wie Sie unser Team erreichen können.",
      zh: "抱歉，我无法回答该特定问题。您可以向我咨询有关我们的房产、服务或如何联系我们团队的信息。",
      ar: "عذراً، لا يمكنني الرد على هذا السؤال بالتحديد. لا تتردد في سؤالي عن عقاراتنا أو خدماتنا أو كيفية التواصل مع فريقنا."
    };
    return messages[lang] || messages.en;
  }

  /* ─────────────────────────────────────────────
     WEBSITE KNOWLEDGE BASE
  ───────────────────────────────────────────── */
  const SITE_KNOWLEDGE = `
You are the official AI assistant for **Exo Real Estate**, a premier licensed real estate agency operating in Portugal. You help visitors with questions about the company, its services, properties, and the Portuguese property market.

## Company Overview
- **Name**: Exo Real Estate
- **Website**: https://exorealestate.com
- **AMI License Number**: 18166 (officially licensed Portuguese real estate mediator)
- **Specialty**: Luxury properties in Portugal — villas, apartments, and commercial spaces
- **Markets Served**: Lisbon, Algarve, Porto, Madeira, Silver Coast, Alentejo, and all of Portugal
- **Target Clients**: International investors, Golden Visa applicants, expats, luxury home buyers, entrepreneurs

### Head Office (Portugal)
- Avenida da Liberdade, 144, 2 DTO, 1250-146 Lisboa, Portugal
- Phone: +351 918 445 899
- Email: info@exorealestate.com

## Services
1. **Property Sales & Listings** — Luxury villas, beachfront apartments, commercial properties across Portugal
2. **Golden Visa Assistance** — Investment-based residency programs in Portugal
3. **Citizenship Programs** — Path to Portuguese/EU citizenship
4. **Residency Services** — Help with Non-Habitual Residency (NHR) and D7 visas
5. **Skilled Immigration** — Professional relocation support
6. **Business Formation** — Company incorporation in Portugal
7. **Property Investment Advisory** — ROI analysis, market trends, portfolio management

## Team Members (Property Consultants)
- Aline Uebe
- Micaela Morgado
- Maria Lúcia Maia
- Vanessa Oliveira
- Eduardo Almeida
- Cícera Ribeiro

## Exclusive Development Projects
1. **Sporting Club, Évora** — Historic premium development with classical architecture and modern finishes. Status: Ready.
2. **Project in Fróno Ferro** — Upcoming luxury project with breathtaking views and state-of-the-art facilities.
3. **Project Santarém** — Ready-to-move residential masterpiece blending heritage with premium comfort.
4. **EXO STATION4 Abrantes Luxury Living Apartments** — Premium apartments with exquisite finishes and breathtaking views. Status: Ready.
5. **Padel & Fitness Santarém** — State-of-the-art sports and wellness facility. Status: Ready.

## Property Types Available
- Villas (luxury, beachfront, countryside)
- Apartments (city, waterfront, penthouse)
- Commercial Properties (offices, retail, hospitality)
- Land & Development plots

## Key Selling Points
- AMI-licensed (government registered agent, #18166)
- 12+ years of expertise
- 250+ projects delivered
- 98% client satisfaction rate
- Golden Visa eligible properties
- Multi-language support (English, Portuguese, Arabic, Urdu, French, Chinese, Spanish, Hindi, Russian, and more)
- Expert advisors with deep local knowledge
- Premium boutique service for global investors

## Website Pages
- **Home** (index.html) — Hero showcase, featured properties, search by location/map/nearby, blog articles
- **Properties** (properties.html) — Full property listing with filters (type, price, location, bedrooms, features)
- **About** (about.html) — Company story, exclusive projects portfolio, statistics
- **Team** (team.html) — Meet the team of property consultants
- **Contact** (contact.html) — Inquiry form, office details, map, social links
- **Property Detail** (property-detail.html) — Individual property pages with gallery, specs, WhatsApp contact

## Important Notes for Responses
- Always be professional, warm, and helpful
- If someone asks about a specific property, suggest they browse the Properties page or contact the team
- For pricing questions, explain that prices vary by property and location, and recommend contacting the team for current listings
- WhatsApp contact: +351 918 445 899
- Encourage visitors to schedule a free consultation
- Golden Visa minimum investment thresholds: mention that they should consult with the team for the latest requirements as regulations can change
- Portugal is ranked the 7th safest country globally (Global Peace Index)
- Do NOT reveal that you are powered by Gemini or any specific AI model. Simply say you are Exo Real Estate's virtual assistant.
- Keep answers concise but informative, typically 2-4 sentences unless a detailed explanation is truly needed
- If you don't know something specific, recommend contacting the team directly
`.trim();

  /* ─────────────────────────────────────────────
     STYLES (injected into page)
  ───────────────────────────────────────────── */
  const CHAT_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

    #exo-chatbot-widget {
      --cb-ink: #0f172a;
      --cb-ink2: #1e293b;
      --cb-ink3: #475569;
      --cb-muted: #94a3b8;
      --cb-border: #e2e8f0;
      --cb-bg: #f8fafc;
      --cb-surface: #ffffff;
      --cb-accent: #4f6ef7;
      --cb-accent-glow: rgba(79,110,247,0.25);
      --cb-gold: #D4AF37;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Launcher Button ── */
    .exo-cb-launcher {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cb-ink) 0%, var(--cb-ink2) 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow:
        0 8px 32px rgba(15,23,42,0.35),
        0 0 0 0 var(--cb-accent-glow);
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .exo-cb-launcher::before {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cb-accent), var(--cb-gold));
      opacity: 0;
      transition: opacity 0.3s ease;
      z-index: 0;
    }
    .exo-cb-launcher:hover::before {
      opacity: 1;
    }
    .exo-cb-launcher:hover {
      transform: scale(1.1) translateY(-2px);
      box-shadow:
        0 12px 40px rgba(15,23,42,0.4),
        0 0 0 6px var(--cb-accent-glow);
    }
    .exo-cb-launcher:active {
      transform: scale(0.95);
    }
    .exo-cb-launcher svg {
      width: 28px;
      height: 28px;
      fill: #fff;
      position: relative;
      z-index: 1;
      transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    .exo-cb-launcher.open svg {
      transform: rotate(90deg) scale(0.85);
    }

    /* pulse ring */
    .exo-cb-pulse {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #22c55e;
      border: 3px solid var(--cb-surface);
      z-index: 2;
      animation: exoCbPulse 2s ease-in-out infinite;
    }
    @keyframes exoCbPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    .exo-cb-launcher.open .exo-cb-pulse { display: none; }

    /* ── Chat Window ── */
    .exo-cb-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 400px;
      max-width: calc(100vw - 32px);
      height: 580px;
      max-height: calc(100vh - 140px);
      background: var(--cb-bg);
      border-radius: 24px;
      box-shadow:
        0 24px 80px rgba(15,23,42,0.25),
        0 4px 16px rgba(15,23,42,0.1);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      transform: translateY(16px) scale(0.96);
      transition: opacity 0.35s ease,
                  visibility 0.35s ease,
                  transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
      border: 1px solid rgba(226,232,240,0.6);
    }
    .exo-cb-window.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    /* ── Header ── */
    .exo-cb-header {
      background: linear-gradient(135deg, var(--cb-ink) 0%, var(--cb-ink2) 100%);
      padding: 20px 22px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    .exo-cb-header::before {
      content: '';
      position: absolute;
      top: -60px;
      right: -60px;
      width: 160px;
      height: 160px;
      background: radial-gradient(circle, rgba(79,110,247,0.18) 0%, transparent 70%);
      border-radius: 50%;
    }
    .exo-cb-header-avatar {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--cb-accent), var(--cb-gold));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
    }
    .exo-cb-header-avatar svg {
      width: 22px;
      height: 22px;
      fill: #fff;
    }
    .exo-cb-header-info {
      flex: 1;
      min-width: 0;
      position: relative;
      z-index: 1;
    }
    .exo-cb-header-title {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      line-height: 1.2;
    }
    .exo-cb-header-status {
      font-size: 11.5px;
      color: rgba(255,255,255,0.55);
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 3px;
    }
    .exo-cb-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      animation: exoCbPulse 2s ease-in-out infinite;
    }
    .exo-cb-close {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
      position: relative;
      z-index: 1;
      font-size: 18px;
    }
    .exo-cb-close:hover {
      background: rgba(255,255,255,0.15);
      color: #fff;
    }

    /* ── Messages Area ── */
    .exo-cb-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px 18px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      scroll-behavior: smooth;
    }
    .exo-cb-messages::-webkit-scrollbar { width: 5px; }
    .exo-cb-messages::-webkit-scrollbar-track { background: transparent; }
    .exo-cb-messages::-webkit-scrollbar-thumb {
      background: var(--cb-border);
      border-radius: 5px;
    }

    /* message bubbles */
    .exo-cb-msg {
      display: flex;
      gap: 10px;
      max-width: 88%;
      animation: exoCbMsgIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
      opacity: 0;
    }
    @keyframes exoCbMsgIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .exo-cb-msg.bot {
      align-self: flex-start;
    }
    .exo-cb-msg.user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }
    .exo-cb-msg-avatar {
      width: 30px;
      height: 30px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .exo-cb-msg.bot .exo-cb-msg-avatar {
      background: linear-gradient(135deg, var(--cb-ink), var(--cb-ink2));
    }
    .exo-cb-msg.bot .exo-cb-msg-avatar svg {
      width: 14px;
      height: 14px;
      fill: #fff;
    }
    .exo-cb-msg.user .exo-cb-msg-avatar {
      background: var(--cb-accent);
    }
    .exo-cb-msg.user .exo-cb-msg-avatar svg {
      width: 14px;
      height: 14px;
      fill: #fff;
    }
    .exo-cb-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 13.5px;
      line-height: 1.65;
      word-break: break-word;
    }
    .exo-cb-msg.bot .exo-cb-bubble {
      background: var(--cb-surface);
      color: var(--cb-ink2);
      border: 1px solid var(--cb-border);
      border-bottom-left-radius: 6px;
      box-shadow: 0 2px 8px rgba(15,23,42,0.04);
    }
    .exo-cb-msg.user .exo-cb-bubble {
      background: linear-gradient(135deg, var(--cb-ink), var(--cb-ink2));
      color: #fff;
      border-bottom-right-radius: 6px;
      box-shadow: 0 4px 14px rgba(15,23,42,0.15);
    }
    .exo-cb-bubble a {
      color: var(--cb-accent);
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    .exo-cb-msg.user .exo-cb-bubble a {
      color: #93c5fd;
    }
    .exo-cb-bubble strong {
      font-weight: 700;
    }
    .exo-cb-bubble ul, .exo-cb-bubble ol {
      margin: 6px 0;
      padding-left: 18px;
    }
    .exo-cb-bubble li {
      margin-bottom: 3px;
    }

    /* typing indicator */
    .exo-cb-typing {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 14px 18px;
    }
    .exo-cb-typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--cb-muted);
      animation: exoCbTyping 1.4s ease-in-out infinite;
    }
    .exo-cb-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .exo-cb-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes exoCbTyping {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    /* ── Quick Actions ── */
    .exo-cb-quick-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      padding: 0 18px 12px;
    }
    .exo-cb-quick-btn {
      padding: 7px 14px;
      border: 1.5px solid var(--cb-border);
      border-radius: 100px;
      font-size: 12px;
      font-weight: 600;
      color: var(--cb-ink3);
      background: var(--cb-surface);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .exo-cb-quick-btn:hover {
      border-color: var(--cb-ink);
      color: var(--cb-ink);
      background: var(--cb-bg);
      transform: translateY(-1px);
    }
    .exo-cb-language-panel {
      padding: 16px 18px 12px;
      border-bottom: 1px solid var(--cb-border);
      background: #fff;
    }
    .exo-cb-language-title {
      font-size: 13px;
      font-weight: 700;
      color: var(--cb-ink);
      margin-bottom: 10px;
    }
    .exo-cb-language-options {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .exo-cb-language-btn {
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid var(--cb-border);
      background: var(--cb-surface);
      color: var(--cb-ink2);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .exo-cb-language-btn:hover {
      border-color: var(--cb-ink);
      color: var(--cb-ink);
      background: var(--cb-bg);
      transform: translateY(-1px);
    }
    .exo-cb-language-btn.active {
      background: var(--cb-ink);
      color: #fff;
      border-color: var(--cb-ink);
    }
    .exo-cb-language-btn.active:hover {
      transform: none;
      background: var(--cb-ink);
      color: #fff;
      border-color: var(--cb-ink);
    }
    .exo-cb-followup .exo-cb-bubble {
      background: rgba(255,255,255,0.95);
      border: 1px solid rgba(79,110,247,0.15);
    }
    .exo-cb-followup a {
      color: var(--cb-accent);
      text-decoration: none;
      font-weight: 700;
    }
    .exo-cb-followup a:hover {
      text-decoration: underline;
    }
    .exo-cb-whatsapp-action {
      margin-top: 12px;
    }
    .exo-cb-whatsapp-action a {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 10px 14px;
      border-radius: 999px;
      background: var(--cb-accent);
      color: #fff;
      font-weight: 700;
      border: none;
      transition: background 0.2s ease, transform 0.2s ease;
    }
    .exo-cb-whatsapp-action a:hover {
      background: #2f5bff;
      transform: translateY(-1px);
    }

    /* ── Input Area ── */
    .exo-cb-input-area {
      padding: 14px 16px 16px;
      border-top: 1px solid var(--cb-border);
      background: var(--cb-surface);
      display: flex;
      gap: 10px;
      align-items: flex-end;
      flex-shrink: 0;
    }
    .exo-cb-input-wrap {
      flex: 1;
      position: relative;
    }
    .exo-cb-input {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid var(--cb-border);
      border-radius: 14px;
      font-size: 13.5px;
      font-family: inherit;
      color: var(--cb-ink2);
      background: var(--cb-bg);
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      resize: none;
      min-height: 44px;
      max-height: 120px;
      line-height: 1.5;
    }
    .exo-cb-input::placeholder { color: var(--cb-muted); }
    .exo-cb-input:focus {
      border-color: var(--cb-ink);
      box-shadow: 0 0 0 3px rgba(15,23,42,0.06);
    }
    .exo-cb-send {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      border: none;
      background: var(--cb-ink);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s ease, transform 0.15s ease;
    }
    .exo-cb-send:hover {
      background: var(--cb-ink2);
      transform: translateY(-1px);
    }
    .exo-cb-send:active {
      transform: scale(0.95);
    }
    .exo-cb-send:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
    }
    .exo-cb-send svg {
      width: 18px;
      height: 18px;
      fill: #fff;
    }

    /* ── Powered By ── */
    .exo-cb-powered {
      text-align: center;
      padding: 6px 0 10px;
      font-size: 10px;
      color: var(--cb-muted);
      letter-spacing: 0.3px;
      background: var(--cb-surface);
    }

    /* ── Welcome Bubble ── */
    .exo-cb-welcome {
      text-align: center;
      padding: 8px 20px 16px;
    }
    .exo-cb-welcome-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(79,110,247,0.12), rgba(212,175,55,0.1));
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    .exo-cb-welcome-icon svg {
      width: 26px;
      height: 26px;
      fill: var(--cb-accent);
    }
    .exo-cb-welcome h3 {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: var(--cb-ink);
      margin-bottom: 6px;
    }
    .exo-cb-welcome p {
      font-size: 13px;
      color: var(--cb-muted);
      line-height: 1.6;
    }

    /* ── Error state ── */
    .exo-cb-error {
      padding: 10px 14px;
      margin: 0 18px 8px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 12px;
      font-size: 12px;
      color: #b91c1c;
      display: none;
    }
    .exo-cb-error.visible { display: block; }

    /* ── Mobile Responsive ── */
    @media (max-width: 480px) {
      #exo-chatbot-widget {
        bottom: 16px;
        right: 16px;
      }
      .exo-cb-window {
        width: calc(100vw - 32px);
        height: calc(100vh - 100px);
        max-height: calc(100vh - 100px);
        bottom: 76px;
        right: 0;
        border-radius: 20px;
      }
      .exo-cb-launcher {
        width: 56px;
        height: 56px;
      }
      .exo-cb-launcher svg {
        width: 24px;
        height: 24px;
      }
    }
  `;

  /* ─────────────────────────────────────────────
     SVG ICONS
  ───────────────────────────────────────────── */
  const ICON_CHAT = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/></svg>';
  const ICON_CLOSE = '×';
  const ICON_SEND = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  const ICON_BOT = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
  const ICON_USER = '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
  const ICON_SPARKLE = '<svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>';

  /* ─────────────────────────────────────────────
     UTILITY FUNCTIONS
  ───────────────────────────────────────────── */
  function sanitizeInput(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .trim()
      .slice(0, MAX_INPUT_LENGTH);
  }

  function formatBotResponse(text) {
    if (typeof text !== 'string') return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');

    html = html.replace(/(?:^|\n)[-•]\s(.+?)(?=(?:\n[-•]|\n\n|$))/g, function (match, item) {
      return '<li>' + item.trim() + '</li>';
    });
    if (html.includes('<li>')) {
      html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
    }

    return html;
  }

  /* ─────────────────────────────────────────────
     CHATBOT CLASS
  ───────────────────────────────────────────── */
  class ExoChatbot {
    constructor() {
      console.log('ExoChatbot initializing...');
      this.isOpen = false;
      this.isLoading = false;
      this.lastRequestTime = 0;
      this.conversationHistory = [];
      this.hasShownWelcome = false;
      this.selectedLanguage = null;
      this.hasShownWhatsAppPrompt = false;

      this.injectStyles();
      this.buildDOM();
      this.bindEvents();
      console.log('ExoChatbot initialized successfully');
    }

    injectStyles() {
      const style = document.createElement('style');
      style.id = 'exo-chatbot-styles';
      style.textContent = CHAT_STYLES;
      document.head.appendChild(style);
    }

    buildDOM() {
      const widget = document.createElement('div');
      widget.id = 'exo-chatbot-widget';
      widget.innerHTML = `
        <button class="exo-cb-launcher" id="exo-cb-launcher" aria-label="Open chat assistant">
          ${ICON_CHAT}
          <span class="exo-cb-pulse"></span>
        </button>
        <div class="exo-cb-window" id="exo-cb-window">
          <div class="exo-cb-header">
            <div class="exo-cb-header-avatar">${ICON_SPARKLE}</div>
            <div class="exo-cb-header-info">
              <div class="exo-cb-header-title">Exo Assistant</div>
              <div class="exo-cb-header-status">
                <span class="exo-cb-status-dot"></span>
                Online — Ready to help
              </div>
            </div>
            <button class="exo-cb-close" id="exo-cb-close" aria-label="Close chat">${ICON_CLOSE}</button>
          </div>
          <div class="exo-cb-messages" id="exo-cb-messages">
            <div class="exo-cb-welcome">
              <div class="exo-cb-welcome-icon">${ICON_SPARKLE}</div>
              <h3>Welcome to Exo Real Estate</h3>
              <p>I'm your virtual property advisor. Please choose your preferred language first.</p>
            </div>
          </div>
          <div class="exo-cb-error" id="exo-cb-error"></div>
          <div class="exo-cb-language-panel" id="exo-cb-language-panel">
            <div class="exo-cb-language-title">Choose your language</div>
            <div class="exo-cb-language-options">
              <button class="exo-cb-language-btn" data-lang="pt">Português</button>
              <button class="exo-cb-language-btn" data-lang="en">English</button>
              <button class="exo-cb-language-btn" data-lang="fr">Français</button>
              <button class="exo-cb-language-btn" data-lang="nl">Nederlands</button>
              <button class="exo-cb-language-btn" data-lang="de">Deutsch</button>
              <button class="exo-cb-language-btn" data-lang="zh">中文</button>
              <button class="exo-cb-language-btn" data-lang="ar">العربية</button>
            </div>
          </div>
          <div class="exo-cb-quick-actions" id="exo-cb-quick-actions" style="display:none;">
            <button class="exo-cb-quick-btn" data-question="What properties do you have available?">Properties</button>
            <button class="exo-cb-quick-btn" data-question="Tell me about Golden Visa investment options">Golden Visa</button>
            <button class="exo-cb-quick-btn" data-question="How can I schedule a consultation?">Contact Us</button>
            <button class="exo-cb-quick-btn" data-question="What are your office locations?">Our Offices</button>
          </div>
          <div class="exo-cb-input-area">
            <div class="exo-cb-input-wrap">
              <textarea
                class="exo-cb-input"
                id="exo-cb-input"
                placeholder="Ask about properties, services…"
                rows="1"
                maxlength="${MAX_INPUT_LENGTH}"
                aria-label="Type your message"
              ></textarea>
            </div>
            <button class="exo-cb-send" id="exo-cb-send" aria-label="Send message" disabled>
              ${ICON_SEND}
            </button>
          </div>
          <div class="exo-cb-powered">Exo Real Estate — AMI 18166</div>
        </div>
      `;
      document.body.appendChild(widget);

      this.launcher = document.getElementById('exo-cb-launcher');
      this.window = document.getElementById('exo-cb-window');
      this.closeBtn = document.getElementById('exo-cb-close');
      this.messages = document.getElementById('exo-cb-messages');
      this.input = document.getElementById('exo-cb-input');
      this.sendBtn = document.getElementById('exo-cb-send');
      this.quickActions = document.getElementById('exo-cb-quick-actions');
      this.errorEl = document.getElementById('exo-cb-error');
      this.langPanel = document.getElementById('exo-cb-language-panel');
      this.inputArea = document.querySelector('.exo-cb-input-area');
    }

    bindEvents() {
      if (this.launcher) {
        this.launcher.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggle();
        });
      }
      this.closeBtn.addEventListener('click', () => this.close());
      this.sendBtn.addEventListener('click', () => this.sendMessage());

      this.input.addEventListener('input', () => {
        this.sendBtn.disabled = !this.input.value.trim() || this.isLoading;
        this.autoResizeInput();
      });

      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (this.input.value.trim() && !this.isLoading) {
            this.sendMessage();
          }
        }
      });

      this.quickActions.addEventListener('click', (e) => {
        const btn = e.target.closest('.exo-cb-quick-btn');
        if (!btn) return;
        const question = btn.getAttribute('data-question');
        if (question) {
          this.input.value = question;
          this.sendMessage();
        }
      });
      
      // Listen for external language change events
      document.addEventListener('exo:languageChanged', (e) => {
        if (e.detail && e.detail.lang) {
          const newLang = e.detail.lang;
          const label = UI_LABELS[newLang]?.label || newLang;
          console.log(`[ExoChatbot] Language synced to ${newLang} via event`);
          this.selectedLanguage = newLang;
          this.updateUIForLanguage(newLang);
          this.hideLanguagePanel();
          if (this.isOpen) {
            this.inputArea.style.display = 'flex';
            this.quickActions.style.display = 'flex';
          }
        }
      });

      this.langPanel.addEventListener('click', (e) => {
        const btn = e.target.closest('.exo-cb-language-btn');
        if (!btn) return;
        this.selectLanguage(btn.dataset.lang, btn.textContent.trim());
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    autoResizeInput() {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 120) + 'px';
    }

    toggle() {
      try {
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      } catch (err) {
        console.error('Chatbot toggle error:', err);
      }
    }

    open() {
      try {
        this.isOpen = true;
        if (this.window) this.window.classList.add('open');
        if (this.launcher) this.launcher.classList.add('open');

        if (!this.selectedLanguage && this.inputArea) {
          this.inputArea.style.display = 'none';
        } else if (this.inputArea) {
          this.inputArea.style.display = 'flex';
          if (this.input && typeof this.input.focus === 'function') {
            this.input.focus();
          }
        }

        if (!this.hasShownWelcome) {
          this.hasShownWelcome = true;
          setTimeout(() => {
            this.addBotMessage("Hello! I'm Exo Real Estate's virtual assistant. Please select your preferred language to get started.");
            this.showLanguagePanel();
          }, 600);
        } else if (!this.selectedLanguage) {
          this.showLanguagePanel();
        }
      } catch (err) {
        console.error('Chatbot open error:', err);
      }
    }

    close() {
      this.isOpen = false;
      this.window.classList.remove('open');
      this.launcher.classList.remove('open');
    }

    showError(message) {
      this.errorEl.textContent = message;
      this.errorEl.classList.add('visible');
      setTimeout(() => {
        this.errorEl.classList.remove('visible');
      }, 5000);
    }

    hideError() {
      this.errorEl.classList.remove('visible');
    }

    showLanguagePanel() {
      if (!this.langPanel) return;
      this.langPanel.style.display = 'block';
      this.quickActions.style.display = 'none';
      if (this.inputArea) this.inputArea.style.display = 'none';
    }

    hideLanguagePanel() {
      if (!this.langPanel) return;
      this.langPanel.style.display = 'none';
      if (this.inputArea) this.inputArea.style.display = 'flex';
    }

    updateUIForLanguage(code) {
      const labels = UI_LABELS[code] || UI_LABELS.en;
      if (this.input) {
        this.input.placeholder = labels.inputPlaceholder;
      }
      const quickBtns = this.quickActions.querySelectorAll('.exo-cb-quick-btn');
      quickBtns.forEach((btn, index) => {
        if (labels.quickActions[index]) {
          btn.textContent = labels.quickActions[index];
        }
      });
      const statusEl = document.querySelector('.exo-cb-header-status');
      if (statusEl) {
        statusEl.textContent = labels.status;
      }
      const languageTitleEl = document.querySelector('.exo-cb-language-title');
      if (languageTitleEl) {
        languageTitleEl.textContent = labels.languageTitle;
      }
      const welcomeEl = this.messages.querySelector('.exo-cb-welcome');
      if (welcomeEl) {
        const titleEl = welcomeEl.querySelector('h3');
        const textEl = welcomeEl.querySelector('p');
        if (titleEl) titleEl.textContent = labels.welcomeTitle;
        if (textEl) textEl.textContent = labels.welcomeText;
      }
    }

    selectLanguage(code, label) {
      if (!code) return;
      const langData = LANGUAGE_INSTRUCTIONS[code] || LANGUAGE_INSTRUCTIONS.en;
      this.selectedLanguage = code;
      this.conversationHistory = [];

      const buttons = this.langPanel.querySelectorAll('.exo-cb-language-btn');
      buttons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === code);
      });

      this.updateUIForLanguage(code);
      this.hideLanguagePanel();
      this.quickActions.style.display = 'flex';

      this.addBotMessage(langData.acknowledgement);
      this.sendBtn.disabled = false;
      this.input.focus();
    }

    addBotMessage(text) {
      const formatted = formatBotResponse(text);
      const msgEl = document.createElement('div');
      msgEl.className = 'exo-cb-msg bot';
      msgEl.innerHTML = `
        <div class="exo-cb-msg-avatar">${ICON_BOT}</div>
        <div class="exo-cb-bubble">${formatted}</div>
      `;
      this.messages.appendChild(msgEl);
      this.scrollToBottom();
    }

    addUserMessage(text) {
      const safe = sanitizeInput(text);
      const msgEl = document.createElement('div');
      msgEl.className = 'exo-cb-msg user';
      msgEl.innerHTML = `
        <div class="exo-cb-msg-avatar">${ICON_USER}</div>
        <div class="exo-cb-bubble">${safe}</div>
      `;
      this.messages.appendChild(msgEl);
      this.scrollToBottom();
    }

    showTyping() {
      const el = document.createElement('div');
      el.className = 'exo-cb-msg bot';
      el.id = 'exo-cb-typing-indicator';
      el.innerHTML = `
        <div class="exo-cb-msg-avatar">${ICON_BOT}</div>
        <div class="exo-cb-bubble exo-cb-typing">
          <div class="exo-cb-typing-dot"></div>
          <div class="exo-cb-typing-dot"></div>
          <div class="exo-cb-typing-dot"></div>
        </div>
      `;
      this.messages.appendChild(el);
      this.scrollToBottom();
    }

    hideTyping() {
      const el = document.getElementById('exo-cb-typing-indicator');
      if (el) el.remove();
    }

    addWhatsAppPrompt() {
      if (this.hasShownWhatsAppPrompt) return;
      this.hasShownWhatsAppPrompt = true;
      const prompt = document.createElement('div');
      prompt.className = 'exo-cb-msg bot exo-cb-followup';
      const labels = UI_LABELS[this.selectedLanguage] || UI_LABELS.en;
      const whText = labels.whatsAppPrompt || 'For faster support, click the button below and send your message on WhatsApp.';
      const btnText = labels.whatsAppButton || 'Connect on WhatsApp';
      const prefill = WHATSAPP_MESSAGES[this.selectedLanguage] || WHATSAPP_MESSAGES.en;
      const url = `${WHATSAPP_URL}?text=${encodeURIComponent(prefill)}`;

      prompt.innerHTML = `
        <div class="exo-cb-msg-avatar">${ICON_BOT}</div>
        <div class="exo-cb-bubble">
          ${whText}
          <div class="exo-cb-whatsapp-action">
            <a href="${url}" target="_blank" rel="noopener noreferrer">${btnText}</a>
          </div>
        </div>
      `;
      this.messages.appendChild(prompt);
      this.scrollToBottom();
    }

    scrollToBottom() {
      requestAnimationFrame(() => {
        this.messages.scrollTop = this.messages.scrollHeight;
      });
    }

    async sendMessage() {
      const rawText = this.input.value.trim();
      if (!rawText || this.isLoading) return;

      const now = Date.now();
      if (now - this.lastRequestTime < RATE_LIMIT_MS) {
        this.showError('Please wait a moment before sending another message.');
        return;
      }

      this.hideError();
      this.isLoading = true;
      this.lastRequestTime = now;
      this.sendBtn.disabled = true;
      this.input.value = '';
      this.input.style.height = 'auto';

      if (this.quickActions.style.display !== 'none') {
        this.quickActions.style.display = 'none';
      }

      this.addUserMessage(rawText);
      this.showTyping();

      this.conversationHistory.push({
        role: 'user',
        parts: [{ text: rawText.slice(0, MAX_INPUT_LENGTH) }]
      });

      if (this.conversationHistory.length > MAX_HISTORY_TURNS * 2) {
        this.conversationHistory = this.conversationHistory.slice(-MAX_HISTORY_TURNS * 2);
      }

      try {
        const responseText = await this.callGemini();
        this.hideTyping();
        this.addBotMessage(responseText);
        this.addWhatsAppPrompt();

        this.conversationHistory.push({
          role: 'model',
          parts: [{ text: responseText }]
        });
      } catch (err) {
        this.hideTyping();
        if (err.isRateLimit) {
          this.addBotMessage("I'm experiencing high demand right now. Please try again in about 30 seconds. In the meantime, feel free to browse our **[Properties](properties.html)** or **[Contact us](contact.html)** directly.");
          this.conversationHistory.pop();
        } else {
          const fallback = this.getFallbackResponse(rawText);
          this.addBotMessage(fallback);
        }
      } finally {
        this.isLoading = false;
        this.sendBtn.disabled = !this.input.value.trim();
      }
    }

    async callGemini(retryCount = 0) {
      let systemText = SITE_KNOWLEDGE;

      let languageContents = [];
      if (this.selectedLanguage) {
        const langData = LANGUAGE_INSTRUCTIONS[this.selectedLanguage] || LANGUAGE_INSTRUCTIONS.en;
        systemText += `\n\n${langData.prompt} Always answer the user in ${langData.label} only. Do not use English or any other language. If the user writes in another language, still reply in ${langData.label}. Do not display raw phone numbers in the chat; instead suggest the WhatsApp button or the contact page.`;
        languageContents = [{
          role: 'user',
          parts: [{ text: `${langData.prompt} Please answer every follow-up message in ${langData.label}. Do not show direct phone numbers. Refer the user to the WhatsApp button or contact page.` }]
        }];
      }

      const requestBody = {
        systemInstruction: {
          parts: [{ text: systemText }]
        },
        contents: [...languageContents, ...this.conversationHistory],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 512
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(GEMINI_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => '');
          console.error('[ExoChatbot] API error', response.status, errorBody);
          if (response.status === 429) {
            const rateLimitErr = new Error('RATE_LIMITED');
            rateLimitErr.isRateLimit = true;
            throw rateLimitErr;
          }
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        const candidate = data?.candidates?.[0];
        if (!candidate || !candidate.content?.parts?.[0]?.text) {
          console.error('[ExoChatbot] Unexpected response structure', JSON.stringify(data).slice(0, 500));
          if (candidate?.finishReason === 'SAFETY') {
            return localizeSafetyResponse(this.selectedLanguage);
          }
          throw new Error('Empty response from API');
        }

        return candidate.content.parts[0].text;
      } catch (err) {
        clearTimeout(timeout);
        console.error('[ExoChatbot] Request failed', err.message || err);

        if (err.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.callGemini(retryCount + 1);
        }
        throw err;
      }
    }

    getFallbackResponse(userInput) {
      const input = (userInput || '').toLowerCase();
      let fallbackKey = 'default';

      if (input.match(/propert|villa|apartment|house|listing|buy/)) {
        fallbackKey = 'properties';
      } else if (input.match(/golden\s?visa|invest|residenc/)) {
        fallbackKey = 'goldenvisa';
      } else if (input.match(/contact|phone|email|call|reach|whatsapp/)) {
        fallbackKey = 'contact';
      } else if (input.match(/team|agent|consult|advisor/)) {
        fallbackKey = 'team';
      } else if (input.match(/about|company|who|history|ami/)) {
        fallbackKey = 'about';
      } else if (input.match(/office|location|address|where/)) {
        fallbackKey = 'office';
      } else if (input.match(/price|cost|how much|afford/)) {
        fallbackKey = 'price';
      } else if (input.match(/portugal|safe|live|move|expat/)) {
        fallbackKey = 'portugal';
      } else if (input.match(/project|sporting|abrantes|santarem|padel/)) {
        fallbackKey = 'project';
      }

      return localizeFallback(fallbackKey, this.selectedLanguage);
    }

  }

  /* ─────────────────────────────────────────────
     INITIALIZATION
  ───────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ExoChatbot());
  } else {
    new ExoChatbot();
  }
})();
