// All prototype appointment times use the same minute arithmetic.
export function addMinutes(time, minutes) {
  const [hour, minute] = time.split(':').map(Number);
  const total = (hour * 60 + minute + minutes + 1440) % 1440;
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}
