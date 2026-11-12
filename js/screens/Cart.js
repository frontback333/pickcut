import { header } from '../ui/forms.js';
import { escapeHTML, footer } from '../ui/v21-common.js';
import { PRODUCTS, SHIPPING } from '../data.js';
import { state, money } from '../state.js';
import { router } from '../router.js';
import { byId, toast } from '../ui/common.js';

export const markup = `<div class="screen v-screen" data-screen="Cart">${header('장바구니')}<div class="page-scroll"><main class="v-content cart-content" data-id="cart_content"></main></div>${footer('btn_order', '')}</div>`;

export function mount(root) {
  byId(root, 'btn_back').onclick = () => router.go('Store');
  byId(root, 'btn_order').onclick = () => toast('프로토타입이라 실제 주문은 되지 않아요');
  const refresh = () => {
    const products = PRODUCTS.filter(p => state.cartItems[p.key]);
    const count = products.filter(p => state.cartSelected.has(p.key)).length;
    const sum = state.cartSummary;
    byId(root, 'bottom_bar').hidden = !products.length;
    const checkbox = (id, checked, label) => `<button class="v-checkbox ${checked ? 'selected' : ''}" data-id="${id}" role="checkbox" aria-checked="${checked}" aria-label="${label}"></button>`;
    const item = p => {
      const n = p.key.slice(8);
      const qty = state.cartItems[p.key];
      return `<article class="cart-item" data-id="cart_item_${n}">${checkbox('chk_item_' + n, state.cartSelected.has(p.key), escapeHTML(p.name) + ' 선택')}<img class="cart-img" data-id="cart_img_${n}" src="assets/images/${p.image}" alt="${escapeHTML(p.name)}"><div class="cart-copy"><small>${escapeHTML(p.brand)}</small><b>${escapeHTML(p.name)}</b><div class="cart-price"><strong>${money(p.price * qty)}</strong><span class="cart-stepper" data-id="stepper_${n}"><button data-id="btn_minus_${n}" aria-label="수량 줄이기" aria-disabled="${qty === 1}">−</button><b data-id="txt_qty_${n}">${qty}</b><button data-id="btn_plus_${n}" aria-label="수량 늘리기">+</button></span></div></div><button class="cart-remove" data-id="btn_remove_${n}" aria-label="상품 삭제">×</button></article>`;
    };
    byId(root, 'cart_content').innerHTML = !products.length ? `<div class="cart-empty"><h3>장바구니가 비어 있어요</h3><button class="secondary-button" data-id="btn_browse_store">스토어 둘러보기</button></div>` : `<div class="v-row" data-id="select_row"><div class="cart-select">${checkbox('chk_all', count === products.length, '전체 선택')}<b data-id="txt_select_all">전체 선택 (${count}/${products.length})</b></div><button class="v-text" data-id="btn_delete_selected">선택 삭제</button></div><section class="v-card cart-list" data-id="cart_list">${products.map(item).join('')}</section><p class="v-notice" data-id="ship_notice">${sum.subtotal < SHIPPING.freeFrom ? money(SHIPPING.freeFrom - sum.subtotal) + ' 더 담으면 배송비가 무료예요' : '배송비 무료예요'} (30,000원 이상 무료배송)</p><section class="v-card cart-summary" data-id="summary"><div class="v-row"><span>상품 금액</span><b data-id="txt_subtotal">${money(sum.subtotal)}</b></div><div class="v-row"><span>배송비</span><b data-id="txt_shipping">${money(sum.shipping)}</b></div><hr><div class="v-row"><h3>결제 예정 금액</h3><h2 data-id="txt_total">${money(sum.total)}</h2></div></section><p class="v-meta" data-id="txt_mock_notice">프로토타입이라 실제 주문·결제는 되지 않아요.</p>`;
    byId(root, 'btn_order').disabled = !count;
    byId(root, 'btn_order').textContent = count ? money(sum.total) + ' 주문하기' : '상품을 골라주세요';
    if (!products.length) {
      byId(root, 'btn_browse_store').onclick = () => router.go('Store');
      return;
    }
    byId(root, 'chk_all').onclick = () => {
      state.cartSelected = new Set(count === products.length ? [] : products.map(p => p.key));
      state.emit();
    };
    byId(root, 'btn_delete_selected').onclick = () => {
      [...state.cartSelected].forEach(key => {
        delete state.cartItems[key];
      });
      state.cartSelected.clear();
      state.syncCart();
    };
    products.forEach(p => {
      const n = p.key.slice(8);
      byId(root, 'chk_item_' + n).onclick = () => {
        if (state.cartSelected.has(p.key)) state.cartSelected.delete(p.key);
        else state.cartSelected.add(p.key);
        state.emit();
      };
      byId(root, 'btn_remove_' + n).onclick = () => state.removeProduct(p.key);
      [-1, 1].forEach(delta => {
        byId(root, 'btn_' + (delta < 0 ? 'minus_' : 'plus_') + n).onclick = () => {
          state.cartItems[p.key] = Math.max(1, state.cartItems[p.key] + delta);
          state.syncCart();
        };
      });
    });
  };
  refresh();
  return state.subscribe(refresh);
}
