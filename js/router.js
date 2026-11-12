import { SCREEN_IDS } from './data.js';

const defaults = { ScanInfo: 'Scan', Notifications: 'Main', ProSchedule: 'Call', Cart: 'Store', Scan: 'Main', ScanConsent: 'Main', Result: 'Scan', MatchSetup: 'Result', MapPicker: 'MatchSetup', Match: 'MatchSetup', Payment: 'Match', PaymentMethod: 'Payment', Review: 'BookingDone', CareSupport: 'Care', SharedSalon: 'MatchSetup', StyleVideo: 'Store', SignUpRole: 'Onboarding', SignUpUser: 'SignUpRole', SignUpDesigner: 'SignUpRole' };
const listeners = new Set();
const initial = decodeURIComponent(location.hash.slice(2));
export const router = {
  current: SCREEN_IDS.includes(initial) ? initial : 'Onboarding',
  history: [],
  visits: [],
  go(id) {
    if (!SCREEN_IDS.includes(id) || id === this.current) return;
    history.pushState({ pickcut: true }, '', '#/' + id);
    change(id);
  },
  back() {
    if (this.history.length) history.back();
    else this.go(defaults[this.current] || 'Main');
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};
let index = 0;
let routes = [router.current];
history.replaceState({ pickcut: true, index }, '', '#/' + router.current);
router.visits.push(router.current);

function change(id, pop = false, newIndex = index + 1) {
  if (pop) index = newIndex;
  else {
    index++;
    routes = routes.slice(0, index);
    routes[index] = id;
    history.replaceState({ pickcut: true, index }, '', '#/' + id);
  }
  router.current = id;
  router.history = routes.slice(0, index);
  router.visits.push(id);
  listeners.forEach(fn => fn(id));
}

window.addEventListener('popstate', event => {
  const id = decodeURIComponent(location.hash.slice(2));
  if (SCREEN_IDS.includes(id)) change(id, true, event.state?.index ?? 0);
});
window.addEventListener('hashchange', () => {
  const id = decodeURIComponent(location.hash.slice(2));
  if (id !== router.current && SCREEN_IDS.includes(id)) change(id);
});
