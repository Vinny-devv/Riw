// ==============================
// VINNY WEB — APP LOGIC
// ==============================

// ---- UTILITY ----
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getStatusBadge(status) {
  const map = { 'مستمرة': 'ongoing', 'مكتملة': 'completed', 'متوقفة': 'paused' };
  return map[status] || 'ongoing';
}

function getStatusEmoji(status) {
  const map = { 'مستمرة': '🟢', 'مكتملة': '✅', 'متوقفة': '🔴' };
  return map[status] || '🟢';
}

function coverPlaceholder(title) {
  return `<div class="novel-cover-placeholder"><span>📖</span></div>`;
}

function coverImg(cover, title) {
  if (cover && cover.trim()) {
    return `<img src="${cover}" alt="${title}" loading="lazy" onerror="this.parentElement.innerHTML=coverPlaceholder('${title}')" />`;
  }
  return coverPlaceholder(title);
}

// ---- NAVBAR ----
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ---- NOVEL CARD (grid) ----
function renderNovelCard(novel) {
  const chapters = DB.getChaptersByNovel(novel.id);
  const cats = (novel.categories || []).slice(0, 2).map(c =>
    `<span class="cat-tag">${c}</span>`
  ).join('');
  return `
    <div class="novel-card fade-up" onclick="location.href='novel.html?id=${novel.id}'">
      <div class="novel-cover">
        ${coverImg(novel.cover, novel.title)}
        ${novel.featured ? '<span class="cover-badge badge-featured">⭐ مميزة</span>' : ''}
        <span class="cover-badge badge-${getStatusBadge(novel.status)}" style="${novel.featured ? 'top:36px' : ''}">${novel.status}</span>
      </div>
      <div class="novel-info">
        <div class="novel-title">${novel.title}</div>
        <div class="novel-author">✍️ ${novel.author || 'غير معروف'}</div>
        <div class="novel-cats">${cats}</div>
        <div class="novel-meta">
          <span>📖 ${chapters.length} فصل</span>
          <span>👁️ ${(novel.views || 0).toLocaleString('ar')}</span>
        </div>
      </div>
    </div>`;
}

// ---- NOVEL LIST ITEM ----
function renderNovelListItem(novel) {
  const chapters = DB.getChaptersByNovel(novel.id);
  return `
    <div class="novel-list-item" onclick="location.href='novel.html?id=${novel.id}'">
      <div class="novel-list-cover">${coverImg(novel.cover, novel.title)}</div>
      <div class="novel-list-info">
        <div class="novel-list-title">${novel.title}</div>
        <div class="novel-list-desc">${novel.desc || ''}</div>
        <div class="novel-cats">
          ${(novel.categories || []).slice(0, 3).map(c => `<span class="cat-tag">${c}</span>`).join('')}
          <span class="cat-tag" style="background:transparent;color:var(--text-muted)">${getStatusEmoji(novel.status)} ${novel.status}</span>
          <span class="cat-tag" style="background:transparent;color:var(--text-muted)">📖 ${chapters.length} فصل</span>
        </div>
      </div>
    </div>`;
}

// ============================
// INDEX PAGE
// ============================
document.addEventListener('DOMContentLoaded', () => {
  // Check which page we're on
  const path = window.location.pathname;

  if (document.getElementById('featuredGrid')) initHomePage();
  if (document.getElementById('novelsList') && !path.includes('admin')) initLibraryPage();
  if (document.getElementById('novelDetail')) loadNovelDetail();
  if (document.getElementById('chapterContent')) loadChapter();
  if (path.includes('admin')) initAdmin();
  if (document.getElementById('allCatsGrid')) loadCategoriesPage();

  // Particles on hero
  if (document.getElementById('particles')) createParticles();
});

function initHomePage() {
  const novels = DB.getNovels();
  const stats = DB.getStats();

  // Animate stats
  animateCount('stat-novels', stats.novels);
  animateCount('stat-chapters', stats.chapters);
  animateCount('stat-readers', stats.readers);

  // Featured
  const featured = novels.filter(n => n.featured).slice(0, 4);
  const fg = document.getElementById('featuredGrid');
  if (fg) {
    if (featured.length === 0) {
      fg.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><h3>لا توجد روايات مميزة بعد</h3><p>أضف روايات من لوحة الإدارة</p></div>';
    } else {
      fg.innerHTML = featured.map(renderNovelCard).join('');
    }
  }

  // Latest
  const latest = novels.slice(0, 5);
  const ll = document.getElementById('latestList');
  if (ll) {
    if (latest.length === 0) {
      ll.innerHTML = '<div class="empty-state"><div class="empty-icon">📖</div><h3>لا توجد روايات بعد</h3></div>';
    } else {
      ll.innerHTML = latest.map(renderNovelListItem).join('');
    }
  }

  // Categories
  renderCatsSection();
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el || target === 0) return;
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current.toLocaleString('ar');
    if (current >= target) clearInterval(timer);
  }, 30);
}

