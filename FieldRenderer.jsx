export function FieldRenderer({ field, value, onChange }) {
  if (field.type === "option") {
    return (
      <div className="option-stack">
        <label className="field-title" htmlFor={field.name}>
          {field.label}
        </label>
        <select
          id={field.name}
          className="native-field"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">선택해 주세요</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} {option.sublabel ? `(${option.sublabel})` : ""}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <label className="field-stack" htmlFor={field.name}>
      <span className="field-title">{field.label}</span>
      <input
        id={field.name}
        className="native-field"
        value={value}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
        type={field.type}
      />
    </label>
  );
}
