import { header, button, field, group, choices, social, terms } from '../ui/forms.js';
import { setupScreen } from '../ui/screen.js';
export const markup = `<div class="screen" data-screen="SignUpUser"><div class="page-scroll">${header('이용자 가입')}<div class="form-body">${social(true)}<div class="form-divider">또는 직접 입력</div>${field('name','2~10자로 지어 주세요','닉네임')}${field('phone','010-0000-0000','휴대폰 번호',true)}${group('성별 (선택)', choices('gender_', [['male','남성'],['female','여성'],['none','선택 안 함']]))}${group('주로 받는 시술 (여러 개)', choices('style_', [['cut','커트'],['perm','펌'],['dye','염색'],['scalp','두피 케어'],['care','케어컷']],true))}${group('내 동네 (매칭 기본 지역)',choices('region_', [['1','정릉동'],['add','+ 동네 추가']],true))}${group('미용실에서 나는', choices('talk_', [['chatty','이야기 좋아요'],['quiet','조용히 받고 싶어요']]))}${terms()}</div></div><footer class="form-footer" data-id="bottom_bar">${button('btn_signup','가입하고 시작하기')}</footer></div>`;
export function mount(root) {
  return setupScreen('SignUpUser', root);
}
