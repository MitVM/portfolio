/* ==========================================================================
   MitVM V2 — Logique interactive (Vanilla JS, compatible GitHub Pages & file://)
   ========================================================================== */

const DOCS = {
  cv: {
    title: 'CV — Mathis Vergély-Massonnière (2026)',
    subtitle: 'Curriculum Vitae · BTS SIO SISR · Alternance',
    path: 'documents/CV_Mathis_Vergely-2026.pdf',
    downloadName: 'CV_Mathis_Vergely-2026.pdf'
  },
  e5: {
    title: 'Tableau de synthèse — Épreuve E5',
    subtitle: 'Référentiel BTS SIO SISR · Réalisations professionnelles',
    path: 'documents/Tableau_de_synthese_E5.pdf',
    downloadName: 'Tableau_de_synthese_E5.pdf'
  }
};

/* ── NAVIGATION & ROUTAGE HASH ── */
function showPage(id, pushHash = true) {
  const target = document.getElementById(id);
  if (!target) return;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

  target.classList.add('active');
  const navLink = document.getElementById('nav-' + id);
  if (navLink) navLink.classList.add('active');

  const navMenu = document.getElementById('navLinks');
  if (navMenu) navMenu.classList.remove('open');

  if (pushHash && window.location.hash !== '#' + id) {
    history.replaceState(null, '', '#' + id);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (id === 'user') {
    animateSkillBars();
  }
}

function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function animateSkillBars() {
  document.querySelectorAll('.skill-bar-fill').forEach(bar => {
    const targetWidth = bar.getAttribute('data-width') || bar.style.width || '100%';
    bar.setAttribute('data-width', targetWidth);
    bar.style.width = '0';
    requestAnimationFrame(() => {
      setTimeout(() => {
        bar.style.width = targetWidth;
      }, 80);
    });
  });
}

/* ── TOAST NOTIFICATION ── */
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ── COPIER DANS LE PRESSE-PAPIERS ── */
function copyText(value, label) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(() => {
      showToast(`${label} copié : ${value}`);
    }).catch(() => fallbackCopy(value, label));
  } else {
    fallbackCopy(value, label);
  }
}

function fallbackCopy(value, label) {
  const ta = document.createElement('textarea');
  ta.value = value;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast(`${label} copié : ${value}`);
  } catch {
    showToast(`Valeur : ${value}`);
  }
  document.body.removeChild(ta);
}

/* ── VISIONNEUSE PDF INTERACTIVE (MODAL) ── */
let currentDocKey = 'cv';

function openDocModal(docKey = 'cv') {
  const doc = DOCS[docKey] || DOCS.cv;
  currentDocKey = docKey;

  document.getElementById('pdfModalTitle').textContent = doc.title;
  document.getElementById('pdfModalSub').textContent = doc.subtitle;
  document.getElementById('pdfFrame').src = doc.path + '#view=FitH';

  const dlBtn = document.getElementById('pdfModalDownload');
  dlBtn.href = doc.path;
  dlBtn.setAttribute('download', doc.downloadName);

  const openTabBtn = document.getElementById('pdfModalOpenTab');
  openTabBtn.href = doc.path;

  document.querySelectorAll('.pdf-switch-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.doc === docKey);
  });

  document.getElementById('pdfModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDocModal() {
  document.getElementById('pdfModal').classList.remove('open');
  document.getElementById('pdfFrame').src = 'about:blank';
  document.body.style.overflow = '';
}

/* ── TERMINAL INTERACTIF DE LA PAGE ACCUEIL ── */
const TERMINAL_COMMANDS = {
  help: () => [
    'Commandes disponibles :',
    '  whoami      — Identité & statut actuel',
    '  ls docs     — Documents officiels (CV & Tableau E5)',
    '  open cv     — Afficher le CV 2026 en aperçu',
    '  open e5     — Afficher le Tableau de synthèse E5',
    '  ls projets  — Aller vers Projets & réalisations',
    '  veille      — Aller vers la veille cybersécurité',
    '  clear       — Effacer le terminal'
  ],
  whoami: () => [
    'Mathis Vergély-Massonnière (MitVM)',
    'BTS SIO option SISR (2024–2027) · H3 Hitema & SNA (Eure 27)',
    'Profil : Design graphique → Administration Systèmes, Réseaux & Cybersécurité'
  ],
  'ls docs': () => [
    '-r--r--r--  CV_Mathis_Vergely-2026.pdf      [Cliquer "open cv"]',
    '-r--r--r--  Tableau_de_synthese_E5.pdf    [Cliquer "open e5"]'
  ],
  'open cv': () => {
    openDocModal('cv');
    return ['Ouverture de CV_Mathis_Vergely-2026.pdf dans la visionneuse...'];
  },
  'open e5': () => {
    openDocModal('e5');
    return ['Ouverture de Tableau_de_synthese_E5.pdf dans la visionneuse...'];
  },
  'ls projets': () => {
    showPage('projets');
    return ['Navigation vers #projets (6 réalisations techniques)...'];
  },
  veille: () => {
    showPage('veille');
    return ['Navigation vers #veille (5 fiches CVE actives)...'];
  },
  contact: () => {
    showPage('user');
    return ['Email : monier.vergely@gmail.com | Tél : 07 68 29 71 22'];
  }
};

