/* Persistência de tema entre páginas, menu mobile e formulário com modal */

document.addEventListener('DOMContentLoaded', () => {
  // Ano no footer
  document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());

  // Aplicar tema salvo
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {}

  // Toggle tema
  const themeButtons = document.querySelectorAll('.theme-toggle');
  function updateThemeVisual() {
    const isDark = document.documentElement.classList.contains('dark');
    themeButtons.forEach(btn => {
      btn.setAttribute('aria-pressed', String(isDark));
      btn.classList.toggle('is-dark', isDark);
    });
  }
  updateThemeVisual();
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch (e) {}
      updateThemeVisual();
    });
  });

  // Menu mobile
  document.querySelectorAll('.nav-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      const headerInner = e.currentTarget.closest('.header-inner');
      const nav = headerInner?.querySelector('.main-nav');
      if (!nav) return;
      const open = nav.classList.toggle('open');
      e.currentTarget.setAttribute('aria-expanded', String(open));
      nav.setAttribute('aria-hidden', String(!open));
      if (open) nav.querySelector('a')?.focus();
    });
  });
  document.querySelectorAll('.main-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      const nav = e.currentTarget.closest('.main-nav');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        nav.setAttribute('aria-hidden', 'false');
        nav.closest('.header-inner')?.querySelectorAll('.nav-toggle')
          .forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      }
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.main-nav.open').forEach(nav => {
        nav.classList.remove('open');
        nav.setAttribute('aria-hidden', 'false');
        nav.closest('.header-inner')?.querySelectorAll('.nav-toggle')
          .forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      });
      const modal = document.getElementById('modal');
      if (modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
    }
  });

  // Formulário
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', handleSubmit);
    form.addEventListener('reset', () => {
      clearFieldErrors();
      const feedback = document.getElementById('formFeedback');
      if (feedback) feedback.textContent = '';
    });
  }

  // Modal
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
});

/* Validação de e-mail */
function isValidEmail(email) {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

/* Erros por campo */
function setFieldError(fieldId, message) {
  const err = document.getElementById('err-' + fieldId);
  if (err) err.textContent = message;
  const field = document.getElementById(fieldId);
  if (field) {
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    field.classList.toggle('has-error', !!message);
  }
}
function clearFieldErrors() {
  ['name','email','message'].forEach(id => {
    const err = document.getElementById('err-' + id);
    if (err) err.textContent = '';
    const field = document.getElementById(id);
    if (field) {
      field.removeAttribute('aria-invalid');
      field.classList.remove('has-error');
    }
  });
}
function showInlineFeedback(text, isError) {
  const feedback = document.getElementById('formFeedback');
  if (!feedback) return;
  feedback.textContent = text;
  feedback.style.color = isError ? '#d9534f' : 'var(--link)';
}

/* Submit */
function handleSubmit(e) {
  e.preventDefault();
  clearFieldErrors();

  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const msgEl = document.getElementById('message');

  const name = nameEl?.value.trim() || '';
  const email = emailEl?.value.trim() || '';
  const message = msgEl?.value.trim() || '';

  if (!name) { setFieldError('name', 'Informe seu nome.'); nameEl?.focus(); showInlineFeedback('Corrija os campos destacados.', true); return; }
  if (!email) { setFieldError('email', 'Informe seu e-mail.'); emailEl?.focus(); showInlineFeedback('Corrija os campos destacados.', true); return; }
  if (!isValidEmail(email)) { setFieldError('email', 'E-mail inválido. Use usuario@dominio.com'); emailEl?.focus(); showInlineFeedback('Corrija os campos destacados.', true); return; }
  if (!message || message.length < 10) { setFieldError('message', 'A mensagem deve ter ao menos 10 caracteres.'); msgEl?.focus(); showInlineFeedback('Corrija os campos destacados.', true); return; }

  // Simulação de envio
  if (nameEl) nameEl.value = '';
  if (emailEl) emailEl.value = '';
  if (msgEl) msgEl.value = '';
  showInlineFeedback('Mensagem enviada com sucesso!', false);
  showModal('Mensagem enviada com sucesso!');
}

/* Modal com focus trap simples */
let lastFocusedBeforeModal = null;
function showModal(text) {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modalMessage');
  const modalClose = document.getElementById('modalClose');
  if (!modal || !modalClose) return;
  if (modalMessage) modalMessage.textContent = text;
  modal.setAttribute('aria-hidden', 'false');
  lastFocusedBeforeModal = document.activeElement;
  modalClose.focus();
  document.addEventListener('focus', trapFocus, true);
}
function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  document.removeEventListener('focus', trapFocus, true);
  if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') lastFocusedBeforeModal.focus();
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