function renderCatsSection() {
  const cats = DB.getCategories();
  const novels = DB.getNovels();
  const grid = document.getElementById('catsGrid');
  if (!grid) return;
  grid.innerHTML = cats.map(c => {
    const count = novels.filter(n => (n.categories || []).includes(c.name)).length;
    return `
      <div class="cat-card" onclick="location.href='categories.html?cat=${encodeURIComponent(c.name)}'">
        <div class="cat-icon">${c.icon}</div>
        <div class="cat-name">${c.name}</div>
        <div class="cat-count">${count} رواية</div>
      </div>`;
  }).join('');
}

function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      --dur: ${4 + Math.random() * 6}s;
      --delay: ${Math.random() * 6}s;
      width: ${1 + Math.random() * 3}px;
      height: ${1 + Math.random() * 3}px;
    `;
    container.appendChild(p);
  }
}

// ============================
// LIBRARY PAGE
// ============================
function initLibraryPage() {
  populateCatFilter();
  filterNovels();
}

function populateCatFilter() {
  const sel = document.getElementById('catFilter');
  if (!sel) return;
  const cats = DB.getCategories();
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.textContent = c.icon + ' ' + c.name;
    sel.appendChild(opt);
  });
}

let currentView = 'grid';
function setView(v) {
  currentView = v;
  document.getElementById('gridBtn').classList.toggle('active', v === 'grid');
  document.getElementById('listBtn').classList.toggle('active', v === 'list');
  filterNovels();
}

function filterNovels() {
  const search = (document.getElementById('searchInput')?.value || '').toLowerCase();
  const cat = document.getElementById('catFilter')?.value || '';
  const status = document.getElementById('statusFilter')?.value || '';
  const sort = document.getElementById('sortFilter')?.value || 'newest';

  let novels = DB.getNovels();

  if (search) {
    novels = novels.filter(n =>
      n.title.toLowerCase().includes(search) ||
      (n.author || '').toLowerCase().includes(search) ||
      (n.desc || '').toLowerCase().includes(search)
    );
  }
  if (cat) novels = novels.filter(n => (n.categories || []).includes(cat));
  if (status) novels = novels.filter(n => n.status === status);

  if (sort === 'popular') novels.sort((a, b) => (b.views || 0) - (a.views || 0));
  else if (sort === 'az') novels.sort((a, b) => a.title.localeCompare(b.title, 'ar'));

  const container = document.getElementById('novelsList');
  const countEl = document.getElementById('resultsCount');
  if (countEl) countEl.textContent = novels.length + ' رواية';

  if (!container) return;

  if (novels.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>لا نتائج</h3><p>جرّب تغيير معايير البحث</p></div>';
    return;
  }

  if (currentView === 'list') {
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '1rem';
    container.innerHTML = novels.map(renderNovelListItem).join('');
  } else {
    container.style.display = '';
    container.style.flexDirection = '';
    container.style.gap = '';
    container.innerHTML = novels.map(renderNovelCard).join('');
  }
}

// ============================
// NOVEL DETAIL PAGE
// ============================
function loadNovelDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('novelDetail');
  if (!id || !container) return;

  const novel = DB.getNovel(id);
  if (!novel) {
    container.innerHTML = '<div class="empty-state" style="padding:4rem"><div class="empty-icon">😕</div><h3>الرواية غير موجودة</h3><a href="novels.html" class="btn-primary" style="margin-top:1rem">العودة للمكتبة</a></div>';
    return;
  }

  DB.incrementViews(id);
  document.title = novel.title + ' — Vinny Web';

  const chapters = DB.getChaptersByNovel(id);

  container.innerHTML = `
    <div class="novel-detail-hero">
      <div class="novel-detail-inner">
        <div class="detail-cover">${coverImg(novel.cover, novel.title)}</div>
        <div class="detail-meta-col">
          <h1 class="detail-title">${novel.title}</h1>
          <p class="detail-author">✍️ ${novel.author || 'غير معروف'}</p>
          <div class="detail-status">
            ${getStatusEmoji(novel.status)} <span>${novel.status}</span>
          </div>
          <p class="detail-desc">${novel.desc || ''}</p>
          <div class="detail-cats">
            ${(novel.categories || []).map(c => `<span class="cat-tag">${c}</span>`).join('')}
          </div>
          <div class="detail-meta">
            <span>📖 ${chapters.length} فصل</span>
            <span>👁️ ${(novel.views || 0).toLocaleString('ar')} مشاهدة</span>
            <span>📅 ${formatDate(novel.createdAt)}</span>
          </div>
          ${chapters.length > 0
            ? `<a href="chapter.html?novel=${id}&id=${chapters[0].id}" class="btn-primary">📖 ابدأ القراءة</a>`
            : `<span class="btn-ghost" style="cursor:default;opacity:0.6">لا توجد فصول بعد</span>`
          }
        </div>
      </div>
    </div>

    <div class="chapters-section">
      <div class="chapters-header">
        <h2 class="chapters-title">📋 الفصول (${chapters.length})</h2>
      </div>
      <div class="chapters-list">
        ${chapters.length === 0
          ? '<div class="empty-state"><div class="empty-icon">📄</div><h3>لا توجد فصول بعد</h3></div>'
          : chapters.map(c => `
            <a class="chapter-item" href="chapter.html?novel=${id}&id=${c.id}">
              <span class="chapter-num">الفصل ${c.number}</span>
              <span class="chapter-title-text">${c.title}</span>
              <span class="chapter-date">${formatDate(c.createdAt)}</span>
            </a>`).join('')
        }
      </div>
    </div>`;
}

// ============================
// CHAPTER READING PAGE
// ============================
function loadChapter() {
  const params = new URLSearchParams(window.location.search);
  const novelId = params.get('novel');
  const chapterId = params.get('id');

  const content = document.getElementById('chapterContent');
  const nav = document.getElementById('chapterNav');
  const backBtn = document.getElementById('backToNovel');

  if (backBtn) backBtn.href = 'novel.html?id=' + novelId;

  if (!chapterId || !content) return;

  const chapter = DB.getChapter(chapterId);
  const novel = DB.getNovel(novelId);
  if (!chapter || !novel) {
    content.innerHTML = '<div class="empty-state"><h3>الفصل غير موجود</h3></div>';
    return;
  }

  document.title = `${chapter.title} — ${novel.title}`;
  if (document.getElementById('pageTitle')) {
    document.getElementById('pageTitle').textContent = chapter.title + ' — ' + novel.title;
  }

  content.innerHTML = `
    <div class="chapter-meta-bar">
      <h1>${novel.title}</h1>
      <p>الفصل ${chapter.number}: ${chapter.title}</p>
    </div>
    ${chapter.note ? `<div class="chapter-note">💬 ملاحظة الكاتب: ${chapter.note}</div>` : ''}
    <div class="chapter-body">${formatChapterContent(chapter.content)}</div>`;

  // Navigation
  const chapters = DB.getChaptersByNovel(novelId);
  const idx = chapters.findIndex(c => c.id === chapterId);
  const prev = chapters[idx - 1];
  const next = chapters[idx + 1];

  if (nav) {
    nav.innerHTML = `
      ${prev ? `<a href="chapter.html?novel=${novelId}&id=${prev.id}">← الفصل السابق<br/><small>${prev.title}</small></a>` : '<span></span>'}
      <a href="novel.html?id=${novelId}" style="text-align:center">قائمة الفصول<br/><small>${novel.title}</small></a>
      ${next ? `<a href="chapter.html?novel=${novelId}&id=${next.id}" style="text-align:left">الفصل التالي →<br/><small>${next.title}</small></a>` : '<span></span>'}`;
  }
}

function formatChapterContent(text) {
  if (!text) return '';
  return text.split('\n\n').map(p => p.trim() ? `<p>${p.replace(/\n/g, '<br/>')}</p>` : '').join('');
}

// ============================
// CATEGORIES PAGE
// ============================
function loadCategoriesPage() {
  const cats = DB.getCategories();
  const novels = DB.getNovels();
  const grid = document.getElementById('allCatsGrid');
  if (!grid) return;

  grid.innerHTML = cats.map(c => {
    const count = novels.filter(n => (n.categories || []).includes(c.name)).length;
    return `
      <div class="cat-card" onclick="showCatNovels('${c.name}', '${c.icon}')">
        <div class="cat-icon">${c.icon}</div>
        <div class="cat-name">${c.name}</div>
        <div class="cat-count">${count} رواية</div>
      </div>`;
  }).join('');

  // Check URL param
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('cat');
  if (cat) showCatNovels(cat, '📚');
}

function showCatNovels(catName, icon) {
  const novels = DB.getNovels().filter(n => (n.categories || []).includes(catName));
  const section = document.getElementById('catNovelsSection');
  const title = document.getElementById('catNovelsTitle');
  const grid = document.getElementById('catNovelsGrid');

  if (!section) return;
  section.style.display = 'block';
  title.textContent = `${icon} روايات تصنيف: ${catName}`;
  grid.innerHTML = novels.length > 0
    ? novels.map(renderNovelCard).join('')
    : '<div class="empty-state"><div class="empty-icon">📭</div><h3>لا توجد روايات في هذا التصنيف</h3></div>';

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeCatNovels() {
  document.getElementById('catNovelsSection').style.display = 'none';
}

// ============================
// ADMIN PAGE
// ============================
function initAdmin() {
  refreshAdminStats();
  renderAdminNovels();
  populateChapterNovelSelect();
  renderAdminCats();
}

function showTab(name) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-link').forEach(l => l.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  event.currentTarget.classList.add('active');
  if (name === 'addChapter') populateChapterNovelSelect();
}

function refreshAdminStats() {
  const stats = DB.getStats();
  const an = document.getElementById('aStat-novels');
  const ac = document.getElementById('aStat-chapters');
  if (an) an.textContent = stats.novels;
  if (ac) ac.textContent = stats.chapters;
}

// ---- NOVELS ADMIN ----
function renderAdminNovels() {
  const novels = DB.getNovels();
  const container = document.getElementById('adminNovelsList');
  if (!container) return;
  if (novels.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><h3>لا توجد روايات بعد</h3><p>أضف أول رواية!</p></div>';
    return;
  }
  container.innerHTML = novels.map(n => {
    const chapters = DB.getChaptersByNovel(n.id);
    return `
      <div class="admin-novel-row">
        <div class="admin-novel-cover">${coverImg(n.cover, n.title)}</div>
        <div class="admin-novel-info">
          <div class="admin-novel-title">${n.title}</div>
          <div class="admin-novel-meta">${n.author || ''} · ${n.status} · ${chapters.length} فصل · 👁️ ${n.views || 0}</div>
        </div>
        <div class="admin-novel-actions">
          <button class="btn-edit" onclick="editNovel('${n.id}')">✏️ تعديل</button>
          <button class="btn-del" onclick="deleteNovelConfirm('${n.id}', '${n.title.replace(/'/g, "\\'")}')">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

