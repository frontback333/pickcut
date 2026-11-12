import { mountFeatures } from './v21.js';
import { state, money } from '../state.js';
import { router } from '../router.js';
import { DESIGNERS, PAYMENT_METHODS, CARD_COMPANIES, PRODUCTS } from '../data.js';
import { mapState, mountMap, unmountMap } from '../map.js';
import { camera } from '../camera.js';
import { byId, text, toast, selected, enabled, accessible, logo } from './common.js';
import { check, button } from './forms.js';

export function setupScreen(screen, root) {
  const updates = [];
  const v = state.values;
  const get = id => byId(root, id);
  const bind = fn => updates.push(fn);
  const on = (id, fn, event = 'click') => {
    const node = get(id);
    if (!node) return;
    if (event === 'click') accessible(node);
    node.addEventListener(event, e => {
      if (node.disabled || node.getAttribute('aria-disabled') === 'true') return;
      if (event === 'click') {
        e.preventDefault();
        e.stopPropagation();
      }
      fn(e, node);
    });
  };
  const show = (id, value) => {
    const node = get(id);
    if (node) node.hidden = !value;
  };
  const label = (id, fn) => bind(() => text(root, id, fn()));
  const choices = (prefix, key, values, dark = false, multi = false) => {
    values.forEach(value => {
      const node = get(prefix + value);
      if (!node) return;
      node.dataset.choice = key;
      node.classList.toggle('dark', dark);
      const categoryTab = prefix === 'tab_' && (screen === 'Community' || screen === 'CommunityPro');
      node.classList.toggle('category-tab', categoryTab);
      on(prefix + value, () => {
        if (key === 'radius') mapState.setRadius(Number(value));
        else if (key === 'region') mapState.setRegion(Number(value) - 1);
        else if (multi) state.multi(key, value);
        else state.set(key, value);
      });
      bind(() => selected(node, multi ? v[key].includes(value) : v[key] === value || categoryTab && v[key] === 'all' && value === values[0], 'aria-pressed'));
    });
  };
  const toggle = (id, key) => {
    on(id, () => state.toggle(key));
    bind(() => {
      selected(get(id), !!v[key], get(id)?.getAttribute('role') === 'switch' ? 'aria-checked' : 'aria-pressed');
      selected(get(id + '_box'), !!v[key]);
    });
  };
  const input = (id, key) => {
    const node = get(id);
    if (!node) return;
    node.value = v[key];
    node.addEventListener('input', () => state.set(key, node.value));
    bind(() => {
      if (node.value !== v[key]) node.value = v[key];
    });
  };
  const action = (id, name) => on(id, () => actions[name]());
  const pack = (ids, order) => {
    ids.forEach((id, i) => {
      const node = get(id);
      if (node) {
        node.hidden = !order.includes(i);
        node.style.order = order.indexOf(i);
      }
    });
  };
  const actions = {
    delete: () => {
      camera.clear();
      toast('사진 삭제를 요청했어요');
    },
    notify: () => router.go('Notifications'),
    write: () => toast('글쓰기는 프로토타입이에요'),
    addRegion: () => toast('지역 추가는 프로토타입이에요'),
    cart: () => router.go('Cart'),
    login: () => {
      state.set('role','user');
      router.go('Main');
    },
    browse: () => {
      state.set('role','guest');
      router.go('Main');
    }
  };
  function addProduct(index) {
    const p = PRODUCTS[index];
    state.addProduct(p.key);
    toast(p.brand + ' ' + p.name + ' 장바구니에 담았어요');
  }
  on('btn_back', () => screen === 'PaymentMethod' ? router.go(v.payment_return) : router.back());
  action('btn_notify','notify');
  action('btn_delete_photos','delete');
  root.querySelectorAll('img[data-id$="_photo"], img[data-id^="video_photo_"], img[data-id="video_hero_photo"]').forEach(image => {
    const box = image.parentElement;
    image.addEventListener('error', () => {
      image.hidden = true;
      box.classList.add('image-missing');
      box.dataset.placeholder = image.dataset.id === 'ai_preview_photo' ? '[AI 예상 이미지]' : '[상품 사진]';
    });
    image.addEventListener('load', () => {
      image.hidden = false;
      box.classList.remove('image-missing');
    });
  });
  root.querySelectorAll('[data-id]').forEach(n => {
    if (n.tagName === 'A' && !n.hasAttribute('href')) accessible(n);
  });
  let timer;
  let cleanup = () => {};

  if (screen === 'Onboarding') action('btn_browse','browse');
  if (screen === 'SignUpRole') {
    choices('role_','signup_role',['user','designer']);
    label('btn_next', () => v.signup_role === 'designer' ? '디자이너로 계속하기' : '이용자로 계속하기');
    on('btn_next', () => router.go(v.signup_role === 'designer' ? 'SignUpDesigner' : 'SignUpUser'));
    action('btn_login','login');
  }
  if (screen === 'SignUpUser' || screen === 'SignUpDesigner') {
    const designer = screen === 'SignUpDesigner';
    const prefix = designer ? 'd_' : 'u_';
    const signup = () => {
      state.update({ role: designer ? 'designer' : 'user', talk: v.u_talk });
      router.go(designer ? 'Call' : 'Main');
      if (designer) toast('인증까지 보통 1일');
    };
    ['name','phone',...(designer ? ['license','shop','account'] : [])].forEach(k => input('input_' + k, prefix + k));
    ['kakao','naver','apple'].forEach(p => on('btn_' + p, signup));
    on('btn_signup', signup);
    on('btn_verify', () => {
      if (!/^01\d{8,9}$/.test(v[prefix + 'phone'].replace(/\D/g,''))) {
        toast('휴대폰 번호를 확인해 주세요');
        return;
      }
      state.set(prefix + 'verified',true);
      toast('인증번호를 보냈어요 (프로토타입: 123456)');
    });
    const termKeys = designer ? ['partner_terms','privacy','marketing'] : ['terms','privacy','age','marketing'];
    termKeys.forEach(k => toggle('chk_' + k, prefix + k));
    on('chk_all', () => {
      const checked = !termKeys.every(k => v[prefix + k]);
      state.update(Object.fromEntries(termKeys.map(k => [prefix + k,checked])));
    });
    bind(() => {
      selected(get('chk_all_box'),termKeys.every(k => v[prefix+k]));
      get('chk_all')?.setAttribute('aria-checked',String(termKeys.every(k => v[prefix+k])));
    });
    if (designer) {
      choices('shop_','d_shop_type',['has','none']);
      choices('career_','d_career',['new','mid','senior']);
      choices('spec_','d_specs',['cut','asperm','down','dye','care'],false,true);
      choices('radius_','d_radius',['3','5','10']);
      toggle('cert_care','d_care');
      bind(() => {
        get('input_shop').disabled = v.d_shop_type !== 'has';
      });
      on('input_shop', e => {
        if (e.key !== 'Enter') return;
        const match = DESIGNERS.find(d => v.d_shop.trim() && d.salon.includes(v.d_shop.trim()));
        if (match) {
          state.set('d_shop',match.salon);
          toast(match.salon + ' 매장을 선택했어요');
        } else toast('검색 결과가 없어요');
      },'keydown');
      on('license_file', (e,node) => {
        if (node.files?.[0]) {
          state.set('d_file',node.files[0].name);
          text(root,'btn_upload_license_text',node.files[0].name);
        }
      },'change');
    } else {
      choices('gender_','u_gender',['male','female','none']);
      choices('style_','u_styles',['cut','perm','dye','scalp','care'],false,true);
      choices('talk_','u_talk',['chatty','quiet']);
      on('region_1', () => mapState.reset());
      on('region_add', () => mapState.setRegion((mapState.region + 1) % 3));
      label('region_1', () => mapState.snapshot.neighborhood);
    }
  }
  if (screen === 'Main') {
    for (let i = 1; i <= 3; i++) on('card_designer_' + i, () => {
      state.update({ profile: i - 1, care_booking: false });
      router.go('Profile');
    });
  }
  if (screen === 'Scan' || screen === 'ScanConsent') {
    camera.clear();
    const opened = screen === 'ScanConsent' || !state.consentSeen && !new URLSearchParams(location.search).has('static');
    state.update({ consent_open: opened, consent_personal: opened ? false : v.consent_personal, consent_face: opened ? false : v.consent_face });
    choices('perm_','perm',['none','recent','old']);
    choices('iron_','iron',['no','daily']);
    label('txt_step', () => Math.min(3,v.captures+1) + ' / 3');
    if (screen === 'Scan') {
      ['front','side','back'].forEach((key,i) => {
        const pill = get('pill_' + key);
        const name = pill.textContent.trim();
        bind(() => {
          const complete = v.captures > i;
          const current = v.captures === i;
          pill.classList.toggle('is-complete', complete);
          pill.classList.toggle('is-current', current);
          pill.classList.toggle('is-pending', !complete && !current);
          pill.setAttribute('aria-label', name + ' · ' + (complete ? '찍음' : current ? '촬영 차례' : '남음'));
        });
      });
    }
    on('face_guide', () => {
      if (state.consentSeen && !v.consent_open) camera.capture(get('camera_area'));
    });
    on('btn_analyze', () => {
      if (!state.consentSeen || v.consent_open) return;
      if (v.camera === 'on' && v.photos < 3) camera.capture(get('camera_area'));
      else router.go('ScanInfo');
    });
    if (opened) cleanup = consent(root);
    else if (state.consentSeen) camera.start(get('camera_area'));
    const visible = () => {
      if (document.hidden) camera.stop();
      else if (!v.consent_open && state.consentSeen && router.current === 'Scan') camera.start(get('camera_area'));
    };
    document.addEventListener('visibilitychange',visible);
    const removeSheet = cleanup;
    cleanup = () => {
      document.removeEventListener('visibilitychange',visible);
      removeSheet();
      camera.stop();
    };
  }
  if (screen === 'MatchHome') {
    choices('seg_','match_segment',['live','history']);
    bind(() => {
      for (let i = 1; i <= 4; i++) show('live_row_' + i,v.match_segment === 'live');
      for (let i = 1; i <= 3; i++) show('history_row_' + i,v.match_segment === 'history');
    });
    label('txt_my_timer', () => '콜 마감까지 00:' + String(v.match_seconds).padStart(2,'0'));
  }
  if (screen === 'Result') {
    on('btn_rescan', () => router.go('Scan'));
  }
  if (screen === 'MatchSetup' || screen === 'MapPicker') {
    choices('radius_','radius',['1','3','5','10']);
    if (screen === 'MatchSetup') {
      choices('region_','region',['1','2','3']);
      choices('price_','price',['30k','50k','any']);
      choices('time_','time',['now','after15','pick']);
      choices('place_','place',['shop','shared']);
    }
    on('btn_my_location', () => mapState.reset());
    on('btn_map_zoom_in', () => mapState.zoomBy(1));
    on('btn_map_zoom_out', () => mapState.zoomBy(-1));
    on('btn_set_location', () => router.go('MatchSetup'));
    input('input_search_place','map_search');
    get('map_search_form')?.addEventListener('submit', e => {
      e.preventDefault();
      mapState.search(v.map_search);
    });
    get('input_search_place')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        mapState.search(v.map_search);
      }
    });
    const updateMap = () => {
      const s = mapState.snapshot;
      text(root,'txt_map_region',s.neighborhood + ' · 기본 지역');
      text(root,'txt_address',s.address);
      text(root,'txt_nearby',s.nearby);
    };
    const unsub = mapState.subscribe(updateMap);
    updateMap();
    mountMap(get('map_canvas'));
    cleanup = () => {
      unsub();
      unmountMap();
    };
  }
  if (screen === 'Match') {
    for (let i = 1; i <= 3; i++) {
      on('card_designer_' + i, () => state.set('designer',i-1));
      on('avatar_designer_' + i, () => {
        state.update({ profile: i - 1, care_booking: false });
        router.go('Profile');
      });
      bind(() => selected(get('card_designer_'+i),v.designer===i-1));
    }
    label('txt_timer', () => '콜 마감까지 00:' + String(v.match_seconds).padStart(2,'0'));
    label('btn_confirm', () => state.designer.name + ' 디자이너로 확정');
    label('txt_go_hint', () => state.designer.time + '까지 ' + state.designer.salon + '로 가세요');
  }
  if (screen === 'Payment') {
    toggle('sw_discount','discount');
    toggle('chk_policy','policy');
    bind(() => {
      selected(get('policy_box'),v.policy);
      show('discount_row',v.discount);
      enabled(get('btn_pay'),v.policy);
      logo(get('pay_selected_logo'),v.payment);
      text(root,'pay_selected_logo_text',state.method.badge);
    });
    label('txt_total', () => money(state.total));
    label('btn_pay', () => money(state.total) + ' 결제하기');
    label('txt_pay_method', () => state.method.name);
    label('txt_pay_method_sub', () => state.method.sub);
    label('txt_payment_avatar', () => state.reservation.avatar);
    label('txt_payment_designer', () => state.reservation.name + ' 디자이너');
    label('txt_payment_salon', () => state.reservation.salon + ' · ' + state.reservation.distance);
    label('txt_payment_style', () => state.reservation.style + ' · 오늘 ' + state.reservation.time);
    on('btn_change_pay', () => {
      state.set('payment_return', 'Payment');
      router.go('PaymentMethod');
    });
    on('btn_pay', () => {
      if (!v.policy) return;
      state.completeBooking();
      router.go('BookingDone');
    });
  }
  if (screen === 'PaymentMethod') {
    state.set('payment_tab',PAYMENT_METHODS[v.payment].tab);
    ['easy','card','other'].forEach(tab => {
      on('tab_'+tab, () => state.set('payment_tab',tab));
      bind(() => {
        selected(get('tab_'+tab),v.payment_tab===tab);
        show('sec_'+tab,v.payment_tab===tab);
      });
    });
    Object.keys(PAYMENT_METHODS).forEach(key => {
      on('pm_'+key, () => state.set('payment',key));
      bind(() => selected(get('radio_'+key),v.payment===key));
      logo(get('logo_'+key),key);
    });
    Object.keys(CARD_COMPANIES).forEach(key => {
      on('cardco_'+key, () => state.update({ card_company: key, payment: 'card' }));
      const node = get('cardco_'+key);
      node.dataset.choice = 'card_company';
      bind(() => selected(node,v.card_company===key));
    });
    label('btn_pay_method_done', () => state.method.name + '로 선택 완료');
    bind(() => enabled(get('btn_pay_method_done'),state.paymentReady));
    on('btn_pay_method_done', () => {
      router.go(v.payment_return);
      if (v.payment_return === 'MyPage') toast('기본 결제 수단을 바꿨어요');
    });
  }
  if (screen === 'BookingDone') {
    const b = state.booking;
    text(root,'txt_booking_hint',b.time + '까지 ' + b.salon + '로 가세요');
    text(root,'txt_booking_designer',b.name);
    text(root,'txt_booking_salon',b.salon + ' · ' + b.distance);
    text(root,'txt_booking_time','오늘 ' + b.time);
    text(root,'txt_booking_payment',b.payment + ' ' + b.amount);
  }
  if (screen === 'Review') {
    for (let i = 1; i <= 20; i++) {
      const key = 'rating_' + Math.floor((i-1)/5);
      const score = (i-1)%5+1;
      on('star_'+i, () => state.set(key,score));
      bind(() => {
        const node = get('star_'+i);
        if (node) node.style.color = score <= v[key] ? 'var(--primary)' : 'var(--borderStrong)';
      });
    }
    input('input_review','review');
    on('btn_add_photo', () => toast('사진 첨부는 프로토타입이에요'));
    on('btn_submit', () => {
      router.go('Profile');
      toast('리뷰가 등록됐어요');
    });
  }
  if (screen === 'Care') {
    choices('who_','who',['self','guardian']);
    choices('place_','care_place',['shop','home']);
    ['wheelchair','sensory','short','visual'].forEach(k => {
      toggle('need_'+k,'need_'+k);
      bind(() => selected(get('check_'+k),v['need_'+k]));
    });
    const hint = document.createElement('p');
    hint.dataset.id = 'txt_homecare_hint';
    hint.className = 'notice';
    hint.textContent = '케어 인증 미용사가 집으로 찾아가요 · 출장비는 지원 대상이면 감면돼요';
    const support = get('btn_check_support');
    support?.parentElement.before(hint);
    bind(() => show('txt_homecare_hint',v.care_place==='home'));
  }
  if (screen === 'CareSupport') {
    ['disabled','lowincome','seodaemun'].forEach(q => choices('elig_'+q+'_','elig_'+q,['yes','no']));
    label('txt_elig_result', () => state.eligibility);
    for (let i = 1; i <= 7; i++) on('btn_route_'+i, () => toast('길찾기는 프로토타입이에요'));
  }
  if (screen === 'Call') {
    input('input_price','offer_price');
    input('input_time','offer_time');
    toggle('pill_status','receiving');
    label('pill_status', () => v.receiving ? '콜 받는 중' : '콜 쉬는 중');
    label('txt_call_timer', () => v.call_seconds + '초 남음');
    label('txt_conversation', () => v.talk === 'quiet' ? '조용히 받고 싶어요' : '이야기 나누는 게 좋아요');
    on('btn_accept', () => toast('콜을 수락했어요. 고객이 고르면 알려드릴게요'));
    on('btn_reject', () => toast('다음 콜을 기다려요'));
  }
  if (screen === 'Profile') {
    const d = state.profile;
    text(root,'txt_profile_avatar',d.avatar);
    text(root,'txt_profile_name',d.name + ' 디자이너');
    text(root,'txt_profile_salon',d.salon + ' · 경력 1년');
    text(root,'txt_profile_rating','★ ' + d.rating);
    text(root,'txt_profile_reviews','리뷰 ' + d.reviews + '개');
    text(root,'btn_book',d.name + ' 디자이너에게 예약');
    on('btn_book', () => {
      state.coupon = null;
      state.set('designer',v.profile);
      router.go('Payment');
    });
  }
  if (screen === 'DesignerList') {
    input('input_search','search');
    choices('rank_','rank',['all','asperm','shampoo','rising','care'],true);
    for (let i = 0; i < 6; i++) on('row_designer_'+i, () => {
      state.update({ profile: i === 0 ? 5 : i - 1, care_booking: false });
      router.go('Profile');
    });
    bind(() => pack(Array.from({ length: 6 },(_,i) => 'row_designer_'+i),state.designerIndices.map(i => i === 5 ? 0 : i+1)));
  }
  if (screen === 'SharedSalon') {
    choices('card_salon_','salon',['1','2']);
    on('btn_choose', () => {
      state.set('place','shared');
      router.go('MatchSetup');
    });
  }
  if (screen === 'Community' || screen === 'CommunityPro') {
    const pro = screen === 'CommunityPro';
    const postList = get('post_1')?.parentElement;
    if (postList) Array.from(postList.children).filter(n => !n.dataset.id).forEach(n => {
      n.style.order = 100;
    });
    choices('tab_',pro ? 'pro_tab' : 'community_tab',pro ? ['knowhow','question','care_edu','model','market','suggest'] : ['talk','review','qa','care','event','suggest']);
    choices('chip_',pro ? 'pro_chip' : 'community_chip',pro ? ['recommend','popular','cut','perm','care','shop'] : ['recommend','popular','mencut','perm','dye','scalp'],true);
    on('seg_consumer', () => router.go('Community'));
    on('seg_pro', () => router.go('CommunityPro'));
    action('btn_write','write');
    bind(() => pack(Array.from({ length: pro ? 5 : 6 },(_,i) => 'post_'+(i+1)),state.postIndices(pro)));
  }
  if (screen === 'Store') {
    input('input_search','store_search');
    choices('cat_','store_category',['all','shampoo','scalp','styling','tools','care'],true);
    for (let i = 1; i <= 7; i++) on('btn_add_'+i, () => addProduct(Math.max(0,i-2)));
    for (let i = 1; i <= 3; i++) on('video_'+i, () => {
      state.set('video',i-1);
      router.go('StyleVideo');
    });
    label('txt_cart_badge', () => String(v.cart));
    action('btn_cart','cart');
    bind(() => pack(Array.from({ length: 6 },(_,i) => 'product_'+(i+1)),state.productIndices));
  }
  if (screen === 'StyleVideo') {
    toggle('btn_play','playing');
    on('btn_add_1', () => addProduct(0));
    on('btn_add_2', () => addProduct(2));
    state.update({ playing: false, video_seconds: 0 });
    label('txt_time', () => Math.floor(v.video_seconds/60) + ':' + String(v.video_seconds%60).padStart(2,'0') + ' / 3:12');
    const progress = get('video_progress_fill');
    bind(() => {
      if (progress) progress.style.width = Math.max(2,v.video_seconds/192*100) + '%';
      get('btn_play')?.setAttribute('aria-label',v.playing ? '일시정지' : '재생');
    });
  }
  if (screen === 'MyPage') {
    choices('region_','region',['1','2','3']);
    choices('talk_','talk',['chatty','quiet']);
    action('btn_add_region','addRegion');
    on('link_payment', () => {
      state.set('payment_return', 'MyPage');
      router.go('PaymentMethod');
    });
  }
  if (['Match','MatchHome','Call','StyleVideo'].includes(screen)) {
    if (screen === 'Match' || screen === 'MatchHome') state.set('match_seconds',42);
    if (screen === 'Call') state.set('call_seconds',24);
    if (!new URLSearchParams(location.search).has('static')) timer = setInterval(() => {
      if (screen === 'Match' || screen === 'MatchHome') state.set('match_seconds',Math.max(0,v.match_seconds-1));
      if (screen === 'Call' && v.receiving) state.set('call_seconds',Math.max(0,v.call_seconds-1));
      if (screen === 'StyleVideo' && v.playing) state.update({ video_seconds: Math.min(192,v.video_seconds+1), playing: v.video_seconds+1<192 });
    },1000);
  }
  const refresh = () => updates.forEach(fn => fn());
  const unsub = state.subscribe(refresh);
  refresh();
  const disposeFeatures = mountFeatures(screen, root);
  return () => {
    disposeFeatures();
    clearInterval(timer);
    unsub();
    cleanup();
  };
}

