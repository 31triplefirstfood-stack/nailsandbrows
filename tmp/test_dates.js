const y = 2026;
const m = 1; // 1 = Feb

const d1 = new Date(Date.UTC(y, m, 0, 17, 0, 0, 0)); // prev month last day + 17H = 1st Feb 00:00 BKK
const d2 = new Date(Date.UTC(y, m + 1, 0, 17, 0, 0, 0)); // this month last day + 17H = 1st Mar 00:00 BKK

console.log("monthStart:", d1.toISOString(), "UTC month:", d1.getUTCMonth());
console.log("monthEnd:", d2.toISOString(), "UTC month:", d2.getUTCMonth());
