interface HolidayFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function HolidayFilter({ checked, onChange }: HolidayFilterProps) {
  return (
    <div className="filter">
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>休日のみ表示</span>
      </label>
    </div>
  );
}
