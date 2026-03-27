function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getWeekEndingDate(from = new Date()): Date {
  const date = new Date(from);
  date.setHours(0, 0, 0, 0);

  const daysUntilSunday = (7 - date.getDay()) % 7;
  date.setDate(date.getDate() + daysUntilSunday);

  return date;
}

export function getRecentWeekEndingOptions(count = 2): string[] {
  const currentWeekEnding = getWeekEndingDate();

  return Array.from({ length: count }, (_, index) => {
    const optionDate = new Date(currentWeekEnding);
    optionDate.setDate(currentWeekEnding.getDate() - index * 7);
    return formatIsoDate(optionDate);
  });
}

export function getPeriodLabel(dataLength: number, unit = "Weeks"): string {
  if (dataLength <= 0) {
    return `Recent ${unit}`;
  }

  if (dataLength === 1) {
    return `Last 1 ${unit.slice(0, -1)}`;
  }

  return `Last ${dataLength} ${unit}`;
}
