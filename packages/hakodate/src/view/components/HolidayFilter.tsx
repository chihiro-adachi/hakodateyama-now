import { raw } from "hono/html";

function filterHoliday(checked: boolean) {
  document.querySelectorAll<HTMLElement>(".date-section").forEach((section) => {
    const isHoliday = section.dataset.holiday === "true";
    section.style.display = checked && !isHoliday ? "none" : "";
  });
}

const filterScript = filterHoliday.toString();

export function HolidayFilter() {
  return (
    <div class="filter">
      <label>
        <input type="checkbox" onchange="filterHoliday(this.checked)" />
        <span>休日のみ表示</span>
      </label>
      <script>{raw(filterScript)}</script>
    </div>
  );
}
