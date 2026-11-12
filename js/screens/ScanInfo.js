import { header } from '../ui/forms.js';
import { chips, card, footer } from '../ui/v21-common.js';
import { DIAG_OPTIONS } from '../data.js';
import { state } from '../state.js';
import { router } from '../router.js';
import { byId, selected } from '../ui/common.js';

export const markup = `<div class="screen v-screen" data-screen="ScanInfo">${header('추가 진단')}
  <div class="page-scroll"><main class="v-content scan-info">
    <div class="v-intro"><h2>머리 상태를 조금만 더 알려주세요</h2><p>고른 답은 진단 결과와 함께 내가 고른 미용사에게만 전달돼요</p></div>
    <div class="v-segments">${['basic', 'women'].map((id, i) => `<button data-id="seg_${id}">${i ? '여성 진단' : '기본 진단'}</button>`).join('')}</div>
    ${card('card_thickness', `<h3>머리 숱</h3><p class="v-caption">사진으로 본 숱과 다르면 직접 골라주세요</p>${chips('thick_', DIAG_OPTIONS.thickness, 'three')}`)}
    ${card('card_women', `<h3>여성 진단 <span class="v-tag primary">여성 전용 항목</span></h3>
      <div class="v-field"><p>기장</p>${chips('len_', DIAG_OPTIONS.length)}</div>
      <div class="v-field"><p>현재 헤어 색깔</p>${chips('color_', DIAG_OPTIONS.color.map(([id, label]) => [id, `<span class="hair-dot hair-${id}"></span>${label}`]))}</div>
      <div class="v-field"><p>염색·탈색 이력</p>${chips('bleach_', DIAG_OPTIONS.bleach)}</div>`)}
    <p class="v-caption" data-id="txt_women_hint">여성 진단을 고르면 기장·헤어 색깔·염색/탈색 이력도 함께 확인해요</p>
  </main></div>${footer('btn_result', '진단 결과 보기')}</div>`;

export function mount(root) {
  byId(root, 'btn_back').onclick = () => router.go('Scan');
  byId(root, 'btn_result').onclick = () => router.go('Result');
  ['basic', 'women'].forEach(type => {
    byId(root, 'seg_' + type).onclick = () => state.setDiag('type', type);
  });
  Object.entries({ thickness: 'thick_', length: 'len_', color: 'color_', bleach: 'bleach_' }).forEach(([key, prefix]) => {
    DIAG_OPTIONS[key].forEach(([id]) => {
      byId(root, prefix + id).onclick = () => state.setDiag(key, id);
    });
  });
  const refresh = () => {
    ['basic', 'women'].forEach(type => selected(byId(root, 'seg_' + type), state.diag.type === type, 'aria-pressed'));
    Object.entries({ thickness: 'thick_', length: 'len_', color: 'color_', bleach: 'bleach_' }).forEach(([key, prefix]) => {
      DIAG_OPTIONS[key].forEach(([id]) => selected(byId(root, prefix + id), state.diag[key] === id, 'aria-pressed'));
    });
    byId(root, 'card_women').hidden = state.diag.type !== 'women';
    byId(root, 'txt_women_hint').hidden = state.diag.type === 'women';
  };
  refresh();
  return state.subscribe(refresh);
}
