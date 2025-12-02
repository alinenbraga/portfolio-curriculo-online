/* main.js
   - Persistência de tema (localStorage)
   - Menu mobile acessível (toggle, Esc, fechar ao clicar em link)
   - Validação por campo com foco no primeiro erro
   - Modal acessível com focus trap simples e retorno de foco
*/

document.addEventListener('DOMContentLoaded', () => {
  // Atualiza ano nos rodapés (se existirem)
  ['year','year2','year3','year4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = new Date().getFullYear();
  });

  // --- Aplica preferência de tema imediatamente ao carregar a página ---
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }

  // Atualiza todos os botões de tema (ícone e aria-pressed) imediatamente
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    const isDark = document.body.classList.contains('dark');
    btn.setAttribute('aria-pressed', String(isDark));
    btn.textContent = isDark ? '☀️' : '🌙';
  });

  // Configura botão(s) de tema (pode haver mais de um)
  const themeToggleButtons = document.querySelectorAll('.theme-toggle');
  themeToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggleButtons.forEach(b => {
        b.setAttribute('aria-pressed', String(isDark));
        b.textContent = isDark ? '☀️' : '🌙';
      });
    });
  });

  // Menu mobile (hamburger)
  const toggles = document.querySelectorAll('.nav-toggle');
  toggles.forEach(t => {
    t.addEventListener('click', (e) => {
      const header = e.currentTarget.closest('.header-inner');
      const nav = header ? header.querySelector('#mainNav') : null;
      if (!nav) return;
      const open = nav.classList.toggle('open');
      e.currentTarget.setAttribute('aria-expanded', String(open));
      if (open) {
        const firstLink = nav.querySelector('a');
        if (firstLink) firstLink.focus();
      }
    });
  });

  // Fecha menu com Esc e fecha modal se aberto
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const nav = document.querySelector('#mainNav.open');
      if (nav) {
        nav.classList.remove('open');
        document.querySelectorAll('.nav-toggle').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      }
      const modal = document.getElementById('modal');
      if (modal && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    }
  });

  // Fecha menu ao clicar em um link (útil em mobile)
  document.querySelectorAll('#mainNav a').forEach(a => {
    a.addEventListener('click', () => {
      const nav = document.getElementById('mainNav');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        document.querySelectorAll('.nav-toggle').forEach(btn => btn.setAttribute('aria-expanded', 'false'));
      }
    });
  });

  // Modal: configura botões e clique fora
  const modal = document.getElementById('modal');
  const modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Formulário de contato
  const form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', handleSubmit);
  if (form) form.addEventListener('reset', () => {
    clearFieldErrors();
    const feedback = document.getElementById('formFeedback');
    if (feedback) feedback.textContent = '';
  });
});

/* Validação de e-mail simples */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Mostra erro em campo específico */
function setFieldError(fieldId, message) {
  const err = document.getElementById('err-' + fieldId);
  if (err) err.textContent = message;
  const field = document.getElementById(fieldId);
  if (field) field.setAttribute('aria-invalid', !!message);
}

/* Limpa todos os erros de campo */
function clearFieldErrors() {
  ['name', 'email', 'message'].forEach(id => {
    const err = document.getElementById('err-' + id);
    if (err) err.textContent = '';
    const field = document.getElementById(id);
    if (field) field.removeAttribute('aria-invalid');
  });
}

/* Feedback inline (mensagem geral) */
function showInlineFeedback(text, isError) {
  const feedback = document.getElementById('formFeedback');
  if (!feedback) return;
  feedback.textContent = text;
  feedback.style.color = isError ? '#d9534f' : 'var(--accent)';
}

/* Envio do formulário com validação por campo */
function handleSubmit(e) {
  e.preventDefault();
  clearFieldErrors();
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const msgEl = document.getElementById('message');

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const message = msgEl.value.trim();

  if (!name) {
    setFieldError('name', 'Informe seu nome.');
    nameEl.focus();
    showInlineFeedback('Corrija os campos destacados.', true);
    return false;
  }
  if (!email) {
    setFieldError('email', 'Informe seu e-mail.');
    emailEl.focus();
    showInlineFeedback('Corrija os campos destacados.', true);
    return false;
  }
  if (!isValidEmail(email)) {
    setFieldError('email', 'E-mail inválido. Use o formato usuario@dominio.com');
    emailEl.focus();
    showInlineFeedback('Corrija os campos destacados.', true);
    return false;
  }
  if (!message || message.length < 10) {
    setFieldError('message', 'A mensagem deve ter ao menos 10 caracteres.');
    msgEl.focus();
    showInlineFeedback('Corrija os campos destacados.', true);
    return false;
  }

  // Simulação de envio (remova quando integrar)
  nameEl.value = '';
  emailEl.value = '';
  msgEl.value = '';
  showInlineFeedback('Mensagem enviada com sucesso!', false);
  showModal('Mensagem enviada com sucesso!');
  return false;
}

/* Modal com focus trap simples */
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

  // focus trap básico
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

/* Impede foco fora do modal quando aberto (focus trap simples) */
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