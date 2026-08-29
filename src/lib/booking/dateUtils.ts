export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addDays(dateKeyValue: string, days: number) {
  const date = new Date(`${dateKeyValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function getNights(checkIn: string, checkOut: string) {
  const start = new Date(`${checkIn}T12:00:00`).getTime();
  const end = new Date(`${checkOut}T12:00:00`).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function getStayNightKeys(checkIn: string, checkOut: string) {
  const nights = getNights(checkIn, checkOut);
  return Array.from({ length: nights }, (_, index) => addDays(checkIn, index));
}
