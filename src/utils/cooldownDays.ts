// Reminder for PWA - Installation popup
export const cooldownDaysFor = (count: number) => {
  // 0->0 dagar (visa direkt om aldrig sagt nej), 1->7d, 2->30d, 3+->90d
  return [0, 1, 2, 3, 4, 5, 6, 7, 10, 14, 30, 60, 90][Math.min(count, 3)];
}