function saveNovel() {
  const id = document.getElementById('editNovelId').value;
  const title = document.getElementById('novelTitle').value.trim();
  const author = document.getElementById('novelAuthor').value.trim();
  const desc = document.getElementById('novelDesc').value.trim();
  const cover = document.getElementById('novelCover').value.trim();
  const status = document.getElementById('novelStatus').value;
  const catsRaw = document.getElementById('novelCats').value;
  const featured = document.getElementById('novelFeatured').checked;

  const msg = document.getElementById('novelFormMsg');

  if (!title || !desc) {
    showMsg(msg, '⚠️ يرجى ملء الحقول المطلوبة (العنوان والوصف)', 'error');
    return;
  }

  const categories = catsRaw.split(',').map(s => s.trim()).filter(Boolean);
  const data = { title, author, desc, cover, status, categories, featured };

  if (id) {
    DB.updateNovel(id, data);
    showMsg(msg, '✅ تم تحديث الرواية بنجاح!', 'success');
  } else {
    DB.addNovel(data);
    showMsg(msg, '✅ تمت إضافة الرواية بنجاح!', 'success');
  }

  clearNovelForm();
  renderAdminNovels();
  refreshAdminStats();
}

function editNovel(id) {
  const novel = DB.getNovel(id);
  if (!novel) return;
  document.getElementById('editNovelId').value = novel.id;
  document.getElementById('novelTitle').value = novel.title;
  document.getElementById('novelAuthor').value = novel.author || '';
  document.getElementById('novelDesc').value = novel.desc || '';
  document.getElementById('novelCover').value = novel.cover || '';
  document.getElementById('novelStatus').value = novel.status;
  document.getElementById('novelCats').value = (novel.categories || []).join(', ');
  document.getElementById('novelFeatured').checked = novel.featured || false;

  // Switch to add tab
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-link').forEach(l => l.classList.remove('active'));
  document.getElementById('tab-addNovel').classList.add('active');
  document.querySelectorAll('.admin-link')[1].classList.add('active');

  document.getElementById('tab-addNovel').scrollIntoView({ behavior: 'smooth' });
}

