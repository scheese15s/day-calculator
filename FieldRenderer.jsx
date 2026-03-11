import { List, ListRow, TextField } from "@toss/tds-mobile";

export function FieldRenderer({ field, value, onChange }) {
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
