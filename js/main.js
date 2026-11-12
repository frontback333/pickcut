import { SCREEN_IDS } from './data.js';
import { router } from './router.js';
import { state } from './state.js';
import { devpanel } from './devpanel.js';
import { mapState } from './map.js';
import { camera } from './camera.js';

const modules = Object.fromEntries(await Promise.all(SCREEN_IDS.map(async id => [id, await import('./screens/' + id + '.js')])));
const app = document.getElementById('app');
let dispose = () => {};
function render() {
  dispose();
  const module = modules[router.current];
  app.innerHTML = module.markup;
  app.dataset.route = router.current;
  dispose = module.mount(app);
  state.emit();
}
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#/"]');
  if (!link) return;
  e.preventDefault();
  if (link.getAttribute('aria-disabled') === 'true') return;
  const target = link.getAttribute('href').slice(2);
  if (target === 'Scan') state.update({ scan_context: 'normal', care_booking: false });
  if (['MatchSetup', 'Match', 'DesignerList', 'Profile'].includes(target)) {
    state.coupon = null;
    state.set('care_booking', false);
  }
  router.go(target);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"], [role="checkbox"]') && e.target.tagName !== 'BUTTON') {
    e.preventDefault();
    e.target.click();
  }
});
function resize() {
  const panelWidth = document.body.classList.contains('dev-disabled') ? 0 : 320;
  const scale = Math.min(1.15,(innerHeight-40)/844,(innerWidth-panelWidth-40)/390);
  document.documentElement.style.setProperty('--phone-scale',Math.max(.1,scale));
}
window.addEventListener('resize',resize);
router.subscribe(render);
devpanel();
resize();
render();
// Readable state is shared with the DevPanel and headless verification tools.
window.pickcut = { router, state, mapState, camera, ready: true };
