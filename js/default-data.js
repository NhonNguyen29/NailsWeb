/* ==========================================================================
   NAILS SALON PRO — DEFAULT DATA (ENGLISH)
   Shared across all 10 Index Templates & Admin/Staff Portal
   ========================================================================== */

(function (global) {
  'use strict';

  const FALLBACK_SVG =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f3e7e9"/>
            <stop offset="100%" stop-color="#e3eeff"/>
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b5b63" font-family="Georgia,serif" font-size="28">LUMIERE NAIL ATELIER</text>
      </svg>`
    );

  const todayISO = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const tomorrowISO = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const THEMES = [
    {
      id: 1,
      file: 'index-1.html',
      name: 'Maison Rose',
      style: 'Parisian Luxury & Rose Gold',
      layout: 'split-editorial',
      palette: ['#FDF8F5', '#B76E79', '#2A1F21', '#EEDCD6'],
      fonts: 'Playfair Display + Plus Jakarta Sans',
      description: 'Soft champagne surfaces, rose-gold accents, and timeless Parisian elegance.'
    },
    {
      id: 2,
      file: 'index-2.html',
      name: 'Onyx & Gold',
      style: 'Dark Mode Haute Couture',
      layout: 'centered-couture',
      palette: ['#0E0E10', '#D4AF37', '#F5F1E8', '#1C1B20'],
      fonts: 'Cormorant Garamond + Montserrat',
      description: 'Dramatic obsidian backdrop paired with brushed gold borders and luxury editorial typography.'
    },
    {
      id: 3,
      file: 'index-3.html',
      name: 'Kanso Studio',
      style: 'Japanese Minimalist Organic',
      layout: 'minimal-grid',
      palette: ['#F7F5F0', '#5C574F', '#1F1E1C', '#E6E1D6'],
      fonts: 'Shippori Mincho + Inter',
      description: 'Calm, gallery-like serenity with generous whitespace and crisp architectural lines.'
    },
    {
      id: 4,
      file: 'index-4.html',
      name: 'Botanica Spa',
      style: 'Organic Sage & Wellness',
      layout: 'botanical-split',
      palette: ['#F4F7F3', '#4E6E58', '#1F2D24', '#DCE6DC'],
      fonts: 'Fraunces + DM Sans',
      description: 'Fresh botanical sage greens and soft organic curves tailored for non-toxic spa salons.'
    },
    {
      id: 5,
      file: 'index-5.html',
      name: 'Blush Bar',
      style: 'Modern Trendy Nail Bar',
      layout: 'playful-cards',
      palette: ['#FFF2F6', '#E84A7F', '#2E1420', '#FFD6E5'],
      fonts: 'Outfit + Quicksand',
      description: 'Vibrant pastel pink aesthetics with pill-shaped cards and lively social-ready energy.'
    },
    {
      id: 6,
      file: 'index-6.html',
      name: 'Vogue Atelier',
      style: 'Monochrome Editorial Magazine',
      layout: 'magazine-masthead',
      palette: ['#FFFFFF', '#111111', '#4A4A4A', '#F2F2F2'],
      fonts: 'Bodoni Moda + Space Grotesk',
      description: 'High-contrast black & white fashion magazine grid with oversized serif headlines.'
    },
    {
      id: 7,
      file: 'index-7.html',
      name: 'Coastal Pearl',
      style: 'Resort Ocean & Pearl Shimmer',
      layout: 'coastal-glass',
      palette: ['#F2F8FA', '#2E7D8C', '#16313A', '#D7ECF2'],
      fonts: 'Prata + Nunito Sans',
      description: 'Breezy coastal blues, soft frosted glass cards, and relaxed resort spa atmosphere.'
    },
    {
      id: 8,
      file: 'index-8.html',
      name: 'Velvet Bordeaux',
      style: 'Evening Burgundy Glamour',
      layout: 'classic-frame',
      palette: ['#1D0C12', '#D8A48F', '#FDF4F0', '#361621'],
      fonts: 'Cinzel + Lato',
      description: 'Deep velvet wine tones with rose-champagne details for an upscale evening nail lounge.'
    },
    {
      id: 9,
      file: 'index-9.html',
      name: 'Terracotta Sun',
      style: 'Bohemian Clay & Desert Spa',
      layout: 'arch-boho',
      palette: ['#FAF3EB', '#C46D4E', '#33221B', '#EFE0D0'],
      fonts: 'Libre Baskerville + Work Sans',
      description: 'Warm desert clay hues, arched photo frames, and sun-soaked artisanal charm.'
    },
    {
      id: 10,
      file: 'index-10.html',
      name: 'Aura Chrome',
      style: 'Futuristic Y2K & Nail Art Lab',
      layout: 'aura-chrome',
      palette: ['#120F24', '#C084FC', '#F8F7FF', '#241E46'],
      fonts: 'Syne + Inter',
      description: 'Iridescent lavender gradients, chrome glassmorphism, and bold creative nail art lab vibes.'
    }
  ];

  const DEFAULT_DATA = {
    version: 1,
    updatedAt: new Date().toISOString(),
    site: {
      brandName: 'Lumiere Nail Atelier',
      tagline: 'Artisanal Nail Care & Bespoke Nail Art Studio',
      announcement: 'New Spring Chrome & Japanese Soft Gel Collection — Book Online Today!',
      heroEyebrow: 'LUXURY NAIL LOUNGE & SPA',
      heroTitle: 'Refined Nail Artistry Crafted for Everyday Elegance',
      heroSubtitle:
        'Experience hospital-grade sterilization, non-toxic Japanese & Korean gels, and bespoke nail designs in a serene sanctuary.',
      heroImage:
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=85',
      aboutTitle: 'Where Precision Meets Relaxation',
      aboutText:
        'At Lumiere Nail Atelier, every appointment is an unhurried ritual. Our licensed nail artists blend cutting-edge Russian manicure precision with nourishing botanical spa treatments so your nails stay healthy, luminous, and effortlessly chic.',
      aboutImage:
        'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1000&q=85',
      phoneDisplay: '(310) 555-0198',
      phoneRaw: '+13105550198',
      email: 'hello@lumierenailatelier.com',
      address: '428 Beverly Blvd, Suite 204, Los Angeles, CA 90048',
      openHour: 9,
      closeHour: 19,
      hours: [
        { day: 'Monday – Friday', time: '9:00 AM – 7:00 PM' },
        { day: 'Saturday', time: '9:00 AM – 6:30 PM' },
        { day: 'Sunday', time: '10:00 AM – 5:00 PM' }
      ],
      instagram: '@lumierenailatelier',
      facebook: 'Lumiere Nail Atelier'
    },
    menuCategories: ['Manicure', 'Pedicure', 'Extensions', 'Nail Art', 'Spa Add-Ons'],
    menu: [
      {
        id: 'srv-1',
        name: 'Signature Russian Dry Manicure',
        category: 'Manicure',
        price: 55,
        duration: '50 min',
        description: 'Precision e-file cuticle care, structured builder base, and glossy gel polish finish.',
        image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80',
        featured: true
      },
      {
        id: 'srv-2',
        name: 'Japanese Soft Gel Manicure',
        category: 'Manicure',
        price: 65,
        duration: '60 min',
        description: 'Ultra-flexible, soak-off Japanese potted gel engineered for 4-week chip-free wear.',
        image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=700&q=80',
        featured: true
      },
      {
        id: 'srv-3',
        name: 'Classic Botanical Manicure',
        category: 'Manicure',
        price: 35,
        duration: '35 min',
        description: 'Nail shaping, gentle cuticle conditioning, warm towel wrap, massage, and non-toxic lacquer.',
        image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=700&q=80',
        featured: false
      },
      {
        id: 'srv-4',
        name: 'Rose Quartz Luxury Spa Pedicure',
        category: 'Pedicure',
        price: 75,
        duration: '65 min',
        description: 'Mineral rose soak, sugar exfoliation, callus smoothing, hot stone massage, and gel polish.',
        image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=700&q=80',
        featured: true
      },
      {
        id: 'srv-5',
        name: 'Organic Green Tea Detox Pedicure',
        category: 'Pedicure',
        price: 62,
        duration: '55 min',
        description: 'Antioxidant matcha soak, clay mask, hydrating shea butter massage, and polish of choice.',
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80',
        featured: false
      },
      {
        id: 'srv-6',
        name: 'Gel-X Soft Gel Extensions (Full Set)',
        category: 'Extensions',
        price: 85,
        duration: '75 min',
        description: 'Lightweight, odor-free full-coverage soft gel extensions in Almond, Coffin, or Stiletto.',
        image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=700&q=80',
        featured: true
      },
      {
        id: 'srv-7',
        name: 'Hard Gel Sculpted Overlay / Fill',
        category: 'Extensions',
        price: 78,
        duration: '70 min',
        description: 'Custom-sculpted builder hard gel for maximum strength and natural apex silhouette.',
        image: 'https://images.unsplash.com/photo-1583255448430-17c5eda08e5c?auto=format&fit=crop&w=700&q=80',
        featured: false
      },
      {
        id: 'srv-8',
        name: 'Glazed Pearl Chrome Finish',
        category: 'Nail Art',
        price: 20,
        duration: '15 min',
        description: 'Mirror-sheen pearl, champagne, or holographic chrome powder buffed over any gel set.',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=700&q=80',
        featured: true
      },
      {
        id: 'srv-9',
        name: 'Bespoke Hand-Painted Nail Art (Tier 2)',
        category: 'Nail Art',
        price: 38,
        duration: '30 min',
        description: 'French micro-tips, velvet cat-eye aura, 3D sculpted gel, or delicate botanical motifs.',
        image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80',
        featured: false
      },
      {
        id: 'srv-10',
        name: 'Warm Paraffin Hand & Foot Therapy',
        category: 'Spa Add-Ons',
        price: 25,
        duration: '20 min',
        description: 'Deeply restorative warm vitamin-E paraffin dip for silky-soft skin and joint relief.',
        image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=700&q=80',
        featured: false
      }
    ],
    gallery: [
      {
        id: 'gal-1',
        title: 'Champagne Glazed Almond',
        category: 'Manicure',
        caption: 'Sheer milky pink base topped with mirror pearl chrome.',
        image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'gal-2',
        title: 'Velvet Rose Micro-French',
        category: 'Nail Art',
        caption: 'Hand-drawn ultra-thin French tips over structured Russian manicure.',
        image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'gal-3',
        title: 'Sculpted Gel-X Coffin',
        category: 'Extensions',
        caption: 'Medium coffin soft-gel extensions in muted cashmere beige.',
        image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'gal-4',
        title: 'Botanical Petal Aura',
        category: 'Nail Art',
        caption: 'Airbrushed blush aura with subtle gold leaf accents.',
        image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'gal-5',
        title: 'Rose Quartz Spa Ritual',
        category: 'Pedicure',
        caption: 'Mineral soak and glossy neutral gel pedicure.',
        image: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'gal-6',
        title: 'Minimalist Sheer Nude',
        category: 'Manicure',
        caption: 'Clean-girl Japanese soft gel in translucent ballet slipper.',
        image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'gal-7',
        title: 'Editorial Noir & Gold',
        category: 'Extensions',
        caption: 'High-gloss obsidian almond set with brushed gold line art.',
        image: 'https://images.unsplash.com/photo-1583255448430-17c5eda08e5c?auto=format&fit=crop&w=900&q=80'
      },
      {
        id: 'gal-8',
        title: 'Classic Ruby Gloss',
        category: 'Manicure',
        caption: 'Timeless deep crimson lacquer with glass-like top coat.',
        image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=900&q=80'
      }
    ],
    technicians: [
      'Any Available Technician',
      'Elena Vo — Master Nail Artist',
      'Chloe Nguyen — Japanese Gel Specialist',
      'Sophia Tran — Bespoke Nail Art',
      'Maya Lin — Luxury Spa Pedicure'
    ],
    timeSlots: [
      '09:30 AM',
      '10:30 AM',
      '11:30 AM',
      '01:00 PM',
      '02:00 PM',
      '03:00 PM',
      '04:00 PM',
      '05:00 PM',
      '06:00 PM'
    ],
    bookings: [
      {
        id: 'BK-2041',
        date: todayISO(),
        time: '11:30 AM',
        serviceId: 'srv-1',
        serviceName: 'Signature Russian Dry Manicure',
        price: 55,
        technician: 'Elena Vo — Master Nail Artist',
        customerName: 'Hannah Brooks',
        customerPhone: '(310) 555-0142',
        customerEmail: 'hannah.b@example.com',
        notes: 'Prefers sheer milky pink shade.',
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'BK-2042',
        date: tomorrowISO(),
        time: '02:00 PM',
        serviceId: 'srv-6',
        serviceName: 'Gel-X Soft Gel Extensions (Full Set)',
        price: 85,
        technician: 'Chloe Nguyen — Japanese Gel Specialist',
        customerName: 'Olivia Park',
        customerPhone: '(310) 555-0188',
        customerEmail: 'olivia.p@example.com',
        notes: 'Short almond shape + pearl chrome.',
        status: 'Pending',
        createdAt: new Date().toISOString()
      }
    ],
    callbacks: [
      {
        id: 'CB-101',
        name: 'Rachel Miller',
        phone: '(310) 555-0163',
        preferredTime: 'Today Afternoon',
        note: 'Asking about bridal group booking for 4 guests.',
        status: 'New',
        createdAt: new Date().toISOString()
      }
    ],
    messages: [
      {
        id: 'MSG-301',
        name: 'Claire Bennett',
        email: 'claire.b@example.com',
        phone: '(310) 555-0129',
        subject: 'Gift Card Inquiry',
        message: 'Do you offer digital gift cards for Mother’s Day?',
        createdAt: new Date().toISOString()
      }
    ]
  };

  global.NAIL_SALON_THEMES = THEMES;
  global.NAIL_SALON_DEFAULTS = DEFAULT_DATA;
  global.NAIL_SALON_FALLBACK_IMG = FALLBACK_SVG;
})(window);
