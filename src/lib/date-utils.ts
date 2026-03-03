/**
 * Generates the UTC start and end Date objects for a given day in "Asia/Bangkok" (UTC+7) timezone.
 * Useful for Prisma queries when the server is running in a different timezone (like Vercel in UTC).
 */
export function getBkkTodayRange(dateParam?: string | null) {
    const nowUtc = new Date();

    // If dateParam is provided (YYYY-MM-DD), use it. Otherwise use current time in BKK.
    let targetDate: Date;
    if (dateParam) {
        targetDate = new Date(dateParam);
    } else {
        const bkkString = nowUtc.toLocaleString("en-US", { timeZone: "Asia/Bangkok" });
        targetDate = new Date(bkkString);
    }

    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const day = targetDate.getDate();

    // 00:00 BKK is 17:00 UTC of the previous day
    // We use Date.UTC to stay consistent.
    // E.g., March 4th 00:00 BKK is March 3rd 17:00 UTC
    const start = new Date(Date.UTC(year, month, day - 1, 17, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, day, 17, 0, 0, 0));

    return { start, end, year, month, day };
}
