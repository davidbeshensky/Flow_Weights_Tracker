"use client";
import React, { useEffect, useState } from "react";

type ActivityDay = {
  date: string;
  count: number;
};

export default function MonthlyCalendarHeatmap() {
  const [activityData, setActivityData] = useState<ActivityDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ date: string; count: number } | null>(null);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  useEffect(() => {
    async function fetchAllData() {
      try {
        const res = await fetch("/api/activity-map");
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: ActivityDay[] = await res.json();
        setActivityData(data);
      } catch (err) {
        console.error("Error fetching activity data:", err);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchAllData();
  }, []);

  if (loading) return <div>Loading heatmap...</div>;

  const dateCountMap: Record<string, number> = {};
  activityData.forEach((item) => {
    dateCountMap[item.date] = item.count;
  });

  const allDates = getCalendarGridDates(currentYear, currentMonth);

  return (
    <div className="m-4 relative">
      <h2 className="mb-2 text-xl font-semibold">{monthName}</h2>
      <div className="flex flex-wrap w-[300px] gap-1">
        {allDates.map((dateInfo, index) => {
          const { dateStr, isCurrentMonth } = dateInfo;
          const count = dateStr ? dateCountMap[dateStr] || 0 : 0;
          const color = isCurrentMonth ? getColor(count) : "bg-gray-700";

          return (
            <div
              key={index}
              className={`w-8 h-8 rounded ${color} ${
                isCurrentMonth ? "hover:ring hover:ring-blue-500 cursor-pointer" : ""
              }`}
              onClick={() =>
                isCurrentMonth && dateStr
                  ? setSelectedDay({ date: dateStr, count })
                  : null
              }
              title={isCurrentMonth ? `${dateStr}: ${count} records` : ""}
            ></div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Prev
        </button>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next
        </button>
      </div>

      {selectedDay && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="p-4 bg-white rounded shadow-lg text-gray-800 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">
              {new Date(selectedDay.date).toLocaleString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
            <div className="flex justify-between">
            <p className="text-sm p-1">
              <strong>{selectedDay.count}</strong> records on this day.
            </p>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Close
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  }
}

// Helper: Generate calendar grid dates with placeholders
function getCalendarGridDates(year: number, month: number) {
    const dates = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
  
    // Add leading placeholders for days before the first day of the month
    const firstWeekday = firstDay.getDay(); // 0=Sunday, 6=Saturday
    for (let i = 0; i < firstWeekday; i++) {
      dates.push({ dateStr: "", isCurrentMonth: false });
    }
  
    // Add all days of the current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = new Date(year, month, d).toISOString().split("T")[0];
      dates.push({ dateStr, isCurrentMonth: true });
    }
  
    // Add trailing placeholders for days after the last day of the month
    const lastWeekday = lastDay.getDay(); // 0=Sunday, 6=Saturday
    for (let i = lastWeekday + 1; i < 7; i++) {
      dates.push({ dateStr: "", isCurrentMonth: false });
    }
  
    return dates;
  }
  

// Helper: Tailwind blue color scale
function getColor(count: number): string {
  if (count === 0) return "bg-white";
  if (count < 3) return "bg-blue-300";
  if (count < 5) return "bg-blue-500";
  if (count < 8) return "bg-blue-700";
  return "bg-blue-900";
}
