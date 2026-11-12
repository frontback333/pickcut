import { SCREEN_TITLES } from './data.js';
import { state } from './state.js';
import { router } from './router.js';
import { mapState } from './map.js';
import { byId, text } from './ui/common.js';

export function devpanel() {
  const root = document.getElementById('devpanel');
  const launcher = document.querySelector('[data-id="btn_devtools"]');
  const scrim = document.querySelector('[data-id="devtools_scrim"]');
  const workspace = document.getElementById('workspace');
  const narrow = matchMedia('(max-width: 760px)');
  const option = new URLSearchParams(location.search).get('dev');
  const disabled = option === '0';
  let opened = option === '1' && narrow.matches && !disabled;
  document.body.classList.toggle('dev-disabled', disabled);
  document.body.classList.toggle('dev-enabled', !disabled);
  const groups = [
    ['Onboarding','SignUpRole','SignUpUser','SignUpDesigner','Main','Scan','ScanConsent','ScanInfo','Result'],
    ['MatchHome','MatchSetup','MapPicker','Match','Payment','PaymentMethod','BookingDone','Notifications','Review'],
    ['Care','CareSupport','Call','ProSchedule','Profile','DesignerList','SharedSalon'],
    ['Community','CommunityPro','Store','Cart','StyleVideo','MyPage']
  ];
  const headings = ['01 ENTRY / SCAN','02 MATCH / BOOKING','03 CARE / DESIGNER','04 COMMUNITY / STORE'];
  const keys = ['route','history','role','consent','payMethod','cart','map','camera','photos','diag','coupon','delay','noti','booking'];
  root.innerHTML = `<div class="dev-title"><b id="devtools-title">▣ PickCut DevTools</b><small>web · prototype</small><button data-id="btn_devtools_close" class="dev-close" aria-label="개발자 도구 닫기">×</button></div><div class="dev-tabs">${['screens','state','flow'].map(k => `<button data-id="dev_tab_${k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div><div class="dev-filter" data-id="dev_filter_row"><input data-id="dev_filter" placeholder="Filter screens..."></div><div class="dev-tree" data-id="dev_tree_scroll">${groups.map((g,i) => `<div data-id="dev_group_${i+1}" class="dev-group">▾ ${headings[i]}</div>${g.map(id => `<button data-id="dev_row_${id}" class="dev-row" title="${SCREEN_TITLES[id]}">${["ScanInfo","Notifications","ProSchedule","Cart"].includes(id) ? '<i class="dev-new"></i>' : "◇ "}${id}Screen</button>`).join('')}`).join('')}</div><div class="dev-state" data-id="dev_state"><h3>STATE</h3>${keys.map(k => `<div class="dev-state-row" data-id="dev_state_${k}"><span>${k} =</span><code data-id="txt_state_${k}"></code></div>`).join('')}</div><div class="dev-flow" data-id="dev_flow_scroll"></div><div class="dev-status" data-id="txt_dev_status"></div>`;
  const close = byId(root, 'btn_devtools_close');
  root.setAttribute('aria-labelledby', 'devtools-title');
  function drawer(value, focus = true) {
    opened = value && narrow.matches && !disabled;
    document.body.classList.toggle('dev-open', opened);
    launcher.setAttribute('aria-expanded', String(opened));
    root.inert = disabled || narrow.matches && !opened;
    root.setAttribute('aria-hidden', String(root.inert));
    workspace.inert = opened;
    if (narrow.matches) {
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-modal', 'true');
    } else {
      root.removeAttribute('role');
      root.removeAttribute('aria-modal');
    }
    if (focus && narrow.matches && !disabled) {
      (opened ? close : launcher).focus();
    }
  }
  launcher.addEventListener('click', () => drawer(true));
  close.addEventListener('click', () => drawer(false));
  scrim.addEventListener('click', () => drawer(false));
  narrow.addEventListener('change', () => drawer(false));
  document.addEventListener('keydown', e => {
    if (!opened) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      drawer(false);
    } else if (e.key === 'Tab') {
      const controls = [...root.querySelectorAll('button, input')].filter(node => node.getClientRects().length && !node.disabled);
      const first = controls[0];
      const last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first || !e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    }
  });
  root.addEventListener('click', e => {
    const id = e.target.closest('[data-id]')?.dataset.id;
    if (id?.startsWith('dev_tab_')) state.set('dev_tab',id.slice(8));
    if (id?.startsWith('dev_row_')) {
      router.go(id.slice(8));
      if (narrow.matches) drawer(false);
    }
  });
  byId(root,'dev_filter').addEventListener('input', e => state.set('dev_filter',e.target.value));
  function refresh() {
    const v = state.values;
    const show = (id, visible) => {
      byId(root,id).hidden = !visible;
    };
    ['screens','state','flow'].forEach(k => byId(root,'dev_tab_'+k).classList.toggle('active',v.dev_tab===k));
    show('dev_filter_row',v.dev_tab==='screens');
    show('dev_tree_scroll',v.dev_tab==='screens');
    show('dev_state',v.dev_tab!=='flow');
    show('dev_flow_scroll',v.dev_tab==='flow');
    byId(root,'dev_state').classList.toggle('expanded',v.dev_tab==='state');
    groups.forEach((g,i) => {
      const matches = g.filter(id => (id+'Screen').toLowerCase().includes(v.dev_filter.trim().toLowerCase()));
      show('dev_group_'+(i+1),matches.length>0);
      g.forEach(id => {
        const row = byId(root,'dev_row_'+id);
        row.hidden = !matches.includes(id);
        row.classList.toggle('active',router.current===id);
        row.setAttribute('aria-current',router.current===id ? 'page' : 'false');
      });
    });
    const values = { route: router.current, history: router.history, role: v.role, consent: v.consent_personal && v.consent_face, payMethod: v.payment, cart: v.cart, map: mapState.provider + ' · geocoder=' + mapState.geocoder, camera: v.camera, photos: v.photos, diag: state.diag, coupon: state.coupon, delay: state.delay, noti: state.noti, booking: state.booking };
    keys.forEach(k => text(root,'txt_state_'+k,JSON.stringify(values[k])));
    const flow = byId(root,'dev_flow_scroll');
    flow.replaceChildren(...router.visits.map((id,i) => {
      const row = document.createElement('div');
      row.dataset.id = 'dev_visit_'+i;
      row.textContent = (i+1)+'  '+id;
      return row;
    }));
    text(root,'txt_dev_status','31 screens · '+router.current+' · '+mapState.provider);
  }
  state.subscribe(refresh);
  router.subscribe(refresh);
  refresh();
  drawer(opened);
}
