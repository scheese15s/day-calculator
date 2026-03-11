export function parseLocalDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function normalizeMonthDay(year, month, day) {
  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return new Date(year, 1, 28);
  }
  return new Date(year, month - 1, day);
}

export function getNextAnnualDate(sourceDate, today) {
  let candidate = normalizeMonthDay(today.getFullYear(), sourceDate.getMonth() + 1, sourceDate.getDate());
  if (candidate < today) {
    candidate = normalizeMonthDay(today.getFullYear() + 1, sourceDate.getMonth() + 1, sourceDate.getDate());
  }
  return candidate;
}

export function getNextMonthDay(today, month, day) {
  let candidate = normalizeMonthDay(today.getFullYear(), month, day);
  if (candidate < today) {
    candidate = normalizeMonthDay(today.getFullYear() + 1, month, day);
  }
  return candidate;
}

export function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

export function fullYearsBetween(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  const anniversary = normalizeMonthDay(to.getFullYear(), from.getMonth() + 1, from.getDate());
  if (to < anniversary) {
    years -= 1;
  }
  return years;
}

export function wholeMonthsBetween(from, to) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function addYears(date, years) {
  return normalizeMonthDay(date.getFullYear() + years, date.getMonth() + 1, date.getDate());
}

export function formatDDay(days) {
  if (days === 0) {
    return "D-Day";
  }
  return `D-${days}`;
}

export function formatDateKorean(date) {
  if (!date) {
    return "";
  }

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function formatElapsed(from, to) {
  const years = fullYearsBetween(from, to);
  const months = wholeMonthsBetween(addYears(from, years), to);

  if (years > 0) {
    return `${years}년 ${months}개월`;
  }
  return `${wholeMonthsBetween(from, to)}개월`;
}
