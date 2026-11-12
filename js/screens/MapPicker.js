import { choices, button } from '../ui/forms.js';
import { setupScreen } from '../ui/screen.js';
export const markup = `<div class="screen" data-screen="MapPicker"><div data-id="map_full" class="map-full"><div data-id="map_canvas" class="map-canvas"></div><form class="map-search" data-id="map_search_form"><button type="button" data-id="btn_back" class="back-button" aria-label="뒤로"><img src="assets/icons/back.svg" alt=""></button><input data-id="input_search_place" class="form-input" placeholder="동네, 장소, 주소 검색" aria-label="동네, 장소, 주소 검색"></form><div class="map-buttons"><button data-id="btn_my_location" aria-label="내 위치">◎</button><button data-id="btn_map_zoom_in" aria-label="확대">+</button><button data-id="btn_map_zoom_out" aria-label="축소">−</button></div></div><section data-id="location_sheet" class="location-sheet"><h2 data-id="txt_address">서울 성북구 정릉동 일대</h2><p data-id="txt_nearby">반경 3km 안에 미용실 12곳 · 디자이너 34명</p>${choices('radius_',[['1','1km'],['3','3km'],['5','5km'],['10','10km']])}${button('btn_set_location','이 위치로 선택')}</section></div>`;
export function mount(root) {
  return setupScreen('MapPicker', root);
}
