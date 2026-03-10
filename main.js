const STORAGE_KEY = "family-dday-storage";

const FEATURES = [
  {
    id: "age",
    label: "나이 계산",
    icon: "만",
    description: "생년월일을 기준으로 만나이와 한국식 나이를 함께 확인합니다.",
    fields: [
      { name: "birthDate", label: "생년월일", type: "date", saveKey: "myBirthDate" },
    ],
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
        meta: [
          `다음 생일까지 ${formatDDay(daysUntilBirthday)}`,
          `출생일 ${formatDateKorean(birth)}`,
        ],
      };
    },
  },
  {
    id: "birthday",
    label: "생일 디데이",
    icon: "생",
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
        meta: [
          `출생일 ${formatDateKorean(birth)}`,
        ],
      };
    },
  },
  {
    id: "anniversary",
    label: "결혼 기념일",
    icon: "결",
    description: "다음 결혼기념일까지 남은 날짜와 다가오는 주년을 알려줍니다.",
    fields: [
      { name: "anniversary", label: "결혼기념일", type: "date", saveKey: "anniversary" },
    ],
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
        meta: [
          `함께한 기간 ${formatElapsed(date, today)}`,
        ],
      };
    },
  },
  {
    id: "milestone",
    label: "주요 기념일",
    icon: "기",
    description: "대표 기념일을 선택하면 다음 기념일까지 남은 기간을 보여줍니다.",
    fields: [
      {
        name: "milestone",
        label: "기념일",
        type: "select",
        options: [
          { value: "valentine", label: "발렌타인데이 · 2월 14일" },
          { value: "white", label: "화이트데이 · 3월 14일" },
          { value: "parents", label: "어버이날 · 5월 8일" },
          { value: "pepero", label: "빼빼로데이 · 11월 11일" },
          { value: "christmas", label: "크리스마스 · 12월 25일" },
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
        meta: [
          `매년 ${config.month}월 ${config.day}일`,
        ],
      };
    },
  },
  {
    id: "childMonths",
    label: "아이 개월수",
    icon: "아",
    description: "아이 생년월일을 기준으로 현재 개월수와 연/월 단위를 함께 계산합니다.",
    fields: [
      { name: "childBirthDate", label: "아이 생년월일", type: "date", saveKey: "childBirthDate" },
    ],
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
        meta: [
          `출생일 ${formatDateKorean(birth)}`,
          `태어난 지 ${daysBetween(birth, today)}일`,
        ],
      };
    },
  },
  {
    id: "pregnancy",
    label: "임신 주수",
    icon: "주",
    description: "출산 예정일을 입력하면 현재 임신 주수와 남은 기간을 계산합니다.",
    fields: [
      { name: "dueDate", label: "출산 예정일", type: "date", saveKey: "dueDate" },
    ],
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
          meta: [
            `출산 예정일까지 ${remainingDays}일`,
          ],
        };
      }

      const weeks = Math.floor(passedDays / 7);
      const extraDays = passedDays % 7;

      return {
        primary: `현재 ${weeks}주 ${extraDays}일차`,
        secondary: remainingDays >= 0 ? `출산까지 ${remainingDays}일 남음` : `${Math.abs(remainingDays)}일 지남`,
        meta: [
          `출산 예정일 ${formatDateKorean(due)}`,
          `임신 시작 기준일 ${formatDateKorean(start)}`,
        ],
      };
    },
  },
];

const MILESTONES = {
  valentine: { label: "발렌타인데이", month: 2, day: 14 },
  white: { label: "화이트데이", month: 3, day: 14 },
  parents: { label: "어버이날", month: 5, day: 8 },
  pepero: { label: "빼빼로데이", month: 11, day: 11 },
  christmas: { label: "크리스마스", month: 12, day: 25 },
};

const featureGrid = document.querySelector("#featureGrid");
const calculatorForm = document.querySelector("#calculatorForm");
const resultPrimary = document.querySelector("#resultPrimary");
const resultSecondary = document.querySelector("#resultSecondary");
const resultMeta = document.querySelector("#resultMeta");
const featureTitle = document.querySelector('[data-role="feature-title"]');
const featureDescription = document.querySelector('[data-role="feature-description"]');
const savedList = document.querySelector("#savedList");

let activeFeatureId = FEATURES[0].id;
let storage = loadStorage();

renderFeatureTabs();
renderActiveFeature();
renderSavedList();

function renderFeatureTabs() {
  featureGrid.innerHTML = "";

  for (const feature of FEATURES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `feature-card${feature.id === activeFeatureId ? " is-active" : ""}`;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(feature.id === activeFeatureId));
    button.dataset.featureId = feature.id;
    button.innerHTML = `
      <span class="feature-icon">${feature.icon}</span>
      <span class="feature-text">
        <strong>${feature.label}</strong>
        <span>${feature.description}</span>
      </span>
    `;
    button.addEventListener("click", () => {
      activeFeatureId = feature.id;
      renderFeatureTabs();
      renderActiveFeature();
    });
    featureGrid.appendChild(button);
  }
}

