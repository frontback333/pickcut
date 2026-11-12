import { header } from '../ui/forms.js';
import { card, chips } from '../ui/v21-common.js';
import { state } from '../state.js';
import { router } from '../router.js';
import { byId, selected, text, toast } from '../ui/common.js';

export const markup = `<div class="screen v-screen" data-screen="ProSchedule">${header('오늘 예약')}<div class="page-scroll"><main class="v-content schedule">
  <section class="schedule-summary" data-id="summary"><p>디자이너 모드 · 한지우</p><h2>오늘 예약 4건</h2><p>지금 시술 중 1건 · 다음 손님 15:30</p></section>
  <h2 class="v-section">지금 시술 중</h2>${card('booking_current', `<div class="v-row"><b>13:30 <span class="v-tag primary">시술 중</span></b><span class="v-caption">예상 종료 15:30</span></div><p class="v-caption">볼륨 펌 · 이○○ 고객 · 예상 소요 120분</p><hr><div><b>앞 시술이 길어지나요?</b><p class="v-caption">다음 손님에게 버튼 하나로 지연을 알려요. 서두르지 않아도 돼요.</p></div>${chips('delay_', [5, 10, 15, 30].map(n => [n, n + '분']), 'four delay-chips')}<button class="primary-button" data-id="btn_send_delay"></button>`)}
  <h2 class="v-section">다음 예약</h2>${card('booking_list', `<div class="schedule-row" data-id="booking_next"><b data-id="txt_next_time">15:30</b><div><b data-id="txt_next_style">애즈펌 · 김○○ 고객</b><p class="v-caption" data-id="txt_next_duration">예상 소요 약 120분</p><p class="care-preview v-caption" data-id="txt_next_note"></p></div><span class="v-tag primary" data-id="tag_next">다음 손님</span></div><div class="schedule-row" data-id="booking_2"><b>17:40</b><div><b>남자 커트 · 박○○ 고객</b><p class="v-caption">약 40분</p></div></div><div class="schedule-row" data-id="booking_3"><b>19:00</b><div><b>뿌리염색 · 최○○ 고객</b><p class="v-caption">약 90분</p></div></div>`)}
  <p class="v-meta">지연 알림을 보내면 손님 앱의 알림과 예약 시간이 함께 바뀌어요.</p>
</main></div></div>`;

export function mount(root) {
  let minutes = state.delay || 15;
  byId(root, 'btn_back').onclick = () => router.go('Call');
  [5, 10, 15, 30].forEach(n => {
    byId(root, 'delay_' + n).onclick = () => {
      minutes = n;
      refresh();
    };
  });
  byId(root, 'btn_send_delay').onclick = () => {
    state.sendDelay(minutes);
    toast(`다음 손님(15:30)에게 ${minutes}분 지연 알림을 보냈어요`);
  };
  const refresh = () => {
    [5, 10, 15, 30].forEach(n => selected(byId(root, 'delay_' + n), minutes === n, 'aria-pressed'));
    text(root, 'btn_send_delay', state.delay === minutes ? `${minutes}분 지연 알림을 보냈어요 · 다시 보내기` : `다음 손님에게 ${minutes}분 지연 알림 보내기`);
    text(root, 'txt_next_time', state.delay ? state.booking.time + ' → ' + state.bookingTime : state.booking.time);
    text(root, 'tag_next', state.delay ? '지연 안내됨' : '다음 손님');
    byId(root, 'tag_next').classList.toggle('warn', !!state.delay);
    text(root, 'txt_next_style', (state.booking.care ? '케어컷 · ' : '') + state.booking.style + ' · 김○○ 고객');
    text(root, 'txt_next_duration', '예상 소요 약 ' + state.booking.duration + '분');
    text(root, 'txt_next_note', state.booking.care?.note.split('\n')[0] || '');
    byId(root, 'txt_next_note').hidden = !state.booking.care?.note;
  };
  refresh();
  return state.subscribe(refresh);
}
