const API_BASE = 'http://localhost:3000';

async function fetchJSON(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  const res = await fetch(fullUrl, options);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

async function loadRequests() {
  const tbody = document.getElementById('requestsTableBody');
  if (!tbody) return;
  try {
    const requests = await fetchJSON('/api/requests');
    tbody.innerHTML = '';
    if (!requests.length) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="6" class="table-empty">No requests yet.</td>`;
      tbody.appendChild(row);
      return;
    }
    requests.forEach((req) => {
      const row = document.createElement('tr');
      const created = new Date(req.createdAt);
      row.innerHTML = `
        <td>${created.toLocaleString()}</td>
        <td>${req.name}</td>
        <td>${req.email}</td>
        <td>${req.phone}</td>
        <td>${req.websiteType}</td>
        <td>${req.message || ''}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Failed to load requests', err);
    tbody.innerHTML = `<tr><td colspan="6" class="table-empty">Failed to load requests.</td></tr>`;
  }
}

function renderAdminOffers(offers) {
  const list = document.getElementById('adminOffersList');
  if (!list) return;
  list.innerHTML = '';

  if (!offers.length) {
    list.innerHTML =
      '<p class="empty-text">No offers yet. Create your first offer using the form.</p>';
    return;
  }

  offers.forEach((offer) => {
    const item = document.createElement('div');
    item.className = 'admin-offer-item';
    item.innerHTML = `
      <div class="admin-offer-title"><strong>${offer.titleEn}</strong> / ${offer.titleAr}</div>
      <div class="admin-offer-meta">
        ${offer.price ? `<span>${offer.price}</span>` : ''}
        ${offer.highlight ? '<span class="offer-pill">★ Highlight</span>' : ''}
      </div>
      <div class="admin-offer-actions">
        <button class="btn btn-outline" data-action="edit" data-id="${offer.id}">Edit</button>
        <button class="btn btn-ghost" data-action="delete" data-id="${offer.id}">Delete</button>
      </div>
    `;
    list.appendChild(item);
  });
}

async function loadOffersForAdmin() {
  try {
    const offers = await fetchJSON('/api/offers');
    renderAdminOffers(offers);
  } catch (err) {
    console.error('Failed to load offers', err);
  }
}

function fillOfferForm(offer) {
  document.getElementById('offerId').value = offer.id || '';
  document.getElementById('titleEn').value = offer.titleEn || '';
  document.getElementById('titleAr').value = offer.titleAr || '';
  document.getElementById('descriptionEn').value = offer.descriptionEn || '';
  document.getElementById('descriptionAr').value = offer.descriptionAr || '';
  document.getElementById('price').value = offer.price || '';
  document.getElementById('highlight').checked = !!offer.highlight;
  document.getElementById('offerSubmitBtn').textContent = 'Update Offer';
}

function resetOfferForm() {
  document.getElementById('offerId').value = '';
  document.getElementById('titleEn').value = '';
  document.getElementById('titleAr').value = '';
  document.getElementById('descriptionEn').value = '';
  document.getElementById('descriptionAr').value = '';
  document.getElementById('price').value = '';
  document.getElementById('highlight').checked = false;
  document.getElementById('offerSubmitBtn').textContent = 'Save Offer';
  const status = document.getElementById('offerFormStatus');
  status.textContent = '';
  status.className = 'form-status';
}

function initOfferForm() {
  const form = document.getElementById('offerForm');
  const status = document.getElementById('offerFormStatus');
  const resetBtn = document.getElementById('offerResetBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';

    const payload = {
      titleEn: document.getElementById('titleEn').value.trim(),
      titleAr: document.getElementById('titleAr').value.trim(),
      descriptionEn: document.getElementById('descriptionEn').value.trim(),
      descriptionAr: document.getElementById('descriptionAr').value.trim(),
      price: document.getElementById('price').value.trim(),
      highlight: document.getElementById('highlight').checked,
    };

    if (!payload.titleEn || !payload.titleAr) {
      status.textContent = 'Please provide titles in both languages.';
      status.classList.add('error');
      return;
    }

    const id = document.getElementById('offerId').value;
    const isUpdate = !!id;

    try {
      if (isUpdate) {
        await fetchJSON(`/api/offers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        status.textContent = 'Offer updated.';
      } else {
        await fetchJSON('/api/offers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        status.textContent = 'Offer created.';
      }
      status.classList.add('success');
      await loadOffersForAdmin();
      if (!isUpdate) {
        resetOfferForm();
      }
    } catch (err) {
      console.error(err);
      status.textContent = 'Failed to save offer.';
      status.classList.add('error');
    }
  });

  resetBtn.addEventListener('click', () => {
    resetOfferForm();
  });
}

function initOfferActions() {
  const list = document.getElementById('adminOffersList');
  if (!list) return;

  list.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === 'edit') {
      try {
        const offers = await fetchJSON('/api/offers');
        const offer = offers.find((o) => o.id === id);
        if (!offer) return;
        fillOfferForm(offer);
        document.getElementById('admin-offers').scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error(err);
      }
    }

    if (action === 'delete') {
      const confirmDelete = window.confirm('Delete this offer?');
      if (!confirmDelete) return;
      try {
        await fetchJSON(`/api/offers/${id}`, { method: 'DELETE' });
        await loadOffersForAdmin();
        resetOfferForm();
      } catch (err) {
        console.error(err);
        alert('Failed to delete offer.');
      }
    }
  });
}

async function loadContact() {
  const emailInput = document.getElementById('contactEmail');
  const phoneInput = document.getElementById('contactPhone');
  const instaInput = document.getElementById('contactInstagram');
  if (!emailInput || !phoneInput || !instaInput) return;
  try {
    const contact = await fetchJSON('/api/contact');
    emailInput.value = contact.email || '';
    phoneInput.value = contact.phone || '';
    instaInput.value = contact.instagram || '';
  } catch (err) {
    console.error('Failed to load contact info', err);
  }
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactFormStatus');
  if (!form || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';

    const payload = {
      email: document.getElementById('contactEmail').value.trim(),
      phone: document.getElementById('contactPhone').value.trim(),
      instagram: document.getElementById('contactInstagram').value.trim(),
    };

    try {
      await fetchJSON('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      status.textContent = 'Contact information saved.';
      status.classList.add('success');
    } catch (err) {
      console.error(err);
      status.textContent = 'Failed to save contact info.';
      status.classList.add('error');
    }
  });
}

function renderAdminPortfolio(items) {
  const list = document.getElementById('adminPortfolioList');
  if (!list) return;
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML =
      '<p class="empty-text">No projects yet. Add your first one using the form.</p>';
    return;
  }

  items.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'admin-offer-item';
    el.innerHTML = `
      <div class="admin-offer-title"><strong>${item.titleEn}</strong> / ${item.titleAr}</div>
      <div class="admin-offer-meta">
        ${item.tag ? `<span>${item.tag}</span>` : ''}
      </div>
      <div class="admin-offer-actions">
        <button class="btn btn-outline" data-port-action="edit" data-id="${item.id}">Edit</button>
        <button class="btn btn-ghost" data-port-action="delete" data-id="${item.id}">Delete</button>
      </div>
    `;
    list.appendChild(el);
  });
}

async function loadPortfolioForAdmin() {
  try {
    const items = await fetchJSON('/api/portfolio');
    renderAdminPortfolio(items);
  } catch (err) {
    console.error('Failed to load portfolio', err);
  }
}

function fillPortfolioForm(item) {
  document.getElementById('portfolioId').value = item.id || '';
  document.getElementById('portfolioTitleEn').value = item.titleEn || '';
  document.getElementById('portfolioTitleAr').value = item.titleAr || '';
  document.getElementById('portfolioDescEn').value = item.descriptionEn || '';
  document.getElementById('portfolioDescAr').value = item.descriptionAr || '';
  document.getElementById('portfolioTag').value = item.tag || '';
  document.getElementById('portfolioSubmitBtn').textContent = 'Update Project';
}

function resetPortfolioForm() {
  document.getElementById('portfolioId').value = '';
  document.getElementById('portfolioTitleEn').value = '';
  document.getElementById('portfolioTitleAr').value = '';
  document.getElementById('portfolioDescEn').value = '';
  document.getElementById('portfolioDescAr').value = '';
  document.getElementById('portfolioTag').value = '';
  document.getElementById('portfolioSubmitBtn').textContent = 'Save Project';
  const status = document.getElementById('portfolioFormStatus');
  status.textContent = '';
  status.className = 'form-status';
}

function initPortfolioForm() {
  const form = document.getElementById('portfolioForm');
  const status = document.getElementById('portfolioFormStatus');
  const resetBtn = document.getElementById('portfolioResetBtn');
  if (!form || !status || !resetBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'form-status';

    const payload = {
      titleEn: document.getElementById('portfolioTitleEn').value.trim(),
      titleAr: document.getElementById('portfolioTitleAr').value.trim(),
      descriptionEn: document.getElementById('portfolioDescEn').value.trim(),
      descriptionAr: document.getElementById('portfolioDescAr').value.trim(),
      tag: document.getElementById('portfolioTag').value.trim(),
    };

    if (!payload.titleEn || !payload.titleAr) {
      status.textContent = 'Please provide titles in both languages.';
      status.classList.add('error');
      return;
    }

    const id = document.getElementById('portfolioId').value;
    const isUpdate = !!id;

    try {
      if (isUpdate) {
        await fetchJSON(`/api/portfolio/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        status.textContent = 'Project updated.';
      } else {
        await fetchJSON('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        status.textContent = 'Project created.';
      }
      status.classList.add('success');
      await loadPortfolioForAdmin();
      if (!isUpdate) {
        resetPortfolioForm();
      }
    } catch (err) {
      console.error(err);
      status.textContent = 'Failed to save project.';
      status.classList.add('error');
    }
  });

  resetBtn.addEventListener('click', () => {
    resetPortfolioForm();
  });
}

function initPortfolioActions() {
  const list = document.getElementById('adminPortfolioList');
  if (!list) return;

  list.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-port-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.portAction;

    if (action === 'edit') {
      try {
        const items = await fetchJSON('/api/portfolio');
        const item = items.find((p) => p.id === id);
        if (!item) return;
        fillPortfolioForm(item);
        document.getElementById('admin-portfolio').scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error(err);
      }
    }

    if (action === 'delete') {
      const confirmDelete = window.confirm('Delete this project?');
      if (!confirmDelete) return;
      try {
        await fetchJSON(`/api/portfolio/${id}`, { method: 'DELETE' });
        await loadPortfolioForAdmin();
        resetPortfolioForm();
      } catch (err) {
        console.error(err);
        alert('Failed to delete project.');
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadRequests();
  loadOffersForAdmin();
  initOfferForm();
  initOfferActions();
  loadContact();
  initContactForm();
  loadPortfolioForAdmin();
  initPortfolioForm();
  initPortfolioActions();
});

