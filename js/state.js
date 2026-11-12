import { defaults } from './defaults.js';
import { DESIGNERS, PRODUCTS, PAYMENT_METHODS, CARD_COMPANIES, CONSUMER_POSTS, PRO_POSTS, DIAG_OPTIONS, CARE_NEEDS, SHIPPING, STYLE_DURATIONS } from './data.js';
import { addMinutes } from './time.js';

const listeners = new Set();
export const state = {
  values: structuredClone(defaults),
  consentSeen: false,
  cartItems: { product_1: 1, product_3: 1 },
  cartSelected: new Set(['product_1', 'product_3']),
  diag: { type: 'basic', thickness: 'mid', length: 'bob', color: 'light', bleach: 'once' },
  coupon: null,
  delay: 0,
  notifications: [{ id: 'noti_flash', read: false }, { id: 'noti_review', read: true }],
  booking: { ...DESIGNERS[0], style: '애즈펌', duration: 120, payment: '카카오페이', amount: '48,000원', paid: 48000, care: null },
  setDiag(key, value) {
    this.diag[key] = value;
    this.emit();
  },
  get diagTags() {
    const d = this.diag;
    const label = key => DIAG_OPTIONS[key].find(item => item[0] === d[key])[1];
    return [
      { none: '최근 펌·염색 없음', recent: '최근 펌 3개월 이내', old: '펌·염색 3개월 넘음' }[this.values.perm],
      this.values.iron === 'daily' ? '고데기 매일 해요' : '고데기 안 해요',
      '숱 ' + label('thickness'),
      ...(d.type === 'women' ? [label('length'), label('color'), d.bleach === 'none' ? '염색·탈색 없음' : label('bleach')] : [])
    ];
  },
  get noti() {
    return this.notifications.filter(n => !n.read).length;
  },
  notify(id) {
    this.notifications = [{ id, read: false }, ...this.notifications.filter(n => n.id !== id)];
    this.emit();
  },
  markRead() {
    this.notifications.forEach(n => n.read = true);
    this.emit();
  },
  sendDelay(minutes) {
    this.delay = minutes;
    this.notify('noti_delay');
  },
  get bookingTime() {
    return addMinutes(this.booking.time, this.delay);
  },
  get bookingEnd() {
    return addMinutes(this.bookingTime, this.booking.duration);
  },
  get reservation() {
    return this.coupon || { ...this.designer, style: '애즈펌' };
  },
  completeBooking() {
    const r = this.reservation;
    const v = this.values;
    const needs = CARE_NEEDS.filter(([key]) => v['need_' + key]).map(([, label]) => label);
    this.booking = { ...r, duration: STYLE_DURATIONS[r.style], payment: this.method.name, amount: money(this.total), paid: this.total,
      care: v.care_booking ? { needs, note: v.care_note, diagnosed: v.care_scan_done, style: '애즈펌', tags: this.diagTags.slice() } : null };
    this.coupon = null;
    this.values.care_booking = false;
    this.delay = 0;
    this.notify('noti_booking');
  },
  syncCart() {
    this.values.cart = Object.values(this.cartItems).reduce((sum, qty) => sum + qty, 0);
    this.emit();
  },
  addProduct(key) {
    this.cartItems[key] = (this.cartItems[key] || 0) + 1;
    this.cartSelected.add(key);
    this.syncCart();
  },
  removeProduct(key) {
    delete this.cartItems[key];
    this.cartSelected.delete(key);
    this.syncCart();
  },
  get cartSummary() {
    const subtotal = PRODUCTS.reduce((sum, p) => sum + (this.cartSelected.has(p.key) ? p.price * (this.cartItems[p.key] || 0) : 0), 0);
    const shipping = subtotal > 0 && subtotal < SHIPPING.freeFrom ? SHIPPING.fee : 0;
    return { subtotal, shipping, total: subtotal + shipping };
  },
  set(key, value) {
    if (!(key in this.values)) throw new Error('Unknown state key: ' + key);
    if (key === 'payment' && !PAYMENT_METHODS[value]) return;
    if (key === 'card_company' && !CARD_COMPANIES[value]) return;
    if ((key === 'u_phone' || key === 'd_phone') && value !== this.values[key]) {
      this.values[key.slice(0, 2) + 'verified'] = false;
    }
    this.values[key] = value;
    this.emit();
  },
  update(values) {
    Object.assign(this.values, values);
    this.emit();
  },
  toggle(key) {
    this.set(key, !this.values[key]);
  },
  multi(key, value) {
    const items = this.values[key];
    this.set(key, items.includes(value) ? items.filter(x => x !== value) : [...items, value]);
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  emit() {
    listeners.forEach(fn => fn(this.values));
  },
  get total() {
    const r = this.reservation;
    const discounted = r.price - Math.round(r.price * (r.off || 0) / 100);
    return Math.max(0, discounted - (this.values.discount ? 10000 : 0));
  },
  get designer() {
    return DESIGNERS[this.values.designer];
  },
  get profile() {
    return DESIGNERS[this.values.profile];
  },
  get method() {
    const method = { ...PAYMENT_METHODS[this.values.payment] };
    if (this.values.payment === 'card' && this.values.card_company) method.sub = CARD_COMPANIES[this.values.card_company] + ' · 신용·체크카드';
    return method;
  },
  get paymentName() {
    return this.values.payment === 'card' && this.values.card_company
      ? CARD_COMPANIES[this.values.card_company] + '카드' : this.method.name;
  },
  get paymentReady() {
    return this.values.payment !== 'card' || !!this.values.card_company;
  },
  get eligibility() {
    return ['disabled', 'lowincome', 'seodaemun'].every(k => this.values['elig_' + k] === 'yes') ? '월 1회 1만 원 감면 대상이에요' : '픽컷 케어 할인(매칭 수수료 0원)은 받을 수 있어요';
  },
  get designerIndices() {
    const order = { all: [5, 0, 1, 2, 3, 4], asperm: [0, 1], shampoo: [0, 1, 5, 2, 3, 4], rising: [2, 5], care: [0] }[this.values.rank];
    const q = this.values.search.trim().toLowerCase();
    return order.filter(i => [DESIGNERS[i].name, DESIGNERS[i].salon, DESIGNERS[i].area, ...DESIGNERS[i].tags].join(' ').toLowerCase().includes(q));
  },
  get productIndices() {
    const categories = { shampoo: '샴푸', scalp: '두피 케어', styling: '스타일링', tools: '도구' };
    const category = this.values.store_category;
    const q = this.values.store_search.trim().toLowerCase();
    return PRODUCTS.flatMap((p, i) => (category === 'all' || p.category === categories[category] || category === 'care' && p.tag === '케어컷 추천') && [p.name, p.category, p.brand, p.tag].join(' ').toLowerCase().includes(q) ? [i] : []);
  },
  postIndices(pro = false) {
    const prefix = pro ? 'pro' : 'community';
    const posts = pro ? PRO_POSTS : CONSUMER_POSTS;
    const category = this.values[prefix + '_tab'];
    const chip = this.values[prefix + '_chip'];
    const categories = { talk: '헤어톡', review: '시술 후기', qa: 'Q&A', care: '케어컷', event: '이벤트', suggest: '건의함', knowhow: '노하우', question: '질문', care_edu: '케어 교육', model: '모델 구인', market: '장터' };
    const topics = { mencut: '커트', cut: '커트', perm: '펌', dye: '염색', scalp: '두피', care: '케어컷', shop: '매장 운영' };
    const result = posts.flatMap((p, i) => (category === 'all' || p.category === categories[category] || category === 'care' && p.topics.includes('케어컷')) && (['recommend', 'popular'].includes(chip) || p.topics.includes(topics[chip])) ? [i] : []);
    if (chip === 'popular') result.sort((a, b) => posts[b].likes - posts[a].likes);
    return result;
  }
};
export const money = value => value.toLocaleString('ko-KR') + '원';
