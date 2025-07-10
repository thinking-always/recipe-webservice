import { useEffect, useState } from "react";
import "./Calendar.css";

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [entries, setEntries] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchCalendarEntries();
    // eslint-disable-next-line
  }, [year, month]); 

  async function fetchCalendarEntries() {
    const token = localStorage.getItem("token"); 
    console.log("👉 [fetch] Calendar 토큰:", token);

    if (!token) {
      console.log("Token 없음 → 캘린더 fetch 스킵");
      return;
    }

    const res = await fetch(
      `${API_URL}/calendar?year=${year}&month=${month + 1}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    console.log("[fetch] Calendar data:", data);

    setEntries(Array.isArray(data.entries) ? data.entries : []);
  }

  function toggleDateSelection(dateStr) {
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter((d) => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  async function generateRandomMeals() {
    const token = localStorage.getItem("token"); 

    if (!token) {
      alert("로그인 후 이용해주세요!");
      return;
    }

    if (selectedDates.length === 0) {
      alert("날짜를 선택하세요!");
      return;
    }

    console.log("선택된 원본:", selectedDates);

    const cleanDates = selectedDates.filter(
      (d) => d && /^\d{4}-\d{2}-\d{2}$/.test(d)
    );

    console.log("클린된 날짜:", cleanDates);

    const res = await fetch(`${API_URL}/calendar/random`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ dates: cleanDates }),
    });

    const data = await res.json();
    console.log("[POST] 서버 응답:", data);

    if (res.ok) {
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setSelectedDates([]);
    } else {
      alert(data.error || "랜덤 추천 실패!");
    }
  }

  function getCalendarCells() {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();

    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const cells = [];

    dayNames.forEach((day) => {
      cells.push(
        <div key={day} className="day-name">
          {day}
        </div>
      );
    });

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} />);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;

      const isSelected = selectedDates.includes(dateStr);
      const entry = Array.isArray(entries)
        ? entries.find((e) => e.date === dateStr)
        : null;

      cells.push(
        <div
          key={dateStr}
          className={`date-cell ${isSelected ? "selected" : ""}`}
          onMouseDown={() => {
            setIsDragging(true);
            toggleDateSelection(dateStr);
          }}
          onMouseEnter={(e) => {
            if (isDragging && e.buttons === 1) {
              if (!selectedDates.includes(dateStr)) {
                setSelectedDates([...selectedDates, dateStr]);
              }
            }
          }}
        >
          <div className="date-number">{d}</div>
          {entry && <div className="meal-name">추천: {entry.recipe_title}</div>}
        </div>
      );
    }

    return cells;
  }

  return (
    <div onMouseUp={handleMouseUp}>
      <div className="top-controls">
        <button onClick={generateRandomMeals}>🎲 랜덤 추천</button>
      </div>

      <div className="calendar">
        <div className="calendar-header">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[year - 1, year, year + 1].map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {i + 1}월
              </option>
            ))}
          </select>
        </div>

        <div className="calendar-grid">{getCalendarCells()}</div>
      </div>
    </div>
  );
}
