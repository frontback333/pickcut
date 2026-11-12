export const byId = (root, id) => root.querySelector(`[data-id="${id}"]`);
export function text(root, id, value) {
  const node = byId(root, id);
  if (node) node.textContent = value;
}
export function toast(message) {
  const node = document.querySelector('[data-id="toast"]');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('visible'), 2000);
}
export function accessible(node, role = 'button') {
  if (!node) return;
  if (!['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(node.tagName)) {
    node.setAttribute('role', role);
    node.setAttribute('tabindex', '0');
  }
}
export function selected(node, value, role = '') {
  if (!node) return;
  node.classList.toggle('selected', value);
  if (role) node.setAttribute(role, String(value));
}
export function enabled(node, value) {
  if (!node) return;
  if (node.tagName === 'BUTTON') node.disabled = !value;
  node.setAttribute('aria-disabled', String(!value));
}
export function logo(node, key) {
  if (!node) return;
  const easy = ['kakao','naver','toss','payco','samsung','apple'];
  node.style.setProperty('--pay-bg', easy.includes(key) ? `var(--brand-${key})` : 'var(--primaryTint)');
  node.style.setProperty('--pay-ink', key === 'kakao' ? 'var(--ink)' : easy.includes(key) ? 'var(--surface)' : 'var(--primaryText)');
}