function consent(root) {
  const overlay = document.getElementById('overlay');
  overlay.innerHTML = `<div class="consent-overlay" data-id="consent_dim"><section class="consent-sheet" data-id="live_consent_sheet" role="dialog" aria-modal="true" aria-labelledby="consent-title"><div class="sheet-handle"></div><h2 id="consent-title">촬영 전에 확인해주세요</h2><p>사진은 비공개로 저장되고, 내가 고른 미용사에게만 보여요</p><div class="consent-info">수집 — 얼굴·두상 사진 3장, 최근 시술 정보<br>목적 — 헤어 기본 정보 정리, 미용사 매칭<br>보관 — 예약 완료 30일 후 자동 삭제(언제든 삭제 요청 가능)</div>${check('chk_personal','[필수] 개인정보 수집·이용 동의 ›')}${check('chk_face','[필수] 얼굴 사진(민감정보) 처리 동의 ›')}<div class="hide-face"><div><b>매칭할 때 얼굴 가리기</b><p>미용사에게 두상·머리만 보여줘요</p></div><button data-id="sw_hide_face" class="switch" role="switch" aria-label="매칭할 때 얼굴 가리기"></button></div>${button('btn_agree','동의하고 카메라 켜기')}<button data-id="btn_consent_later" class="text-button">다음에 할게요</button></section></div>`;
  root.inert = true;
  const get = id => byId(overlay,id);
  const refresh = () => {
    selected(get('chk_personal_box'),state.values.consent_personal);
    selected(get('chk_face_box'),state.values.consent_face);
    selected(get('sw_hide_face'),state.values.hide_face,'aria-checked');
    enabled(get('btn_agree'),state.values.consent_personal && state.values.consent_face);
  };
  ['personal','face'].forEach(key => get('chk_'+key).addEventListener('click', () => state.toggle('consent_'+key)));
  get('sw_hide_face').addEventListener('click', () => state.toggle('hide_face'));
  let closing;
  const close = agree => {
    if (closing) return;
    if (agree && !(state.values.consent_personal && state.values.consent_face)) return;
    state.consentSeen = agree;
    byId(overlay,'consent_dim').classList.add('closing');
    closing = setTimeout(() => {
      overlay.replaceChildren();
      root.inert = false;
      state.set('consent_open',false);
      if (!agree) router.go('Main');
      else if (router.current === 'ScanConsent') router.go('Scan');
      else camera.start(byId(root,'camera_area'));
    },250);
  };
  get('btn_agree').addEventListener('click', () => close(true));
  get('btn_consent_later').addEventListener('click', () => close(false));
  const unsub = state.subscribe(refresh);
  refresh();
  return () => {
    clearTimeout(closing);
    unsub();
    root.inert = false;
    overlay.replaceChildren();
  };
}
