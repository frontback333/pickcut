export const icon = (name, size = 20) => {
  const paths = {
    camera: '<path d="M3 7h4l2-3h6l2 3h4v13H3z"/><circle cx="12" cy="13" r="4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 10-12h-7z"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/>'
  };
  return `<svg class="v-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
};
export const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const card = (id, content) => `<section class="v-card" data-id="${id}">${content}</section>`;
export const chips = (prefix, items, group = '') => `<div class="v-chips ${group}">${items.map(([id, label]) => `<button class="v-chip" data-id="${prefix}${id}" aria-pressed="false">${label}</button>`).join('')}</div>`;
export const footer = (id, label) => `<footer class="v-footer" data-id="bottom_bar"><button class="primary-button" data-id="${id}">${label}</button></footer>`;