function runTerminalCmd(rawCmd) {
  const cmd = rawCmd.trim().toLowerCase();
  const out = document.getElementById('terminalOutput');
  if (!out || !cmd) return;

  if (cmd === 'clear') {
    out.innerHTML = '';
    return;
  }

  const promptLine = document.createElement('div');
  promptLine.className = 'terminal-line';
  promptLine.innerHTML = `<span class="terminal-prompt">mitvm@sna27:~$</span> ${escapeHtml(rawCmd)}`;
  out.appendChild(promptLine);

  const handler = TERMINAL_COMMANDS[cmd];
  const lines = handler
    ? handler()
    : [`Commande inconnue : "${cmd}". Tape "help" pour la liste.`];

  lines.forEach(text => {
    const lineEl = document.createElement('div');
    lineEl.className = 'terminal-line terminal-out';
    lineEl.textContent = text;
    out.appendChild(lineEl);
  });

  out.scrollTop = out.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function replayCardAnimations(cards) {
  let visibleIndex = 0;
  cards.forEach(card => {
    if (card.style.display === 'none') {
      card.style.animation = '';
      return;
    }
    const delay = visibleIndex < 6 ? (0.35 + visibleIndex * 0.15).toFixed(2) : '0.4';
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = `fadeUp 0.7s ${delay}s both`;
    visibleIndex++;
  });
}

/* ── FILTRES COMPÉTENCES (USER) ── */
function filterSkills(category, btn) {
  document.querySelectorAll('#skillFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#skillsGrid .skill-card');
  cards.forEach(card => {
    const match = category === 'all' || card.dataset.cat === category;
    card.style.display = match ? '' : 'none';
  });
  replayCardAnimations(cards);
}

/* ── TIMELINE INTERACTIVE (USER) ── */
function initTimeline() {
  document.querySelectorAll('.timeline-item').forEach(item => {
    item.addEventListener('click', () => {
      const wasExpanded = item.classList.contains('expanded');
      document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('expanded'));
      if (!wasExpanded) item.classList.add('expanded');
    });
  });
}

