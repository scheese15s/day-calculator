import {
  addDays,
  daysBetween,
  formatDateKorean,
  formatDDay,
  formatElapsed,
  fullYearsBetween,
  getNextAnnualDate,
  getNextMonthDay,
  parseLocalDate,
  wholeMonthsBetween,
} from "./date-utils.js";

function emptyResult() {
  return {
    primary: "날짜를 입력하면 바로 계산됩니다.",
    secondary: "",
    meta: [],
  };
}

function invalidResult(message) {
  return {
    primary: message,
    secondary: "",
    meta: [],
  };
}

const MILESTONES = {
  valentine: { label: "발렌타인데이", month: 2, day: 14 },
  white: { label: "화이트데이", month: 3, day: 14 },
  parents: { label: "어버이날", month: 5, day: 8 },
  pepero: { label: "빼빼로데이", month: 11, day: 11 },
  christmas: { label: "크리스마스", month: 12, day: 25 },
};

export const FEATURES = [
  {
    id: "age",
    label: "나이 계산",
    description: "생년월일을 기준으로 만나이와 한국식 나이를 함께 확인합니다.",
    fields: [{ name: "birthDate", label: "생년월일", type: "date", saveKey: "myBirthDate" }],
    calculate: ({ birthDate }, today) => {
      if (!birthDate) {
        return emptyResult();
      }

      const birth = parseLocalDate(birthDate);
      if (!birth || birth > today) {
        return invalidResult("올바른 생년월일을 입력해 주세요.");
      }

      const internationalAge = fullYearsBetween(birth, today);
      const koreanAge = today.getFullYear() - birth.getFullYear() + 1;
      const nextBirthday = getNextAnnualDate(birth, today);
      const daysUntilBirthday = daysBetween(today, nextBirthday);

      return {
        primary: `만 ${internationalAge}세`,
        secondary: `한국식 나이 ${koreanAge}세`,
        meta: [`다음 생일까지 ${formatDDay(daysUntilBirthday)}`, `출생일 ${formatDateKorean(birth)}`],
      };
    },
  },
  {
    id: "birthday",
    label: "생일 디데이",
    description: "다음 생일까지 남은 날짜를 D-Day 형식으로 계산합니다.",
    fields: [
      { name: "birthday", label: "생년월일", type: "date", saveKey: "partnerBirthday" },
      { name: "name", label: "이름 또는 관계", type: "text", placeholder: "예: 배우자", saveKey: "birthdayName" },
    ],
    calculate: ({ birthday, name }, today) => {
      if (!birthday) {
        return emptyResult();
      }

      const birth = parseLocalDate(birthday);
      if (!birth || birth > today) {
        return invalidResult("올바른 생년월일을 입력해 주세요.");
      }

      const nextBirthday = getNextAnnualDate(birth, today);
      const days = daysBetween(today, nextBirthday);
      const label = name?.trim() || "다음 생일";
      const turningAge = fullYearsBetween(birth, nextBirthday);

      return {
        primary: `${label} ${formatDDay(days)}`,
        secondary: `${formatDateKorean(nextBirthday)} · 만 ${turningAge}세 되는 날`,
        meta: [`출생일 ${formatDateKorean(birth)}`],
      };
    },
  },
  {
    id: "anniversary",
    label: "결혼 기념일",
    description: "다음 결혼기념일까지 남은 날짜와 다가오는 주년을 알려줍니다.",
    fields: [{ name: "anniversary", label: "결혼기념일", type: "date", saveKey: "anniversary" }],
    calculate: ({ anniversary }, today) => {
      if (!anniversary) {
        return emptyResult();
      }

      const date = parseLocalDate(anniversary);
      if (!date || date > today) {
        return invalidResult("올바른 결혼기념일을 입력해 주세요.");
      }

      const nextAnniversary = getNextAnnualDate(date, today);
      const days = daysBetween(today, nextAnniversary);
      const upcomingYears = fullYearsBetween(date, nextAnniversary);

      return {
        primary: `결혼 ${upcomingYears}주년 ${formatDDay(days)}`,
        secondary: formatDateKorean(nextAnniversary),
        meta: [`함께한 기간 ${formatElapsed(date, today)}`],
      };
    },
  },
  {
    id: "milestone",
    label: "주요 기념일",
    description: "대표 기념일을 선택하면 다음 기념일까지 남은 기간을 보여줍니다.",
    fields: [
      {
        name: "milestone",
        label: "기념일",
        type: "option",
        options: [
          { value: "valentine", label: "발렌타인데이", sublabel: "2월 14일" },
          { value: "white", label: "화이트데이", sublabel: "3월 14일" },
          { value: "parents", label: "어버이날", sublabel: "5월 8일" },
          { value: "pepero", label: "빼빼로데이", sublabel: "11월 11일" },
          { value: "christmas", label: "크리스마스", sublabel: "12월 25일" },
        ],
        saveKey: "milestone",
      },
    ],
    calculate: ({ milestone }, today) => {
      if (!milestone) {
        return emptyResult();
      }

      const config = MILESTONES[milestone];
      if (!config) {
        return invalidResult("기념일을 선택해 주세요.");
      }

      const nextDate = getNextMonthDay(today, config.month, config.day);
      const days = daysBetween(today, nextDate);

      return {
        primary: `${config.label} ${formatDDay(days)}`,
        secondary: formatDateKorean(nextDate),
        meta: [`매년 ${config.month}월 ${config.day}일`],
      };
    },
  },
  {
    id: "childMonths",
    label: "아이 개월수",
    description: "아이 생년월일을 기준으로 현재 개월수와 연/월 단위를 함께 계산합니다.",
    fields: [{ name: "childBirthDate", label: "아이 생년월일", type: "date", saveKey: "childBirthDate" }],
    calculate: ({ childBirthDate }, today) => {
      if (!childBirthDate) {
        return emptyResult();
      }

      const birth = parseLocalDate(childBirthDate);
      if (!birth || birth > today) {
        return invalidResult("올바른 생년월일을 입력해 주세요.");
      }

      const totalMonths = wholeMonthsBetween(birth, today);
      const years = Math.floor(totalMonths / 12);
      const months = totalMonths % 12;

      return {
        primary: `현재 ${totalMonths}개월`,
        secondary: years > 0 ? `${years}년 ${months}개월` : `${months}개월`,
        meta: [`출생일 ${formatDateKorean(birth)}`, `태어난 지 ${daysBetween(birth, today)}일`],
      };
    },
  },
  {
    id: "pregnancy",
    label: "임신 주수",
    description: "출산 예정일을 입력하면 현재 임신 주수와 남은 기간을 계산합니다.",
    fields: [{ name: "dueDate", label: "출산 예정일", type: "date", saveKey: "dueDate" }],
    calculate: ({ dueDate }, today) => {
      if (!dueDate) {
        return emptyResult();
      }

      const due = parseLocalDate(dueDate);
      if (!due) {
        return invalidResult("올바른 출산 예정일을 입력해 주세요.");
      }

      const start = addDays(due, -280);
      const passedDays = daysBetween(start, today);
      const remainingDays = daysBetween(today, due);

      if (passedDays < 0) {
        return {
          primary: "임신 전 기간입니다",
          secondary: `기준 시작일 ${formatDateKorean(start)}`,
          meta: [`출산 예정일까지 ${remainingDays}일`],
        };
      }

      const weeks = Math.floor(passedDays / 7);
      const extraDays = passedDays % 7;

      return {
        primary: `현재 ${weeks}주 ${extraDays}일차`,
        secondary: remainingDays >= 0 ? `출산까지 ${remainingDays}일 남음` : `${Math.abs(remainingDays)}일 지남`,
        meta: [`출산 예정일 ${formatDateKorean(due)}`, `임신 시작 기준일 ${formatDateKorean(start)}`],
      };
    },
  },
];
