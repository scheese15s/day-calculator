import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { Button, List, ListHeader, ListRow, TextField } from "@toss/tds-mobile";

const STORAGE_KEY = "family-dday-storage";

const FEATURES = [
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

const MILESTONES = {
  valentine: { label: "발렌타인데이", month: 2, day: 14 },
  white: { label: "화이트데이", month: 3, day: 14 },
  parents: { label: "어버이날", month: 5, day: 8 },
  pepero: { label: "빼빼로데이", month: 11, day: 11 },
  christmas: { label: "크리스마스", month: 12, day: 25 },
};

class SafeAITProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("TDSMobileAITProvider failed, falling back to plain render.", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.children;
    }

    return <TDSMobileAITProvider>{this.props.children}</TDSMobileAITProvider>;
  }
}

function shouldUseAITProvider() {
  if (typeof window === "undefined") {
    return false;
  }

  // Apps in Toss runs inside a native WebView. Plain desktop/mobile browsers do not.
  return typeof window.ReactNativeWebView?.postMessage === "function";
}

function App() {
  const [activeFeatureId, setActiveFeatureId] = useState(FEATURES[0].id);
  const [storage, setStorage] = useState(() => loadStorage());

  const activeFeature = FEATURES.find((feature) => feature.id === activeFeatureId) ?? FEATURES[0];
  const values = buildFeatureValues(activeFeature, storage);
  const result = activeFeature.calculate(values, startOfDay(new Date()));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
      console.error("Failed to persist family date storage.", error);
    }
  }, [storage]);

  function updateField(saveKey, nextValue) {
    setStorage((prev) => ({
      ...prev,
      [saveKey]: nextValue,
    }));
  }

  function clearActiveFeature() {
    setStorage((prev) => {
      const next = { ...prev };
      for (const field of activeFeature.fields) {
        next[field.saveKey] = "";
      }
      return next;
    });
  }

  const savedEntries = [
    { label: "내 생년월일", value: storage.myBirthDate },
    { label: "배우자 생일", value: storage.partnerBirthday },
    { label: "결혼기념일", value: storage.anniversary },
    { label: "아이 생년월일", value: storage.childBirthDate },
    { label: "출산 예정일", value: storage.dueDate },
  ].filter((item) => item.value);

  return (
    <div className="app-shell">
      <section className="app-hero">
        <p className="app-eyebrow">Family D-Day</p>
        <h1>가족 날짜를 가장 빠르게 확인하는 방법</h1>
        <p className="app-copy">생일, 결혼기념일, 아이 개월수, 임신 주수를 한 번에 계산하는 생활형 날짜 유틸리티입니다.</p>
      </section>

      <div className="app-stack">
        <section className="tds-section">
          <ListHeader
            title={<ListHeader.TitleParagraph typography="t5" fontWeight="bold">주요 기능</ListHeader.TitleParagraph>}
            description={<ListHeader.DescriptionParagraph>필요한 계산을 선택하세요.</ListHeader.DescriptionParagraph>}
            descriptionPosition="bottom"
          />
          <List>
            {FEATURES.map((feature) => (
              <ListRow
                key={feature.id}
                contents={
                  <ListRow.Texts
                    texts={[
                      { text: feature.label },
                      { text: feature.description, typography: "t7" },
                    ]}
                  />
                }
                right={<span className={feature.id === activeFeatureId ? "feature-state active" : "feature-state"}>{feature.id === activeFeatureId ? "선택됨" : ""}</span>}
                withArrow
                onClick={() => setActiveFeatureId(feature.id)}
              />
            ))}
          </List>
        </section>

        <section className="tds-section">
          <ListHeader
            title={<ListHeader.TitleParagraph typography="t5" fontWeight="bold">{activeFeature.label}</ListHeader.TitleParagraph>}
            description={<ListHeader.DescriptionParagraph>{activeFeature.description}</ListHeader.DescriptionParagraph>}
            descriptionPosition="bottom"
          />

          <div className="form-stack">
            {activeFeature.fields.map((field) => (
              <FieldRenderer key={field.name} field={field} value={storage[field.saveKey] || ""} onChange={(nextValue) => updateField(field.saveKey, nextValue)} />
            ))}
          </div>

          <div className="button-row">
            <Button display="full" size="xlarge" variant="weak" onClick={clearActiveFeature}>
              현재 항목 초기화
            </Button>
          </div>

          <section className="result-card" aria-live="polite">
            <p className="result-label">계산 결과</p>
            <strong className="result-primary">{result.primary}</strong>
            {result.secondary ? <p className="result-secondary">{result.secondary}</p> : null}
            {result.meta.length > 0 ? (
              <List>
                {result.meta.map((line) => (
                  <ListRow
                    key={line}
                    verticalPadding="small"
                    contents={<ListRow.Texts texts={[{ text: line, typography: "t7" }]} />}
                  />
                ))}
              </List>
            ) : null}
          </section>
        </section>

        <section className="tds-section">
          <ListHeader
            title={<ListHeader.TitleParagraph typography="t5" fontWeight="bold">최근 입력 정보</ListHeader.TitleParagraph>}
            description={
              <ListHeader.DescriptionParagraph>
                로그인 없이 현재 기기에 저장됩니다. 브라우저 데이터를 삭제하면 함께 사라질 수 있습니다.
              </ListHeader.DescriptionParagraph>
            }
            descriptionPosition="bottom"
          />
          {savedEntries.length > 0 ? (
            <List>
              {savedEntries.map((entry) => (
                <ListRow
                  key={entry.label}
                  contents={<ListRow.Texts texts={[{ text: entry.label }, { text: formatDateKorean(parseLocalDate(entry.value)), typography: "t7" }]} />}
                />
              ))}
            </List>
          ) : (
            <p className="saved-empty">아직 저장된 날짜가 없습니다.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function FieldRenderer({ field, value, onChange }) {
  if (field.type === "option") {
    return (
      <div className="option-stack">
        <p className="field-title">{field.label}</p>
        <List>
          {field.options.map((option) => (
            <ListRow
              key={option.value}
              contents={<ListRow.Texts texts={[{ text: option.label }, { text: option.sublabel, typography: "t7" }]} />}
              right={<span className={option.value === value ? "feature-state active" : "feature-state"}>{option.value === value ? "선택됨" : ""}</span>}
              onClick={() => onChange(option.value)}
            />
          ))}
        </List>
      </div>
    );
  }

  return (
    <TextField
      variant="box"
      label={field.label}
      labelOption="sustain"
      value={value}
      placeholder={field.placeholder}
      onChange={(event) => onChange(event.target.value)}
      type={field.type}
    />
  );
}

function buildFeatureValues(feature, storage) {
  const values = {};
  for (const field of feature.fields) {
    values[field.name] = storage[field.saveKey] || "";
  }
  return values;
}

function loadStorage() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
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

function addYears(date, years) {
  return normalizeMonthDay(date.getFullYear() + years, date.getMonth() + 1, date.getDate());
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

const RootWrapper = shouldUseAITProvider() ? SafeAITProvider : React.Fragment;

createRoot(document.querySelector("#root")).render(
  <React.StrictMode>
    <RootWrapper>
      <App />
    </RootWrapper>
  </React.StrictMode>,
);
