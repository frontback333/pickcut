import { state } from './state.js';
import { toast } from './ui/common.js';

let request = 0;
let stream = null;
let preview = null;
let pending = false;
let pictures = [];
const practiceMessage = '카메라를 사용할 수 없어 촬영을 연습 모드로 진행해요';
export const camera = {
  get count() {
    return pictures.length;
  },
  get activeTracks() {
    return stream?.getTracks().filter(t => t.readyState === 'live').length || 0;
  },
  clear() {
    pictures = [];
    state.update({ photos: 0, captures: 0 });
  },
  stop() {
    request++;
    pending = false;
    stream?.getTracks().forEach(t => t.stop());
    stream = null;
    if (preview) {
      preview.srcObject = null;
      preview.remove();
    }
    preview = null;
    state.set('camera', 'off');
  },
  async start(container) {
    if (!state.consentSeen || state.values.consent_open || !container?.isConnected) return;
    const current = ++request;
    const params = new URLSearchParams(location.search);
    if (params.has('static')) return;
    if (params.get('camera') === 'off' || !window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      state.set('camera', 'none');
      toast(practiceMessage);
      return;
    }
    let acquired;
    let timeout;
    try {
      const media = navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      // A delayed permission response must not leave a camera running after navigation.
      media.then(s => {
        if (request !== current) s.getTracks().forEach(t => t.stop());
      }, () => {});
      acquired = await Promise.race([media, new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('Camera timeout')), 10000);
      })]);
      clearTimeout(timeout);
      if (current !== request || !container.isConnected) {
        acquired.getTracks().forEach(t => t.stop());
        return;
      }
      stream = acquired;
      preview = document.createElement('video');
      preview.dataset.id = 'scan_camera';
      preview.playsInline = true;
      preview.muted = true;
      preview.autoplay = true;
      preview.srcObject = stream;
      container.prepend(preview);
      await preview.play();
      if (current === request) state.set('camera', 'on');
    } catch (error) {
      clearTimeout(timeout);
      acquired?.getTracks().forEach(t => t.stop());
      if (current !== request) return;
      request++;
      stream = null;
      preview?.remove();
      preview = null;
      state.set('camera', error.name === 'NotFoundError' ? 'none' : 'error');
      toast(practiceMessage);
    }
  },
  async capture(container) {
    if (pending || state.values.captures >= 3) return;
    if (state.values.camera !== 'on') {
      state.set('captures', Math.min(3, state.values.captures + 1));
      return;
    }
    if (!preview?.videoWidth) return;
    pending = true;
    const current = request;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = preview.videoWidth;
      canvas.height = preview.videoHeight;
      canvas.getContext('2d').drawImage(preview, 0, 0);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .9));
      canvas.width = canvas.height = 0;
      if (current !== request || !blob) return;
      pictures.push(blob);
      state.update({ captures: pictures.length, photos: pictures.length });
      const flash = document.createElement('div');
      flash.dataset.id = 'camera_shutter';
      flash.className = 'camera-shutter';
      container.append(flash);
      setTimeout(() => flash.remove(), 160);
    } finally {
      pending = false;
    }
  }
};
window.addEventListener('pagehide', () => camera.stop());
