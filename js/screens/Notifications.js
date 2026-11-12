import { header } from '../ui/forms.js';
import { icon, escapeHTML } from '../ui/v21-common.js';
import { NOTIFICATIONS } from '../data.js';
import { state } from '../state.js';
import { router } from '../router.js';
import { byId } from '../ui/common.js';
import { addMinutes } from '../time.js';

export const markup = `<div class="screen v-screen" data-screen="Notifications">${header('알림')}<div class="page-scroll"><main class="v-content notifications" data-id="notification_list"></main></div></div>`;

export function mount(root) {
  byId(root, 'btn_back').onclick = () => router.back();
  const refresh = () => {
    const b = state.booking;
    const vars = { N: state.delay, time: state.bookingTime, style: b.style, salon: b.salon, duration: b.duration, end: state.bookingEnd };
    const fill = (text, id) => text.replace(/\{(\w+)\}/g, (_, key) => {
      if (id === 'noti_booking' && key === 'time') return b.time;
      if (id === 'noti_booking' && key === 'end') return addMinutes(b.time, b.duration);
      return vars[key];
    });
    const render = n => {
      const data = NOTIFICATIONS[n.id];
      return `<button class="notification v-card" data-id="${n.id}"><span class="noti-icon ${n.id === 'noti_delay' ? 'warn' : n.id === 'noti_review' ? 'muted' : ''}">${icon(data.icon === 'flash' ? 'bolt' : data.icon)}</span><span class="noti-copy"><span class="noti-head"><b>${escapeHTML(fill(data.title, n.id))}</b><small>${data.time}</small>${n.read ? '' : '<i class="noti-dot"></i>'}</span><span class="noti-body">${escapeHTML(fill(data.body, n.id))}</span>${data.link ? `<strong>${data.link}</strong>` : ''}</span></button>`;
    };
    byId(root, 'notification_list').innerHTML = `<h3 class="noti-group">오늘</h3>${state.notifications.filter(n => n.id !== 'noti_review').map(render).join('')}<h3 class="noti-group">이전</h3>${state.notifications.filter(n => n.id === 'noti_review').map(render).join('')}<p class="v-notice" data-id="info_delay">앞 시술이 길어지면 미용사가 지연 알림을 보내요. 가게에서 기다리지 말고 알림 시간에 맞춰 오세요.</p>`;
    state.notifications.forEach(n => {
      byId(root, n.id).onclick = () => {
        if (n.id === 'noti_flash') state.set('flash_scroll', true);
        router.go(NOTIFICATIONS[n.id].target);
      };
    });
  };
  refresh();
  const unsubscribe = state.subscribe(refresh);
  return () => {
    unsubscribe();
    state.markRead();
  };
}