function deleteNovelConfirm(id, title) {
  if (confirm(`هل تريد حذف رواية "${title}"؟ لا يمكن التراجع عن هذه العملية.`)) {
    DB.deleteNovel(id);
    renderAdminNovels();
    refreshAdminStats();
  }
}

function clearNovelForm() {
  document.getElementById('editNovelId').value = '';
  document.getElementById('novelTitle').value = '';
  document.getElementById('novelAuthor').value = '';
  document.getElementById('novelDesc').value = '';
  document.getElementById('novelCover').value = '';
  document.getElementById('novelStatus').value = 'مستمرة';
  document.getElementById('novelCats').value = '';
  document.getElementById('novelFeatured').checked = false;
}

// ---- CHAPTERS ADMIN ----
function populateChapterNovelSelect() {
  const sel = document.getElementById('chapterNovelId');
  if (!sel) return;
  const novels = DB.getNovels();
  sel.innerHTML = '<option value="">-- اختر رواية --</option>' +
    novels.map(n => `<option value="${n.id}">${n.title}</option>`).join('');
}

function saveChapter() {
  const id = document.getElementById('editChapterId').value;
  const novelId = document.getElementById('chapterNovelId').value;
  const number = parseInt(document.getElementById('chapterNumber').value);
  const title = document.getElementById('chapterTitle').value.trim();
  const content = document.getElementById('chapterContent').value.trim();
  const note = document.getElementById('chapterNote').value.trim();

  const msg = document.getElementById('chapterFormMsg');

  if (!novelId || !title || !content || isNaN(number)) {
    showMsg(msg, '⚠️ يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }

  const data = { novelId, number, title, content, note };

  if (id) {
    DB.updateChapter(id, data);
    showMsg(msg, '✅ تم تحديث الفصل بنجاح!', 'success');
  } else {
    DB.addChapter(data);
    showMsg(msg, '✅ تمت إضافة الفصل بنجاح!', 'success');
  }

  clearChapterForm();
  refreshAdminStats();
}

function clearChapterForm() {
  document.getElementById('editChapterId').value = '';
  document.getElementById('chapterNovelId').value = '';
  document.getElementById('chapterNumber').value = '';
  document.getElementById('chapterTitle').value = '';
  document.getElementById('chapterContent').value = '';
  document.getElementById('chapterNote').value = '';
}

// ---- CATEGORIES ADMIN ----
function addCategory() {
  const name = document.getElementById('newCatName').value.trim();
  const icon = document.getElementById('newCatIcon').value.trim() || '📖';
  const msg = document.getElementById('catFormMsg');

  if (!name) {
    showMsg(msg, '⚠️ أدخل اسم التصنيف', 'error');
    return;
  }
  DB.addCategory({ name, icon });
  document.getElementById('newCatName').value = '';
  document.getElementById('newCatIcon').value = '';
  renderAdminCats();
  showMsg(msg, '✅ تمت إضافة التصنيف', 'success');
}

function renderAdminCats() {
  const cats = DB.getCategories();
  const container = document.getElementById('adminCatsList');
  if (!container) return;
  container.innerHTML = cats.map(c => `
    <div class="admin-cat-item">
      <span>${c.icon}</span>
      <span>${c.name}</span>
      <button class="btn-cat-del" onclick="deleteCat('${c.id}')" title="حذف">✖</button>
    </div>`).join('');
}

function deleteCat(id) {
  if (confirm('حذف هذا التصنيف؟')) {
    DB.deleteCategory(id);
    renderAdminCats();
  }
}

// ---- HELPERS ----
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = 'form-msg ' + type;
  setTimeout(() => { el.textContent = ''; el.className = 'form-msg'; }, 4000);
}