function renderActiveFeature() {
  const feature = FEATURES.find((item) => item.id === activeFeatureId);
  if (!feature) {
    return;
  }

  featureTitle.textContent = feature.label;
  featureDescription.textContent = feature.description;
  calculatorForm.innerHTML = "";

  for (const field of feature.fields) {
    const wrapper = document.createElement("label");
    wrapper.className = "field";

    const label = document.createElement("span");
    label.className = "field-label";
    label.textContent = field.label;
    wrapper.appendChild(label);

    let input;
    const savedValue = storage[field.saveKey] || "";

    if (field.type === "select") {
      input = document.createElement("select");
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "선택해 주세요";
      input.appendChild(placeholder);

      for (const option of field.options) {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        input.appendChild(optionElement);
      }
    } else {
      input = document.createElement("input");
      input.type = field.type;
      if (field.placeholder) {
        input.placeholder = field.placeholder;
      }
    }

    input.name = field.name;
    input.value = savedValue;
    input.addEventListener("input", handleFormChange);
    input.addEventListener("change", handleFormChange);
    wrapper.appendChild(input);
    calculatorForm.appendChild(wrapper);
  }

  const helper = document.createElement("p");
  helper.className = "form-helper";
  helper.textContent = "입력값은 이 기기의 브라우저에 저장됩니다.";
  calculatorForm.appendChild(helper);

  updateResult();
}

function handleFormChange() {
  persistActiveForm();
  updateResult();
  renderSavedList();
}

function persistActiveForm() {
  const feature = FEATURES.find((item) => item.id === activeFeatureId);
  if (!feature) {
    return;
  }

  const formData = new FormData(calculatorForm);
  for (const field of feature.fields) {
    storage[field.saveKey] = String(formData.get(field.name) || "");
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

function updateResult() {
  const feature = FEATURES.find((item) => item.id === activeFeatureId);
  if (!feature) {
    return;
  }

  const formData = new FormData(calculatorForm);
  const values = Object.fromEntries(formData.entries());
  const today = startOfDay(new Date());
  const result = feature.calculate(values, today);

  resultPrimary.textContent = result.primary;
  resultSecondary.textContent = result.secondary || "";
  resultMeta.innerHTML = "";

  for (const line of result.meta || []) {
    const tag = document.createElement("span");
    tag.className = "meta-chip";
    tag.textContent = line;
    resultMeta.appendChild(tag);
  }
}

function renderSavedList() {
  const entries = [
    { label: "내 생년월일", value: storage.myBirthDate },
    { label: "배우자 생일", value: storage.partnerBirthday },
    { label: "결혼기념일", value: storage.anniversary },
    { label: "아이 생년월일", value: storage.childBirthDate },
    { label: "출산 예정일", value: storage.dueDate },
  ].filter((item) => item.value);

  if (entries.length === 0) {
    savedList.innerHTML = `<p class="saved-empty">아직 저장된 날짜가 없습니다.</p>`;
    return;
  }

  savedList.innerHTML = "";
  for (const entry of entries) {
    const card = document.createElement("div");
    card.className = "saved-item";
    card.innerHTML = `
      <span>${entry.label}</span>
      <strong>${formatDateKorean(parseLocalDate(entry.value))}</strong>
    `;
    savedList.appendChild(card);
  }
}

function loadStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

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

function parseLocalDate(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
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

function getNextAnnualDate(sourceDate, today) {
  let candidate = normalizeMonthDay(today.getFullYear(), sourceDate.getMonth() + 1, sourceDate.getDate());
  if (candidate < today) {
    candidate = normalizeMonthDay(today.getFullYear() + 1, sourceDate.getMonth() + 1, sourceDate.getDate());
  }
  return candidate;
}

function getNextMonthDay(today, month, day) {
  let candidate = normalizeMonthDay(today.getFullYear(), month, day);
  if (candidate < today) {
    candidate = normalizeMonthDay(today.getFullYear() + 1, month, day);
  }
  return candidate;
}

function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
}

function fullYearsBetween(from, to) {
  let years = to.getFullYear() - from.getFullYear();
  const anniversary = normalizeMonthDay(to.getFullYear(), from.getMonth() + 1, from.getDate());
  if (to < anniversary) {
    years -= 1;
  }
  return years;
}

function wholeMonthsBetween(from, to) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function formatDDay(days) {
  if (days === 0) {
    return "D-Day";
  }
  return `D-${days}`;
}

function formatDateKorean(date) {
  if (!date) {
    return "";
  }

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatElapsed(from, to) {
  const years = fullYearsBetween(from, to);
  const months = wholeMonthsBetween(addYears(from, years), to);

  if (years > 0) {
    return `${years}년 ${months}개월`;
  }
  return `${wholeMonthsBetween(from, to)}개월`;
}

function addYears(date, years) {
  return normalizeMonthDay(date.getFullYear() + years, date.getMonth() + 1, date.getDate());
}
