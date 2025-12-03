/* main.js - Versão final (já enviada anteriormente)
   - Aplica tema imediatamente
   - Gerencia toggles de tema e menu mobile
   - Validação do formulário e modal acessível
   - Compatível com as páginas padronizadas acima
*/

/* Aplica preferência de tema imediatamente */
(function applySavedThemeImmediately() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', () => {
  ['year','year2','year3','year4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = new Date().getFullYear();
  });

  const themeButtons = [
    ...Array.from(document.querySelectorAll('.theme-toggle')),
    ...Array.from(document.querySelectorAll('#themeToggle'))
  ].filter(Boolean);

  function updateThemeButtons(isDark) {
    themeButtons.forEach(btn => {
      try {
        btn.setAttribute('aria-pressed', String(isDark));
        btn.textContent = isDark ? '☀️' : '🌙';
      } catch (e) {}
    });
  }

  updateThemeButtons(document.body.classList.contains('dark'));

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
      updateThemeButtons(isDark);
    });
  });

  const navToggles = [
    ...Array.from(document.querySelectorAll('.nav-toggle')),
    ...Array.from(document.querySelectorAll('#btnToggle'))
  ].filter(Boolean);

  navToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const header = e.currentTarget.closest('.header-inner') || document.querySelector('.header-inner');
      const nav = header ? header.querySelector('#mainNav') : document.getElementById('mainNav');
      if (!nav) return;
      const open = nav.classList.toggle('open');
      try { e.currentTarget.setAttribute('aria-expanded', String(open)); } catch (err) {}
      if (open) {
        const firstLink = nav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
  });

  document.querySelectorAll('#mainNav a').forEach(a => {
    a.addEventListener('click', () => {
      const nav = document.getElementById('mainNav');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        document.querySelectorAll('.nav-toggle, #btnToggle').forEach(b => b.setAttribute('aria-expanded', 'false'));
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const nav = document.querySelector('#mainNav.open');
      if (nav) {
        nav.classList.remove('open');
        document.querySelectorAll('.nav-toggle, #btnToggle').forEach(b => b.setAttribute('aria-expanded', 'false'));
      }
      const modal = document.getElementById('modal');
      if (modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
    }
  });

  document.addEventListener('click', (e) => {
    const nav = document.getElementById('mainNav');
    if (!nav || !nav.classList.contains('open')) return;
    const header = document.querySelector('.header-inner');
    if (header && !header.contains(e.target)) {
      nav.classList.remove('open');
      document.querySelectorAll('.nav-toggle, #btnToggle').forEach(b => b.setAttribute('aria-expanded', 'false'));
    }
  });

  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
    form.addEventListener('reset', () => {
      clearFieldErrors();
      const feedback = document.getElementById('formFeedback');
      if (feedback) feedback.textContent = '';
    });
  }
});

/* Helpers e validação (mantidos) */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function setFieldError(fieldId, message) {
  const err = document.getElementById('err-' + fieldId);
  if (err) err.textContent = message;
  const field = document.getElementById(fieldId);
  if (field) {
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
}
function clearFieldErrors() {
  ['name','email','message'].forEach(id => {
    const err = document.getElementById('err-' + id);
    if (err) err.textContent = '';
    const field = document.getElementById(id);
    if (field) field.removeAttribute('aria-invalid');
  });
}
function showInlineFeedback(text, isError) {
  const feedback = document.getElementById('formFeedback');
  if (!feedback) return;
  feedback.textContent = text;
  feedback.style.color = isError ? '#d9534f' : 'var(--accent)';
}
function handleSubmit(e) {
  e.preventDefault();
  clearFieldErrors();
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const msgEl = document.getElementById('message');

  const name = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const message = msgEl ? msgEl.value.trim() : '';

  if (!name) {
    setFieldError('name', 'Informe seu nome.');
    if (nameEl) nameEl.focus();
    showInlineFeedback('Corrija os campos destacados.', true);
    return false;
  }
  if (!email) {
    setFieldError('email', 'Informe seu e-mail.');
    if (emailEl) emailEl.focus();
    showInlineFeedback('Corrija os campos destacados.', true);
    return false;
  }
  if (!isValidEmail(email)) {
    setFieldError('email', 'E-mail inválido. Use o formato usuario@dominio.com');
    if (emailEl) emailEl.focus();
    showInlineFeedback('Corrija os campos destacados.', true);
    return false;
  }
  if (!message || message.length < 10) {
    setFieldError('message', 'A mensagem deve ter ao menos 10 caracteres.');
    if (msgEl) msgEl.focus();
    showInlineFeedback('Corrija os campos destacados.', true);
    return false;
  }

  if (nameEl) nameEl.value = '';
  if (emailEl) emailEl.value = '';
  if (msgEl) msgEl.value = '';
  showInlineFeedback('Mensagem enviada com sucesso!', false);
  showModal('Mensagem enviada com sucesso!');
  return false;
}

let lastFocusedElementBeforeModal = null;
function showModal(text) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage');
  const modalClose = document.getElementById('modalClose');
  if (!modal || !modalMessage || !modalClose) return;
  modalMessage.textContent = text;
  modal.setAttribute('aria-hidden', 'false');

  lastFocusedElementBeforeModal = document.activeElement;
  modalClose.focus();

  document.addEventListener('focus', trapFocus, true);
}
function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');

  document.removeEventListener('focus', trapFocus, true);

  if (lastFocusedElementBeforeModal && typeof lastFocusedElementBeforeModal.focus === 'function') {
    lastFocusedElementBeforeModal.focus();
  }
}
function trapFocus(event) {
  const modal = document.getElementById('modal');
  if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
  if (!modal.contains(event.target)) {
    const focusable = modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
    else modal.focus();
    event.stopPropagation();
  }
}