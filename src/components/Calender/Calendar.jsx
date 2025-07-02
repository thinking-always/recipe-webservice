import { useEffect, useState } from "react";
import "./Calendar.css";

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [entries, setEntries] = useState([]);

  const token = localStorage.getItem("token");
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    renderCalendar();
    fetchCalendarEntries();
    // eslint-disable-next-line
  }, [year, month, entries]);

  function toggleDateSelection(dateStr) {
    const newSet = new Set(selectedDates);
    if (newSet.has(dateStr)) {
      newSet.delete(dateStr);
    } else {
      newSet.add(dateStr);
    }
    setSelectedDates(newSet);
  }

  function renderCalendar() {
    const container = document.getElementById("calendar-days");
    if (!container) return;
    container.innerHTML = "";

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    dayNames.forEach((day) => {
      const div = document.createElement("div");
      div.className = "day-name";
      div.textContent = day;
      container.appendChild(div);
    });

    for (let i = 0; i < startDay; i++) {
      container.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const cell = document.createElement("div");
      cell.className = "date-cell";
      cell.setAttribute("data-date", dateStr);

      if (selectedDates.has(dateStr)) {
        cell.classList.add("selected");
      }

      const entry = entries.find((e) => e.date === dateStr);
      if (entry) {
        const meal = document.createElement("div");
        meal.className = "meal-name";
        meal.textContent = `추천: ${entry.recipe_title}`;
        cell.appendChild(meal);
      }

      const num = document.createElement("div");
      num.className = "date-number";
      num.textContent = d;
      cell.appendChild(num);

      cell.addEventListener("mousedown", () => {
        setIsDragging(true);
        toggleDateSelection(dateStr);
        cell.classList.toggle("selected");
      });

      cell.addEventListener("mouseenter", (e) => {
        if (isDragging && e.buttons === 1) {
          const newSet = new Set(selectedDates);
          newSet.add(dateStr);
          setSelectedDates(newSet);
          cell.classList.add("selected");
        }
      });

      container.appendChild(cell);
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  async function generateRandomMeals() {
    const dates = Array.from(selectedDates);
    if (dates.length === 0) {
      alert("날짜를 선택하세요!");
      return;
    }

    const res = await fetch(`${API_URL}/calendar/random`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ dates }),
    });

    const data = await res.json();
    setEntries(data.entries);
    setSelectedDates(new Set()); // 선택 초기화
  }

  async function fetchCalendarEntries() {
    const res = await fetch(
      `${API_URL}/calendar?year=${year}&month=${month}`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    const data = await res.json();
    setEntries(data.entries);
  }

  return (
    <div onMouseUp={handleMouseUp}>
      <div className="top-controls">
        <button onClick={generateRandomMeals}>🎲 랜덤 추천</button>
      </div>

      <div className="calendar">
        <div className="calendar-header">
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {i + 1}월
              </option>
            ))}
          </select>
        </div>

        <div className="calendar-grid" id="calendar-days"></div>
      </div>
    </div>
  );
}
