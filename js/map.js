import { NAVER_MAPS_KEY_ID, NAVER_GEOCODER_ENABLED } from '../config.js';
import { NEIGHBORHOODS, MAP_SALONS } from './data.js';
import { state } from './state.js';
import { toast } from './ui/common.js';

const radians = n => n * Math.PI / 180;
export function distance(a, b) {
  const dlat = radians(b.lat - a.lat);
  const dlng = radians(b.lng - a.lng);
  return 12742 * Math.asin(Math.min(1, Math.sqrt(Math.sin(dlat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dlng / 2) ** 2)));
}
let scriptPromise;
let generation = 0;
let reverseRevision = 0;
let active = null;
const listeners = new Set();
const point = { ...NEIGHBORHOODS[0] };
export const mapState = {
  lat: point.lat, lng: point.lng, radius: 3, region: 0,
  address: point.address, provider: 'static', geocoder: 'off', tiles: 0,
  zoom: 12, centerLat: point.lat, centerLng: point.lng,
  get view() {
    return active;
  },
  get snapshot() {
    const salons = MAP_SALONS.filter(s => distance(this, s) <= this.radius);
    return { lat: this.lat, lng: this.lng, radius: this.radius, region: this.region, address: this.address, neighborhood: NEIGHBORHOODS[this.region].name, nearby: `반경 ${this.radius}km 안에 미용실 ${salons.length}곳 · 디자이너 ${salons.reduce((a,s) => a + s.designers, 0)}명`, provider: this.provider, geocoder: this.geocoder, tiles: this.tiles, zoom: this.zoom, centerLat: this.centerLat, centerLng: this.centerLng };
  },
  emit() {
    listeners.forEach(fn => fn(this.snapshot));
    state.emit();
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  select(lat, lng, recenter = true) {
    if (![lat,lng].every(Number.isFinite) || Math.abs(lat) > 85 || Math.abs(lng) > 180) return;
    this.lat = lat;
    this.lng = lng;
    this.region = NEIGHBORHOODS.reduce((best,n,i) => distance(this,n) < distance(this,NEIGHBORHOODS[best]) ? i : best, 0);
    this.address = NEIGHBORHOODS[this.region].address;
    this.geocoder = 'off';
    state.update({ region: String(this.region + 1) });
    active?.position(recenter);
    this.emit();
    reverseAddress();
  },
  setRegion(index) {
    const n = NEIGHBORHOODS[index];
    if (n) this.select(n.lat, n.lng);
  },
  setRadius(radius) {
    if (![1,3,5,10].includes(radius)) return;
    this.radius = radius;
    state.set('radius', String(radius));
    active?.position(false);
    active?.fit();
    this.emit();
  },
  reset() {
    this.setRegion(0);
    active?.fit();
  },
  zoomBy(delta) {
    if (active?.map) active.map.setZoom(Math.max(6, Math.min(19, active.map.getZoom() + delta)));
  },
  searchMock(query) {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const n = NEIGHBORHOODS.find(n => n.address.toLowerCase().includes(q) || q.includes(n.name));
    const s = MAP_SALONS.find(s => s.name.toLowerCase().includes(q));
    if (n || s) {
      this.select((n || s).lat, (n || s).lng);
      return;
    }
    toast('검색 결과가 없어요. 정릉동·성북동·길음동으로 검색해 보세요');
  },
  search(query) {
    if (!query.trim()) return;
    const service = window.naver?.maps?.Service;
    if (this.provider !== 'naver' || !service || !NAVER_GEOCODER_ENABLED) {
      this.searchMock(query);
      return;
    }
    const revision = ++reverseRevision;
    let done = false;
    const fallback = () => {
      if (done || revision !== reverseRevision) return;
      done = true;
      this.geocoder = 'off';
      this.searchMock(query);
    };
    const timeout = setTimeout(fallback, 4000);
    try {
      service.geocode({ query }, (code,response) => {
        if (done || revision !== reverseRevision) return;
        clearTimeout(timeout);
        const result = response?.v2?.addresses?.[0];
        if (code !== service.Status.OK || !result) return fallback();
        done = true;
        this.select(Number(result.y), Number(result.x));
      });
    } catch {
      clearTimeout(timeout);
      fallback();
    }
  }
};

function color(token = 'primary') {
  return getComputedStyle(document.documentElement).getPropertyValue('--' + token).trim();
}
function externalLinks(container) {
  container.querySelectorAll('a[href^="http"]').forEach(a => {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
}
async function naverReady() {
  if (!NAVER_MAPS_KEY_ID || new URLSearchParams(location.search).get('maps') === 'osm') return false;
  if (!scriptPromise) scriptPromise = new Promise(resolve => {
    let finished = false;
    const finish = value => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      resolve(value);
    };
    window.navermap_authFailure = () => {
      finish(false);
      active?.fallback?.();
    };
    const timeout = setTimeout(() => finish(false), 8000);
    const tag = document.createElement('script');
    tag.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=' + encodeURIComponent(NAVER_MAPS_KEY_ID) + '&submodules=geocoder';
    tag.onload = () => finish(!!window.naver?.maps);
    tag.onerror = () => finish(false);
    document.head.append(tag);
  });
  return scriptPromise;
}
function reverseAddress() {
  const service = window.naver?.maps?.Service;
  if (mapState.provider !== 'naver' || !service || !NAVER_GEOCODER_ENABLED) return;
  const revision = ++reverseRevision;
  const lat = mapState.lat;
  const lng = mapState.lng;
  try {
    service.reverseGeocode({ coords: new naver.maps.LatLng(lat,lng), orders: 'addr,roadaddr' }, (code,response) => {
      if (revision !== reverseRevision || mapState.lat !== lat || mapState.lng !== lng) return;
      const address = response?.v2?.address;
      if (code === service.Status.OK && (address?.roadAddress || address?.jibunAddress)) {
        mapState.address = (address.roadAddress || address.jibunAddress).slice(0,150);
        mapState.geocoder = 'on';
        mapState.emit();
      }
    });
  } catch {
    mapState.geocoder = 'off';
  }
}

export async function mountMap(container) {
  const current = ++generation;
  if (new URLSearchParams(location.search).has('static')) {
    container.classList.add('static-map');
    container.innerHTML = '<div class="static-circle"><div class="map-pin"></div></div>';
    mapState.provider = 'static';
    mapState.emit();
    return;
  }
  mapState.provider = 'loading';
  mapState.tiles = 0;
  mapState.emit();
  const naver = await naverReady();
  if (current !== generation || !container.isConnected) return;
  const startOsm = () => {
    if (current !== generation || !container.isConnected || active?.provider === 'osm') return;
    active?.destroy();
    container.replaceChildren();
    const map = L.map(container, { zoomControl: false, minZoom: 6, maxZoom: 19, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false }).setView([mapState.lat,mapState.lng],12);
    map.attributionControl.setPosition('bottomleft');
    const circle = L.circle([mapState.lat,mapState.lng], { radius: mapState.radius * 1000, color: color(), weight: 1.5, fillOpacity: .12 }).addTo(map);
    const marker = L.marker([mapState.lat,mapState.lng], { icon: L.divIcon({ className: '', html: '<div class="map-pin"></div>', iconSize: [26,26], iconAnchor: [13,26] }) }).addTo(map);
    MAP_SALONS.forEach(s => L.circleMarker([s.lat,s.lng], { radius: 5, color: color('surface'), weight: 2, fillColor: color(), fillOpacity: 1 }).addTo(map).bindTooltip(s.name + ' (목업)'));
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
    tiles.on('tileload', () => {
      mapState.tiles++;
      mapState.emit();
    });
    tiles.addTo(map);
    const updateView = () => {
      mapState.zoom = map.getZoom();
      mapState.centerLat = map.getCenter().lat;
      mapState.centerLng = map.getCenter().lng;
      mapState.emit();
    };
    active = {
      provider: 'osm', map, circle, marker,
      position(recenter) {
        marker.setLatLng([mapState.lat,mapState.lng]);
        circle.setLatLng([mapState.lat,mapState.lng]).setRadius(mapState.radius * 1000);
        if (recenter) map.panTo([mapState.lat,mapState.lng], { animate: false });
      },
      fit() {
        map.fitBounds(circle.getBounds(), { padding: [24,24], animate: false });
      },
      destroy() {
        map.off('moveend zoomend', updateView);
        map.remove();
      },
      boundsPixels() {
        const b = circle.getBounds();
        return [map.latLngToContainerPoint(b.getNorthWest()), map.latLngToContainerPoint(b.getSouthEast())];
      }
    };
    map.on('click', e => mapState.select(e.latlng.lat,e.latlng.lng,false));
    map.on('moveend zoomend', updateView);
    mapState.provider = 'osm';
    mapState.geocoder = 'off';
    active.fit();
    externalLinks(container);
    mapState.emit();
  };
  if (!naver) {
    startOsm();
    return;
  }
  try {
    const N = window.naver.maps;
    const map = new N.Map(container, { center: new N.LatLng(mapState.lat,mapState.lng), zoom: 12, minZoom: 6, maxZoom: 19, zoomControl: false, scaleControl: false, mapDataControl: true, logoControlOptions: { position: N.Position.LEFT_CENTER }, mapDataControlOptions: { position: N.Position.LEFT_CENTER } });
    const marker = new N.Marker({ map, position: new N.LatLng(mapState.lat,mapState.lng) });
    const circle = new N.Circle({ map, center: marker.getPosition(), radius: mapState.radius * 1000, strokeColor: color(), strokeWeight: 1.5, fillColor: color(), fillOpacity: .12 });
    MAP_SALONS.forEach(s => new N.Marker({ map, position: new N.LatLng(s.lat,s.lng), title: s.name + ' (목업)', icon: { content: '<div class="salon-marker"></div>', anchor: new N.Point(7,7) } }));
    const timer = setTimeout(startOsm,12000);
    N.Event.addListener(map,'tilesloaded', () => {
      clearTimeout(timer);
      mapState.tiles++;
      mapState.emit();
      externalLinks(container);
    });
    active = {
      provider: 'naver', map, marker, circle, fallback: startOsm,
      position(recenter) {
        const p = new N.LatLng(mapState.lat,mapState.lng);
        marker.setPosition(p);
        circle.setCenter(p);
        circle.setRadius(mapState.radius * 1000);
        if (recenter) map.setCenter(p);
      },
      fit() {
        map.fitBounds(circle.getBounds(), { top: 24, right: 24, bottom: 24, left: 24 });
      },
      boundsPixels() {
        const b = circle.getBounds();
        const projection = map.getProjection();
        return [projection.fromCoordToOffset(b.getMax()), projection.fromCoordToOffset(b.getMin())];
      },
      destroy() {
        clearTimeout(timer);
        map.destroy();
      }
    };
    N.Event.addListener(map,'click', e => mapState.select(e.coord.lat(),e.coord.lng(),false));
    N.Event.addListener(map,'idle', () => {
      mapState.zoom = map.getZoom();
      mapState.centerLat = map.getCenter().lat();
      mapState.centerLng = map.getCenter().lng();
      mapState.emit();
    });
    mapState.provider = 'naver';
    active.fit();
    reverseAddress();
    mapState.emit();
  } catch {
    startOsm();
  }
}
export function unmountMap() {
  generation++;
  active?.destroy();
  active = null;
}