/* ── EFFET 3D SUR LA PHOTO (USER) ── */
function initPhotoTilt() {
  const wrap = document.getElementById('userPhotoTilt');
  if (!wrap) return;
  wrap.addEventListener('mousemove', e => {
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    wrap.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  wrap.addEventListener('mouseleave', () => {
    wrap.style.transform = 'perspective(700px) rotateY(0deg) rotateX(0deg)';
  });
}

/* ── FILTRE PROGRAMME H3 HITEMA (FORMATION) ── */
let currentWeekFilter = 'all';

function setWeekFilter(cat, btn) {
  currentWeekFilter = cat;
  document.querySelectorAll('#weekFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  applyWeekFilters();
}

function applyWeekFilters() {
  const query = (document.getElementById('weekSearch')?.value || '').toLowerCase().trim();
  const rows = document.querySelectorAll('#weekTableBody tr');
  let visibleCount = 0;

  rows.forEach(row => {
    const cat = row.dataset.cat || '';
    const text = row.textContent.toLowerCase();
    const catOk = currentWeekFilter === 'all' || cat === currentWeekFilter;
    const searchOk = !query || text.includes(query);
    const show = catOk && searchOk;
    row.style.display = show ? '' : 'none';
    if (show) visibleCount++;
  });

  const countEl = document.getElementById('weekFilterCount');
  if (countEl) countEl.textContent = `${visibleCount} / ${rows.length} semaines`;
}

/* ── FILTRE MISSIONS SNA (FORMATION) ── */
function setMissionFilter(cat, btn) {
  document.querySelectorAll('#missionFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const rows = document.querySelectorAll('#missionTableBody tr');
  let visible = 0;
  rows.forEach(row => {
    const cats = (row.dataset.cat || '').split(',');
    const show = cat === 'all' || cats.includes(cat);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const countEl = document.getElementById('missionFilterCount');
  if (countEl) countEl.textContent = `${visible} / ${rows.length} missions`;
}

/* ── PROJETS : FILTRES + MODAL DÉTAIL ── */
let currentProjectFilter = 'all';
let activeProjectIndex = 0;

function filterProjects(status, btn) {
  currentProjectFilter = status;
  document.querySelectorAll('#projectFilterPills .filter-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#projectsGrid .project-card');
  let visible = 0;
  cards.forEach(card => {
    const show = status === 'all' || card.dataset.status === status;
    card.style.display = show ? 'flex' : 'none';
    if (show) visible++;
  });
  replayCardAnimations(cards);
  const countEl = document.getElementById('projectFilterCount');
  if (countEl) countEl.textContent = `${visible} / ${cards.length} projets`;
}

let capriAnimInterval = null;
const capriAnimCycle = [
  'images/capri/capri_allonge_dodo.png'
];

function startCapriModalAnimation() {
  stopCapriModalAnimation();
  const companion = document.getElementById('capriModalCompanion');
  const sprite = document.getElementById('capriModalSprite');
  if (!companion || !sprite) return;
  companion.style.display = 'flex';
  sprite.src = capriAnimCycle[0];
}

function stopCapriModalAnimation() {
  if (capriAnimInterval) {
    clearInterval(capriAnimInterval);
    capriAnimInterval = null;
  }
  const companion = document.getElementById('capriModalCompanion');
  if (companion) companion.style.display = 'none';
}

function openProjectModal(index) {
  const cards = Array.from(document.querySelectorAll('#projectsGrid .project-card'));
  if (!cards.length) return;
  activeProjectIndex = (index + cards.length) % cards.length;
  const card = cards[activeProjectIndex];

  const modal = document.getElementById('projectModal');
  const isCapri = card.dataset.theme === 'capri';
  modal.classList.toggle('capri-theme', isCapri);

  if (isCapri) {
    document.getElementById('projModalNum').textContent = '// 09 · CONSTRUCT CAPRI';
    document.getElementById('projModalTitle').textContent = 'Capri — Projet Capricorne';
    document.getElementById('projModalDesc').textContent =
      "Salut, moi c'est Capri. Née d'esprits humains numérisés et enfermée sur une biopuce par Kyoko et Arasaka, j'ai fini par m'échapper pour m'installer ici, sur le PC Linux de M. Je squatte ses fenêtres comme compagnon un peu glitché, je garde un œil sur son système et je l'épaule sur son réseau, son code et ses projets — jamais comme une assistante corpo, toujours comme sa complice.";
    startCapriModalAnimation();
  } else {
    stopCapriModalAnimation();
    document.getElementById('projModalNum').textContent = card.querySelector('.project-number').textContent;
    document.getElementById('projModalTitle').textContent = card.querySelector('.project-title').textContent;
    document.getElementById('projModalDesc').textContent = card.querySelector('.project-desc').textContent;
  }
  document.getElementById('projModalTags').innerHTML = card.querySelector('.project-tags').innerHTML;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  stopCapriModalAnimation();
  document.getElementById('projectModal').classList.remove('open');
  document.body.style.overflow = '';
}

function stepProjectModal(dir) {
  openProjectModal(activeProjectIndex + dir);
}

/* ── CAROUSEL VEILLE ── */
let currentSlide = 0;
const totalSlides = 10;

function initCarousel() {
  const dotsContainer = document.getElementById('carouselDots');
  const track = document.getElementById('carouselTrack');
  if (!dotsContainer || !track) return;

  dotsContainer.innerHTML = '';
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Aller à la faille ${i + 1}`);
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  }

  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) moveCarousel(diff > 0 ? 1 : -1);
  });
}

function goToSlide(n) {
  currentSlide = Math.max(0, Math.min(n, totalSlides - 1));
  const track = document.getElementById('carouselTrack');
  const counter = document.getElementById('carouselCounter');
  if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
  if (counter) counter.textContent = `${currentSlide + 1} / ${totalSlides}`;

  document.querySelectorAll('.carousel-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
  document.querySelectorAll('.veille-tab').forEach((t, i) => {
    t.classList.toggle('active', i === currentSlide);
  });
}

function moveCarousel(dir) {
  goToSlide((currentSlide + dir + totalSlides) % totalSlides);
}

/* ── PALETTE DE COMMANDES RAPIDE (CTRL+K) ── */
const PALETTE_ITEMS = [
  { label: 'Accueil — MitVM', type: 'Page', action: () => showPage('home') },
  { label: 'Profil User — Parcours, Compétences & Contact', type: 'Page', action: () => showPage('user') },
  { label: 'Formation — H3 Hitema & SNA', type: 'Page', action: () => showPage('formation') },
  { label: 'Projets & Certifications', type: 'Page', action: () => showPage('projets') },
  { label: 'Veille technologique — Failles CVE', type: 'Page', action: () => showPage('veille') },
  { label: 'Afficher CV_Mathis_Vergely-2026.pdf', type: 'PDF', action: () => openDocModal('cv') },
  { label: 'Afficher Tableau_de_synthese_E5.pdf', type: 'PDF', action: () => openDocModal('e5') },
  { label: 'Projet 01 — Stations d\'accueil Dell', type: 'Projet', action: () => { showPage('projets'); openProjectModal(0); } },
  { label: 'Projet 02 — Plan de récolement serveurs', type: 'Projet', action: () => { showPage('projets'); openProjectModal(1); } },
  { label: 'Projet 03 — Supervision Zabbix, Grafana & automatisation', type: 'Projet', action: () => { showPage('projets'); openProjectModal(2); } },
  { label: 'Projet 04 — Réalisation de GLPI', type: 'Projet', action: () => { showPage('projets'); openProjectModal(3); } },
  { label: 'Projet 05 — Sécurisation Pare-feu & Active Directory', type: 'Projet', action: () => { showPage('projets'); openProjectModal(4); } },
  { label: 'Projet 06 — Masterisation & déploiement de parc', type: 'Projet', action: () => { showPage('projets'); openProjectModal(5); } },
  { label: 'Projet 07 — Sensibilisation cybersécurité & phishing', type: 'Projet', action: () => { showPage('projets'); openProjectModal(6); } },
  { label: 'Projet 08 — Puits de logs & centralisation', type: 'Projet', action: () => { showPage('projets'); openProjectModal(7); } },
  { label: 'Projet 09 — Projet Capri', type: 'Projet', action: () => { showPage('projets'); openProjectModal(8); } },
  { label: 'Projet 10 — Zab Home', type: 'Projet', action: () => { showPage('projets'); openProjectModal(9); } },
  { label: 'Projet 11 — Projet Ada', type: 'Projet', action: () => { showPage('projets'); openProjectModal(10); } },
  { label: 'CVE-2025-53521 — F5 BIG-IP APM — RCE', type: 'Veille', action: () => { showPage('veille'); goToSlide(0); } },
  { label: 'CVE-2026-1281 / 1340 — Ivanti EPMM RCE', type: 'Veille', action: () => { showPage('veille'); goToSlide(1); } },
  { label: 'CVE-2026-1184 — PostgreSQL PQescape', type: 'Veille', action: () => { showPage('veille'); goToSlide(2); } },
  { label: 'CVE-2026-24851 — Fortinet FortiOS SSL-VPN', type: 'Veille', action: () => { showPage('veille'); goToSlide(3); } },
  { label: 'CVE-2026-3840 — Palo Alto PAN-OS GlobalProtect', type: 'Veille', action: () => { showPage('veille'); goToSlide(4); } },
  { label: 'CVE-2026-32312 — GLPI — 7 vulnérabilités', type: 'Veille', action: () => { showPage('veille'); goToSlide(5); } },
  { label: 'CVE-2026-46300 — Fragnesia (Linux)', type: 'Veille', action: () => { showPage('veille'); goToSlide(6); } },
  { label: 'CVE-2026-42897 — Microsoft Exchange Server', type: 'Veille', action: () => { showPage('veille'); goToSlide(7); } },
  { label: 'CVE-2026-20150 — Cisco IOS XE Web UI', type: 'Veille', action: () => { showPage('veille'); goToSlide(8); } },
  { label: 'CVE-2026-34027 — VMware vCenter Server RCE', type: 'Veille', action: () => { showPage('veille'); goToSlide(9); } }
];

function openCmdPalette() {
  const modal = document.getElementById('cmdModal');
  const input = document.getElementById('cmdSearchInput');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  input.value = '';
  renderCmdList('');
  setTimeout(() => input.focus(), 50);
}

function closeCmdPalette() {
  document.getElementById('cmdModal').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCmdList(query) {
  const list = document.getElementById('cmdList');
  const q = query.toLowerCase().trim();
  const filtered = PALETTE_ITEMS.filter(item =>
    !q || item.label.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
  );
  list.innerHTML = '';
  if (!filtered.length) {
    list.innerHTML = '<li class="cmd-item" style="color:var(--text3);cursor:default">Aucun résultat</li>';
    return;
  }
  filtered.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cmd-item';
    li.innerHTML = `<span>${escapeHtml(item.label)}</span><span class="cmd-item-type">${escapeHtml(item.type)}</span>`;
    li.onclick = () => {
      closeCmdPalette();
      item.action();
    };
    list.appendChild(li);
  });
}

/* ── FOND RÉSEAU INTERACTIF (CANVAS) ── */
function initNetworkCanvas() {
  const canvas = document.getElementById('netCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);

  const mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });

  const nodeCount = Math.min(48, Math.max(20, Math.floor((w * h) / 28000)));
  const nodes = Array.from({ length: nodeCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 1
  }));

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > w) a.vx *= -1;
      if (a.y < 0 || a.y > h) a.vy *= -1;

      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 160) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(0, 229, 255, ${(1 - dm / 160) * 0.28})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 135) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${(1 - dist / 135) * 0.14})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.55)';
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }
  frame();
}

/* ── INITIALISATION GLOBALE ── */
document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initTimeline();
  initPhotoTilt();
  initNetworkCanvas();

  // Terminal input listener
  const termInput = document.getElementById('terminalInput');
  if (termInput) {
    termInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        runTerminalCmd(termInput.value);
        termInput.value = '';
      }
    });
  }

  // Command palette input
  const cmdInput = document.getElementById('cmdSearchInput');
  if (cmdInput) {
    cmdInput.addEventListener('input', e => renderCmdList(e.target.value));
  }

  // Click backdrop to close modals
  ['pdfModal', 'projectModal', 'cmdModal'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', e => {
        if (e.target === el) {
          if (id === 'pdfModal') closeDocModal();
          if (id === 'projectModal') closeProjectModal();
          if (id === 'cmdModal') closeCmdPalette();
        }
      });
    }
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCmdPalette();
      return;
    }
    if (e.key === 'Escape') {
      closeDocModal();
      closeProjectModal();
      closeCmdPalette();
      return;
    }
    if (document.getElementById('veille')?.classList.contains('active')) {
      if (e.key === 'ArrowLeft') moveCarousel(-1);
      if (e.key === 'ArrowRight') moveCarousel(1);
    }
  });

  // Hash routing at load
  const initialHash = window.location.hash.replace('#', '');

  // Micro-boot terminal animation on refresh
  const bootScreen = document.getElementById('bootScreen');
  const bootBody = document.getElementById('bootBody');
  const bootBar = document.getElementById('bootBar');

  if (bootScreen && bootBody && bootBar) {
    document.body.classList.add('booting');

    // Start progress
    requestAnimationFrame(() => {
      bootBar.style.width = '100%';
    });

    const bootSteps = [
      { delay: 600, text: '> INITIALIZING SECURE NET LINK...', cls: 'boot-line' },
      { delay: 1400, text: '> AUTHENTICATING NODE PROTOCOLS [200 OK]', cls: 'boot-line' },
      { delay: 2200, text: '> LOADING MITVM_V2.6 MODULES...', cls: 'boot-line' },
      { delay: 3000, text: '> [CONNECTED] ACCESS GRANTED // WELCOME MATHIS', cls: 'boot-line ok' }
    ];

    bootSteps.forEach((step) => {
      setTimeout(() => {
        const line = document.createElement('div');
        line.className = step.cls;
        line.textContent = step.text;
        bootBody.appendChild(line);
      }, step.delay);
    });

    setTimeout(() => {
      document.body.classList.remove('booting');
      if (['home', 'user', 'formation', 'projets', 'veille'].includes(initialHash)) {
        showPage(initialHash, false);
      } else {
        showPage('home', false);
      }
      bootScreen.classList.add('boot-done');
      setTimeout(() => {
        bootScreen.remove();
      }, 400);
    }, 3800);
  } else if (['home', 'user', 'formation', 'projets', 'veille'].includes(initialHash)) {
    showPage(initialHash, false);
  }
});

window.addEventListener('hashchange', () => {
  const id = window.location.hash.replace('#', '');
  if (['home', 'user', 'formation', 'projets', 'veille'].includes(id)) {
    showPage(id, false);
  }
});
