import { state, money } from '../state.js';
import { router } from '../router.js';
import { camera } from '../camera.js';
import { FLASH_DEALS, PORTFOLIO } from '../data.js';
import { byId, text, toast } from './common.js';
import { icon, card, escapeHTML } from './v21-common.js';

export function mountFeatures(screen, root) {
  const get = id => byId(root, id);
  const v = state.values;
  const updates = [];
  let dispose = () => {};
  const tags = values => values.map(label => `<span class="v-tag">${escapeHTML(label)}</span>`).join('');
  const insert = html => {
    const holder = document.createElement('div');
    holder.innerHTML = html;
    return holder.firstElementChild;
  };
  if (screen === 'Main' || screen === 'MatchHome') {
    get('btn_notify').style.position = 'relative';
    get('btn_notify').insertAdjacentHTML('beforeend', '<i class="bell-dot" data-id="badge_noti"></i>');
    updates.push(() => get('badge_noti').hidden = !state.noti);
  }
  if (screen === 'Scan' && v.scan_context === 'care') {
    text(root, 'pill_style', '케어컷 진단 · 보호자가 찍어도 돼요');
    text(root, 'txt_scan_guide', '머리 모양이 보이면 괜찮아요');
    text(root, 'txt_scan_hint', '얼굴이 원에 다 안 들어와도 돼요. 화면 아무 곳이나 눌러도 찍혀요');
    get('camera_area').classList.add('care-camera');
    get('camera_area').setAttribute('role', 'button');
    get('camera_area').setAttribute('tabindex', '0');
    get('camera_area').setAttribute('aria-label', '카메라 영역 어디를 눌러도 촬영');
    get('camera_area').onclick = () => {
      if (state.consentSeen && !v.consent_open) camera.capture(get('camera_area'));
    };
  }
  if (screen === 'Care') {
    const scan = insert(card('card_care_scan', `<div class="care-scan-head"><span class="care-camera-icon">${icon('camera', 24)}</span><div><h3>원하는 스타일도 AI로 미리 확인해요</h3><p class="v-caption">사진 3장이면 돼요. 보호자가 대신 찍어도 되고, 앉은 자리에서 찍어도 괜찮아요</p></div></div><button class="care-scan-button" data-id="btn_care_scan">${icon('camera', 18)}카메라로 스타일 진단하기</button><div data-id="care_scan_done"><div class="v-row"><span class="v-tag primary">✓ 진단 완료 · 애즈펌 가능성 높음</span><button class="v-text v-link" data-id="btn_care_rescan">다시 진단</button></div><p class="v-meta">진단 결과와 사진은 매칭된 케어 인증 미용사에게만 보여요</p></div>`));
    get('who_self').parentElement.after(scan);
    const note = insert(`<section class="care-note" data-id="card_care_note"><label for="care-note">기타 애로사항 <span class="v-tag">선택</span></label><textarea id="care-note" data-id="input_care_note" maxlength="200" placeholder="미용사가 미리 알면 좋은 점을 적어주세요&#10;예: 휠체어에서 옮겨 앉기 어려워요. 큰 소리가 나면 잠깐 쉬어야 해요."></textarea><div class="v-row v-meta"><span>적은 내용은 매칭된 케어 인증 미용사에게만 전달돼요</span><span data-id="txt_care_note_count"></span></div></section>`);
    get('place_shop').parentElement.parentElement.before(note);
    const start = () => {
      state.update({ scan_context: 'care' });
      router.go('Scan');
    };
    get('btn_care_scan').onclick = start;
    get('btn_care_rescan').onclick = start;
    get('input_care_note').value = v.care_note;
    get('input_care_note').oninput = e => state.set('care_note', e.target.value.slice(0, 200));
    get('btn_find').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      state.coupon = null;
      state.update({ care_booking: true, profile: 0 });
      router.go('Profile');
    });
    updates.push(() => {
      get('btn_care_scan').hidden = v.care_scan_done;
      get('care_scan_done').hidden = !v.care_scan_done;
      text(root, 'txt_care_note_count', v.care_note.length + ' / 200');
    });
  }
  if (screen === 'Result') {
    const info = insert(card('card_my_info', `<div class="v-row"><b class="v-caption">내가 알려준 정보</b><button class="v-text v-link" data-id="btn_edit_info">수정</button></div><div class="v-tags" data-id="diag_tags"></div>`));
    root.querySelector('.content').children[0].after(info);
    get('btn_edit_info').onclick = () => router.go('ScanInfo');
    get('diag_tags').innerHTML = tags(state.diagTags);
    if (state.diag.type === 'women' && ['once', 'twice'].includes(state.diag.bleach)) {
      text(root, 'txt_hair_condition', '탈색 이력이 있어요. 펌 전에 손상 케어를 먼저 권해요');
      text(root, 'txt_hair_status', '주의');
    }
    if (v.scan_context === 'care') {
      text(root, 'btn_call_designer', '이 결과로 케어컷 신청 계속하기');
      get('btn_call_designer').addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        state.set('care_scan_done', true);
        router.go('Care');
      });
    }
  }
  if (screen === 'MatchHome') {
    const flash = insert(`<section class="flash-section" data-id="sec_flash"><div class="v-row"><h2>${icon('bolt')}반짝 특가</h2><span class="v-caption">1시간 안에 바로 · 쿠폰 할인</span></div><div class="flash-list horizontal" data-id="flash_list">${FLASH_DEALS.map((deal, i) => `<article class="flash-card" data-id="${deal.id}"><div class="v-row"><span class="v-tag warn">${deal.minutes === 60 ? '1시간' : deal.minutes + '분'} 후</span><span class="v-tag flash-off">${deal.off}% 할인</span></div><h3>${deal.style}</h3><p class="v-caption">${deal.name} · ${deal.salon} · ${deal.distance}</p><div class="flash-price"><s>${money(deal.price)}</s><b>${money(deal.price * (100 - deal.off) / 100)}</b></div><button data-id="btn_flash_${i + 1}">쿠폰 받고 예약</button></article>`).join('')}</div><p class="v-meta" data-id="txt_flash_note">빈 시간을 할인하는 쿠폰이에요. 받은 쿠폰은 결제할 때 자동으로 적용돼요.</p></section>`);
    get('card_my_match').after(flash);
    FLASH_DEALS.forEach((deal, i) => {
      get('btn_flash_' + (i + 1)).onclick = () => {
        state.coupon = deal;
        state.set('care_booking', false);
        router.go('Payment');
        toast('반짝 특가 쿠폰을 받았어요 · 결제할 때 자동으로 적용돼요');
      };
    });
    updates.push(() => FLASH_DEALS.forEach((deal, i) => text(root, 'btn_flash_' + (i + 1), state.coupon?.id === deal.id ? '받은 쿠폰으로 예약' : '쿠폰 받고 예약')));
    if (v.flash_scroll) {
      v.flash_scroll = false;
      requestAnimationFrame(() => flash.scrollIntoView({ block: 'start' }));
    }
  }
  if (screen === 'Payment') {
    get('discount_row').before(insert('<div class="v-row coupon-row" data-id="row_coupon"><span data-id="txt_coupon_label"></span><b data-id="txt_coupon"></b></div>'));
    updates.push(() => {
      const r = state.reservation;
      get('row_coupon').hidden = !state.coupon;
      text(root, 'txt_price', money(r.price));
      text(root, 'txt_coupon_label', `반짝 특가 쿠폰 (${r.off}%)`);
      text(root, 'txt_coupon', '−' + money(Math.round(r.price * (r.off || 0) / 100)));
      text(root, 'txt_payment_style', state.coupon ? `${r.style} · ${r.minutes}분 후 시작 (반짝 특가)` : `${r.style} · 오늘 ${r.time}`);
    });
  }
  if (screen === 'BookingDone') {
    const timeRow = get('txt_booking_time').parentElement;
    timeRow.after(insert('<div class="booking-duration v-row" data-id="row_duration"><span>소요 시간</span><b data-id="txt_duration"></b></div>'));
    const b = state.booking;
    text(root, 'txt_booking_hint', state.bookingTime + '까지 ' + b.salon + '로 가세요');
    text(root, 'txt_booking_time', '오늘 ' + state.bookingTime + (state.delay ? ` (${state.delay}분 지연)` : ''));
    get('txt_booking_time').classList.toggle('booking-delayed', !!state.delay);
    text(root, 'txt_duration', `약 ${b.duration}분 · ${state.bookingEnd}쯤 끝나요`);
    text(root, 'txt_booking_style', (b.care ? '케어컷 · ' : '') + b.style);
    const care = b.care;
    if (care && (care.needs.length || care.note || care.diagnosed)) {
      const request = insert(card('card_care_request', `<b class="care-request-title">미용사에게 미리 전달했어요</b><div class="v-tags">${tags(care.needs)}${care.diagnosed ? '<span class="v-tag primary">AI 진단 · 애즈펌 가능성 높음</span>' : ''}</div>${care.note ? `<p data-id="txt_care_note">“${escapeHTML(care.note)}”</p>` : ''}`));
      timeRow.parentElement.after(request);
    }
  }
  if (screen === 'Call') {
    const content = root.querySelector('.content');
    content.append(insert(`<a href="#/ProSchedule" class="v-card schedule-entry" data-id="btn_schedule"><div class="v-row"><h3>오늘 예약 4건 · 다음 손님 15:30</h3><strong>일정 보기 ›</strong></div><p class="v-caption">앞 시술이 길어지면 버튼 하나로 지연을 알려요</p></a>`));
  }
  if (screen === 'Profile') {
    const footer = insert('<footer class="fixed-footer profile-footer" data-id="fixed_footer"></footer>');
    footer.append(get('btn_book'));
    root.querySelector('.screen').append(footer);
    root.querySelector('.content').lastElementChild.remove();
    const portfolio = insert(card('sec_portfolio', `<div class="v-row"><h3>포트폴리오 <span class="v-caption" data-id="txt_portfolio_count"></span></h3><span class="v-meta">스타일별로 보기</span></div><div class="portfolio-filters">${[['all', '전체'], ['perm', '펌'], ['cut', '커트'], ['color', '염색']].map(([id, label]) => `<button data-id="pf_${id}" aria-pressed="false">${label}</button>`).join('')}</div><div class="portfolio-grid" data-id="portfolio_grid">${PORTFOLIO.map(p => `<button data-id="${p.id}" aria-label="${p.style} 사진 크게 보기"><img src="assets/images/${p.image}" alt="${p.style}"><span>${p.style}</span></button>`).join('')}</div><p class="v-meta" data-id="txt_portfolio_hint">사진을 누르면 크게 보고, 같은 스타일로 바로 예약할 수 있어요</p>`));
    root.querySelector('.content').children[1].after(portfolio);
    let filter = 'all';
    let focused;
    const overlay = document.getElementById('overlay');
    const close = () => {
      overlay.replaceChildren();
      root.inert = false;
      focused?.focus({ preventScroll: true });
    };
    const keydown = event => {
      if (!overlay.children.length) return;
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const buttons = [...overlay.querySelectorAll('button')];
        event.preventDefault();
        const index = buttons.indexOf(document.activeElement);
        buttons[(index + (event.shiftKey ? buttons.length - 1 : 1)) % buttons.length].focus();
      }
    };
    document.addEventListener('keydown', keydown);
    PORTFOLIO.forEach(p => {
      get(p.id).onclick = () => {
        focused = get(p.id);
        overlay.innerHTML = `<div class="portfolio-viewer" data-id="portfolio_viewer" role="dialog" aria-modal="true" aria-label="${p.style} · ${p.category}"><section class="viewer-content"><button class="viewer-close" data-id="btn_viewer_close" aria-label="닫기">×</button><img src="assets/images/${p.image}" alt="${p.style}"><h3>${p.style} · ${p.category}</h3><button class="primary-button" data-id="btn_portfolio_book">이 스타일로 예약하기</button></section></div>`;
        root.inert = true;
        byId(overlay, 'btn_viewer_close').onclick = close;
        byId(overlay, 'btn_portfolio_book').onclick = () => {
          close();
          get('btn_book').click();
        };
        byId(overlay, 'portfolio_viewer').onclick = e => {
          if (e.target === e.currentTarget) close();
        };
        byId(overlay, 'btn_viewer_close').focus();
      };
    });
    ['all', 'perm', 'cut', 'color'].forEach(key => {
      get('pf_' + key).onclick = () => {
        filter = key;
        refreshPortfolio();
      };
    });
    const refreshPortfolio = () => {
      let count = 0;
      PORTFOLIO.forEach(p => {
        get(p.id).hidden = filter !== 'all' && p.filter !== filter;
        if (!get(p.id).hidden) count++;
      });
      text(root, 'txt_portfolio_count', `시술 사진 ${count}장`);
      ['all', 'perm', 'cut', 'color'].forEach(key => {
        get('pf_' + key).classList.toggle('selected', key === filter);
        get('pf_' + key).setAttribute('aria-pressed', key === filter);
      });
    };
    refreshPortfolio();
    dispose = () => {
      document.removeEventListener('keydown', keydown);
      close();
    };
  }
  if (screen === 'MyPage') {
    updates.push(() => text(root, 'txt_default_payment', state.paymentName + ' · 기본'));
  }
  const refresh = () => updates.forEach(fn => fn());
  refresh();
  const unsubscribe = state.subscribe(refresh);
  return () => {
    unsubscribe();
    dispose();
  };
}
