const API_BASE = 'https://lakta-backend.onrender.com';

const translations = {
  en: {
    brandName: 'لَقْطة',
    navHome: 'Home',
    navServices: 'Services',
    navOffers: 'Offers',
    navPortfolio: 'Portfolio',
    navRequest: 'Request a Website',
    navContact: 'Contact',
    orderCta: 'Order Your Website',
    heroKicker: 'Websites That Convert Your Instagram Followers',
    heroTitle: 'Turn your Instagram traffic into real clients',
    heroSubtitle:
      'We design fast, modern, mobile-first websites tailored for businesses that grow through Instagram and social media.',
    heroPrimaryCta: 'Order Your Website',
    heroSecondaryCta: 'View Portfolio',
    heroMeta1: 'Ready in as fast as 7 days',
    heroMeta2: 'Optimized for Instagram traffic',
    heroBadge: 'Perfect for Instagram campaigns',
    servicesTitle: 'Services',
    servicesSubtitle:
      'Everything you need to launch a professional online presence for your Instagram audience.',
    serviceBusinessTitle: 'Business Websites',
    serviceBusinessBody:
      'Clean, credible websites for companies that want to turn Instagram visitors into real inquiries and bookings.',
    serviceStoreTitle: 'Online Stores',
    serviceStoreBody:
      'Simple, conversion-focused store layouts that make it easy for your followers to browse and buy.',
    serviceLandingTitle: 'Landing Pages',
    serviceLandingBody:
      'High-impact pages for ads and campaigns that come directly from your Instagram bio or stories.',
    servicePortfolioTitle: 'Portfolio Websites',
    servicePortfolioBody:
      'Minimal portfolio sites that showcase your work, testimonials, and Instagram content beautifully.',
    offersTitle: 'Current Offers',
    offersSubtitle:
      'Limited-time packages created especially for businesses growing through Instagram.',
    offersEmpty:
      'No active offers at the moment. Follow our Instagram for upcoming discounts.',
    portfolioTitle: 'Portfolio',
    portfolioSubtitle:
      'A taste of clean, modern websites we can design for your business.',
    requestTitle: 'Request a Website',
    requestSubtitle:
      'Tell us what you need and we’ll contact you with a clear plan, timeline, and price.',
    formNameLabel: 'Name',
    formEmailLabel: 'Email',
    formPhoneLabel: 'Phone (WhatsApp)',
    formTypeLabel: 'Type of website',
    formTypePlaceholder: 'Choose a type',
    formTypeBusiness: 'Business website',
    formTypeStore: 'Online store',
    formTypeLanding: 'Landing page',
    formTypePortfolio: 'Portfolio website',
    formTypeOther: 'Other',
    formMessageLabel: 'Project details',
    formHint: 'We’ll reply within 24 hours via WhatsApp or email with the next steps.',
    formSubmit: 'Submit Request',
    footerCopy: '© {{year}} Lakta. All rights reserved.',
  },
  ar: {
    brandName: 'لَقْطة',
    navHome: 'الرئيسية',
    navServices: 'الخدمات',
    navOffers: 'العروض',
    navPortfolio: 'الأعمال',
    navRequest: 'اطلب موقعك',
    navContact: 'تواصل معنا',
    orderCta: 'اطلب موقعك الآن',
    heroKicker: 'مواقع تحول متابعين انستجرام إلى عملاء',
    heroTitle: 'حوّل زيارات الانستجرام إلى عملاء حقيقيين',
    heroSubtitle:
      'نصمم مواقع عصرية وسريعة ومتجاوبة مع الجوال، مخصصة للأعمال التي تعتمد على الانستجرام والسوشال ميديا.',
    formSubmit: 'إرسال الطلب',
    footerCopy: '© {{year}} لَقْطة. جميع الحقوق محفوظة.',
  },
};

function setLanguage(lang) {
  const dict = translations[lang] || translations.en;

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = dict[key];
    if (!value) return;

    if (key === 'footerCopy') {
      const year = new Date().getFullYear();
      el.textContent = value.replace('{{year}}', year);
    } else {
      el.textContent = value;
    }
  });

  localStorage.setItem('siteLang', lang);
}

function initLanguage() {
  const stored = localStorage.getItem('siteLang');
  const initial = stored === 'ar' || stored === 'en' ? stored : 'en';
  setLanguage(initial);

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });
}

async function loadOffers(lang) {
  const container = document.getElementById('offersList');
  const empty = document.getElementById('offersEmpty');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/offers`);
    const offers = await res.json();

    container.innerHTML = '';

    if (!offers.length) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';

    offers.forEach((offer) => {
      const title = lang === 'ar' ? offer.titleAr : offer.titleEn;
      const desc = lang === 'ar' ? offer.descriptionAr : offer.descriptionEn;

      const card = document.createElement('article');
      card.className = 'card';

      card.innerHTML = `
        <h3>${title}</h3>
        <p>${desc || ''}</p>
        ${offer.price ? `<p class="offer-price">${offer.price}</p>` : ''}
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadPortfolio(lang) {
  const container = document.getElementById('portfolioList');
  const empty = document.getElementById('portfolioEmpty');

  try {
    const res = await fetch(`${API_BASE}/api/portfolio`);
    const items = await res.json();

    container.innerHTML = '';

    if (!items.length) {
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';

    items.forEach((item) => {
      const title = lang === 'ar' ? item.titleAr : item.titleEn;
      const desc = lang === 'ar' ? item.descriptionAr : item.descriptionEn;

      const card = document.createElement('article');
      card.className = 'card';

      card.innerHTML = `
        <h3>${title}</h3>
        <p>${desc || ''}</p>
        ${item.tag ? `<p>${item.tag}</p>` : ''}
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

function initForm() {
  const form = document.getElementById('requestForm');
  const status = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      websiteType: form.websiteType.value,
      message: form.message.value,
    };

    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      form.reset();
      status.textContent = 'Request sent successfully.';
      status.className = 'success';
    } catch (err) {
      status.textContent = 'Failed to send request.';
      status.className = 'error';
    }
  });
}

async function initContact() {
  try {
    const res = await fetch(`${API_BASE}/api/contact`);
    const contact = await res.json();

    const email = document.getElementById('contactEmailLink');
    const wa = document.getElementById('contactWhatsAppLink');
    const insta = document.getElementById('contactInstagramLink');

    if (contact.email) {
      email.href = `mailto:${contact.email}`;
      email.textContent = contact.email;
    }

    if (contact.phone) {
      wa.href = `https://wa.me/${contact.phone.replace(/\D/g, '')}`;
    }

    if (contact.instagram) {
      insta.href = contact.instagram;
    }
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('siteLang') || 'en';

  initLanguage();
  loadOffers(lang);
  loadPortfolio(lang);
  initForm();
  initContact();
});
// Smooth scroll for all buttons with data-scroll-target
document.querySelectorAll('[data-scroll-target]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-scroll-target');
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });
});
