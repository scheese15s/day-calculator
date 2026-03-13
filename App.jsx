import React from "react";
// import { Button } from "@toss/tds-mobile";
// import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
// import { FieldRenderer } from "./FieldRenderer.jsx";
// import { formatDateKorean, parseLocalDate, startOfDay } from "./date-utils.js";
// import { FEATURES } from "./features.js";
//
// const STORAGE_KEY = "family-dday-storage";
// class SafeAITProvider extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false };
//   }
//
//   static getDerivedStateFromError() {
//     return { hasError: true };
//   }
//
//   componentDidCatch(error) {
//     console.error("TDSMobileAITProvider failed, falling back to plain render.", error);
//   }
//
//   render() {
//     if (this.state.hasError) {
//       return this.props.children;
//     }
//
//     return <TDSMobileAITProvider>{this.props.children}</TDSMobileAITProvider>;
//   }
// }

// function loadStorage() {
//   if (typeof window === "undefined") {
//     return {};
//   }
//
//   try {
//     return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
//   } catch {
//     return {};
//   }
// }
//
// function buildFeatureValues(feature, storage) {
//   const values = {};
//   for (const field of feature.fields) {
//     values[field.name] = storage[field.saveKey] || "";
//   }
//   return values;
// }
//
// function getSavedEntries(storage) {
//   return [
//     { label: "내 생년월일", value: storage.myBirthDate },
//     { label: "배우자 생일", value: storage.partnerBirthday },
//     { label: "결혼기념일", value: storage.anniversary },
//     { label: "아이 생년월일", value: storage.childBirthDate },
//     { label: "출산 예정일", value: storage.dueDate },
//   ].filter((item) => item.value);
// }
//
// function FeatureListSection({ activeFeatureId, onSelectFeature }) {
//   return null;
// }
//
// function FeatureFormSection({ activeFeature, storage, onUpdateField, onClear, result }) {
//   return null;
// }
//
// function SavedEntriesSection({ savedEntries }) {
//   return null;
// }

export function App() {
  // const [activeFeatureId, setActiveFeatureId] = useState(FEATURES[0].id);
  // const [storage, setStorage] = useState(() => loadStorage());
  //
  // const activeFeature = FEATURES.find((feature) => feature.id === activeFeatureId) ?? FEATURES[0];
  // const values = buildFeatureValues(activeFeature, storage);
  // const result = activeFeature.calculate(values, startOfDay(new Date()));
  // const savedEntries = getSavedEntries(storage);
  //
  // useEffect(() => {
  //   if (typeof window === "undefined") {
  //     return;
  //   }
  //
  //   try {
  //     window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  //   } catch (error) {
  //     console.error("Failed to persist family date storage.", error);
  //   }
  // }, [storage]);
  //
  // function updateField(saveKey, nextValue) {
  //   setStorage((prev) => ({
  //     ...prev,
  //     [saveKey]: nextValue,
  //   }));
  // }
  //
  // function clearActiveFeature() {
  //   setStorage((prev) => {
  //     const next = { ...prev };
  //     for (const field of activeFeature.fields) {
  //       next[field.saveKey] = "";
  //     }
  //     return next;
  //   });
  // }

  return (
    <div className="app-shell">
      <section className="app-hero">
        <p className="app-eyebrow">Family D-Day</p>
        <h1>가족 날짜를 가장 빠르게 확인하는 방법</h1>
        <p className="app-copy">생일, 결혼기념일, 아이 개월수, 임신 주수를 한 번에 계산하는 생활형 날짜 유틸리티입니다.</p>
      </section>

      {/* <div className="app-stack">
        <FeatureListSection activeFeatureId={activeFeatureId} onSelectFeature={setActiveFeatureId} />
        <FeatureFormSection
          activeFeature={activeFeature}
          storage={storage}
          onUpdateField={updateField}
          onClear={clearActiveFeature}
          result={result}
        />
        <SavedEntriesSection savedEntries={savedEntries} />
      </div> */}

      <div className="app-stack">
        <section className="tds-section">
          <div className="section-header">
            <h2>정적 확인 화면</h2>
            <p>이 화면이 보이면 최소 React 렌더링은 정상입니다.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export function RootApp() {
  return (
    <>
      {/* <SafeAITProvider> */}
      <App />
      {/* </SafeAITProvider> */}
    </>
  );
}
