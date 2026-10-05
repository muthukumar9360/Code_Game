import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBolt,
  FaCheckCircle,
  FaArrowRight,
  FaChartLine
} from "react-icons/fa";

const LeetCodeActivityModule = ({
  userId,
  dailySolvedDates = [],
  totalDailySolved = 0,
  activeDaysCount = 0
}) => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Activity Heatmap State
  const [activityData, setActivityData] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState(null);

  // Solved Daily Questions Set (dates formatted as YYYY-MM-DD)
  const solvedDailySet = new Set(
    (dailySolvedDates || []).map((d) => (typeof d === "string" ? d.slice(0, 10) : ""))
  );

  // Fetch Activity Heatmap Data
  useEffect(() => {
    const fetchActivity = async () => {
      if (!userId) {
        setHeatmapLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/api/users/${userId}/submission-activity`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data?.success) {
          setActivityData(res.data);
        }
      } catch (err) {
        console.error("Failed to load activity heatmap", err);
      } finally {
        setHeatmapLoading(false);
      }
    };

    fetchActivity();
  }, [userId, API]);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  const heatmapDaysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleCurrentMonth = () => setCurrentDate(new Date());

  const todayStr = new Date().toISOString().slice(0, 10);
  const isTodaySolved = solvedDailySet.has(todayStr);

  // Count solved in current visible month
  let solvedInMonthCount = 0;
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (solvedDailySet.has(formatted)) {
      solvedInMonthCount++;
    }
  }

  // Generate calendar grid
  const calendarCells = [];
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarCells.push({
      day: totalDaysInPrevMonth - i,
      isCurrentMonth: false,
      dateStr: null
    });
  }

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr: formatted,
      isSolved: solvedDailySet.has(formatted),
      isToday: formatted === todayStr
    });
  }

  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      dateStr: null
    });
  }

  // Heatmap grid logic (52 weeks aligned Sunday to Saturday, ending at current week)
  const generateHeatmapGrid = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sun .. 6 = Sat
    const totalWeeks = 52;

    // End on current week Saturday
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - currentDayOfWeek));

    // Start 52 weeks prior on Sunday
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - (totalWeeks * 7 - 1));

    const days = [];
    const cur = new Date(startDate);

    while (cur <= endDate) {
      const dateStr = cur.toISOString().slice(0, 10);
      const isFuture = cur > today;
      const count = isFuture ? 0 : (activityData?.activityMap?.[dateStr] || 0);

      days.push({
        date: dateStr,
        count,
        dayOfWeek: cur.getDay(),
        month: cur.toLocaleString("default", { month: "short" }),
        isFuture
      });

      cur.setDate(cur.getDate() + 1);
    }

    const columns = [];
    for (let i = 0; i < days.length; i += 7) {
      columns.push(days.slice(i, i + 7));
    }
    return columns;
  };

  const heatmapColumns = generateHeatmapGrid();
  const totalSubmissions = activityData?.totalSubmissions || 0;
  const currentStreak = activityData?.streakCount || 0;
  const maxStreak = activityData?.longestStreak || currentStreak;

  // Last 12 months in chronological order ending at current month
  const past12Months = (() => {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString("default", { month: "short" }));
    }
    return months;
  })();

  const getHeatmapColor = (count, isFuture) => {
    if (isFuture) return "bg-transparent border-transparent opacity-0 pointer-events-none";
    if (!count || count === 0) return "bg-[#0b1420] border border-white/30 hover:border-white/80 shadow-[0_0_1px_rgba(255,255,255,0.2)]";
    if (count === 1) return "bg-emerald-600/70 border border-white/40 shadow-[0_0_6px_rgba(16,185,129,0.3)] hover:border-white";
    if (count <= 3) return "bg-emerald-500 border border-white/50 shadow-[0_0_10px_rgba(16,185,129,0.5)] hover:border-white";
    if (count <= 5) return "bg-amber-400 border border-white/60 shadow-[0_0_12px_rgba(251,191,36,0.6)] hover:border-white";
    return "bg-white border border-white shadow-[0_0_16px_rgba(255,255,255,0.95)]";
  };

  return (
    <div className="w-full bg-[#08111b] border-2 border-white/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_35px_rgba(255,255,255,0.08)] mb-10 overflow-hidden">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center text-white text-lg font-black shadow-sm">
            <FaCalendarAlt className="text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                Daily Coding Challenge & Activity
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white border border-white/20 uppercase tracking-widest">
                LeetCode Module
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Dual calendar challenge tracking and 365-day algorithmic submission heatmap.
            </p>
          </div>
        </div>

        {/* QUICK STATUS BADGE */}
        <div className="flex items-center gap-2">
          {isTodaySolved ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold shadow-sm">
              <FaCheckCircle className="text-emerald-400" />
              <span>Today's Daily Solved (+15 XP)</span>
            </div>
          ) : (
            <button
              onClick={() => navigate("/daily-blitz")}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-mono text-xs font-black shadow-lg transition active:scale-95"
            >
              <FaBolt />
              <span>Solve Today's Challenge</span>
              <FaArrowRight size={10} />
            </button>
          )}
        </div>
      </div>

      {/* DUAL MODULE: COMPACT CALENDAR (25%) + EXPANDED FULL-HEIGHT SUBMISSION MAP (75%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* ============================================================ */}
        {/* LEFT: LEETCODE DAILY CALENDAR CHALLENGE (COMPACT 25% WIDTH)   */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 xl:col-span-3 bg-[#050b12] border border-white/20 rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between shadow-inner h-full">
          <div>
            {/* CALENDAR HEADER & MONTH SELECTOR */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse"></span>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-mono">
                  {monthNames[month]} <span className="text-orange-400">{year}</span>
                </h3>
                <button
                  onClick={handleCurrentMonth}
                  className="ml-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 text-[9px] font-mono font-bold uppercase transition"
                >
                  Today
                </button>
              </div>

              {/* MONTH NAVIGATION ARROWS */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500 text-gray-300 hover:text-orange-400 border border-white/10 transition active:scale-95"
                  title="Previous Month"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500 text-gray-300 hover:text-orange-400 border border-white/10 transition active:scale-95"
                  title="Next Month"
                >
                  <FaChevronRight size={10} />
                </button>
              </div>
            </div>

            {/* MONTH PROGRESS INFO BAR */}
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-3 px-1">
              <span className="flex items-center gap-1.5">
                <FaBolt className="text-yellow-400" size={10} />
                <span>Monthly: <strong className="text-white font-bold">{solvedInMonthCount}/{totalDaysInMonth}</strong> Days</span>
              </span>
              <span className="text-orange-400 font-bold">
                Total Solved: {totalDailySolved}
              </span>
            </div>

            {/* CALENDAR WEEKDAYS HEADER (S M T W T F S) WITH WHITE BORDERS */}
            <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
              {daysOfWeek.map((day, idx) => (
                <div
                  key={idx}
                  className="text-[10px] uppercase font-mono font-bold text-white py-1 rounded border border-white/25 bg-white/5 shadow-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR CELLS GRID WITH WHITE BORDERS */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                if (!cell.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="h-10 sm:h-10 rounded-lg border border-white/10 bg-black/30 flex items-center justify-center text-gray-600 font-mono text-xs select-none opacity-25"
                    >
                      {cell.day}
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`h-10 sm:h-10 rounded-lg font-mono text-xs flex flex-col items-center justify-center relative group transition-all duration-150 cursor-pointer ${
                      cell.isSolved
                        ? "bg-gradient-to-br from-amber-500/35 via-orange-500/30 to-black/80 border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.3)] scale-[1.02]"
                        : cell.isToday
                        ? "bg-blue-500/20 border-2 border-white shadow-[0_0_10px_rgba(255,255,255,0.3)] scale-[1.02]"
                        : "bg-[#08121d]/90 border border-white/30 hover:border-white text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`text-[11px] ${
                        cell.isSolved
                          ? "text-yellow-300 font-black"
                          : cell.isToday
                          ? "text-blue-400 font-black"
                          : "text-gray-400"
                      }`}
                    >
                      {cell.day}
                    </span>

                    {/* SOLVED BADGE / ICON */}
                    {cell.isSolved && (
                      <span className="w-1 h-1 rounded-full bg-yellow-400 mt-0.5 shadow-sm"></span>
                    )}

                    {cell.isToday && !cell.isSolved && (
                      <span className="w-1 h-1 rounded-full bg-blue-400 mt-0.5 animate-ping"></span>
                    )}

                    {/* HOVER TOOLTIP */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-black/95 text-white text-[10px] font-mono px-2 py-1 rounded-lg border border-orange-500/40 whitespace-nowrap shadow-2xl backdrop-blur-md">
                      {cell.dateStr}: {cell.isSolved ? "Daily Challenge Conquered (+15 XP)" : cell.isToday ? "Today's Challenge Active" : "Unsolved Challenge"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CALENDAR FOOTER & LEGEND */}
          <div className="pt-3.5 mt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-gray-400">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-gradient-to-br from-yellow-400 to-orange-500 border border-orange-400 inline-block"></span>
                Solved
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-500/30 border border-blue-400 inline-block"></span>
                Today
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-[#08121d] border border-white/10 inline-block"></span>
                Unsolved
              </span>
            </div>

            <button
              onClick={() => navigate("/daily-blitz")}
              className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 transition"
            >
              <span>Daily Blitz</span>
              <FaArrowRight size={8} />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT: LEETCODE SUBMISSION MAP (EXPANDED 75% WIDTH & FULL HEIGHT) */}
        {/* ============================================================ */}
        <div className="lg:col-span-9 xl:col-span-9 bg-[#050b12] border border-white/20 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-inner h-full">
          {/* HEADER & TELEMETRY */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <FaChartLine className="text-emerald-400" />
                <span>Submission & Battle Map</span>
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                <strong className="text-white font-bold">{totalSubmissions} submissions</strong> logged in the past 365 days
              </p>
            </div>

            {/* ACTIVE DAYS & STREAK PILLS */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-mono">
                <span className="text-gray-400">Total Active: </span>
                <strong className="text-emerald-400 font-bold">{activeDaysCount} Days</strong>
              </div>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs font-mono">
                <span className="text-gray-400">Streak: </span>
                <strong className="text-yellow-400 font-bold">{currentStreak}d (Best {maxStreak}d)</strong>
              </div>
            </div>
          </div>

          {/* HEATMAP MATRIX CONTAINER (EXPANDS VERTICALLY TO USE FULL HEIGHT WITHOUT ANY X SCROLLBAR) */}
          <div className="flex-1 flex flex-col justify-center my-3 sm:my-4 w-full overflow-hidden select-none">
            {heatmapLoading ? (
              <div className="h-48 flex items-center justify-center text-xs text-gray-500 font-mono animate-pulse">
                GENERATING_ACTIVITY_HEATMAP...
              </div>
            ) : (
              <div className="w-full flex flex-col justify-between px-2">
                {/* 12 MONTH LABELS ROW (LAST 12 MONTHS DISPLAYED EVENLY ACROSS THE MAP WITH WHITE BORDERS) */}
                <div className="grid grid-cols-12 text-[10px] text-gray-300 font-mono mb-2.5 pl-8 sm:pl-9 pr-1 font-bold uppercase tracking-wider text-center gap-1">
                  {past12Months.map((m, idx) => (
                    <span key={idx} className="truncate py-0.5 rounded border border-white/20 bg-white/5 text-white shadow-sm">
                      {m}
                    </span>
                  ))}
                </div>

                {/* 7 FULL WEEKDAY LABELS (SUN, MON, TUE, WED, THU, FRI, SAT) + EXPANDED 52-COLUMN GRID */}
                <div className="flex items-start gap-1.5 sm:gap-2.5 w-full">
                  {/* ALL 7 DAYS OF THE WEEK CLEARLY LABELED WITH WHITE BORDERS */}
                  <div className="flex flex-col justify-between text-[9px] sm:text-[10px] text-gray-300 font-mono pr-1.5 h-[220px] sm:h-[245px] md:h-[265px] select-none shrink-0 w-8 sm:w-9 gap-[3px]">
                    {heatmapDaysOfWeek.map((day) => (
                      <span key={day} className="flex-1 flex items-center justify-center font-bold tracking-tight rounded border border-white/20 bg-white/5 text-white shadow-sm">
                        {day}
                      </span>
                    ))}
                  </div>

                  {/* 52 COLUMNS OF 7 DAYS (EXPANDED VERTICALLY DOWNWARD TO FILL BOTTOM SPACE) */}
                  <div className="flex gap-[2px] sm:gap-[3px] flex-1 justify-between h-[220px] sm:h-[245px] md:h-[265px] min-w-0">
                    {heatmapColumns.map((col, colIdx) => (
                      <div key={colIdx} className="flex flex-col justify-between flex-1 min-w-0 items-center h-full gap-[2px] sm:gap-[3px]">
                        {col.map((day, rowIdx) => (
                          <div
                            key={rowIdx}
                            onMouseEnter={() => !day.isFuture && setHoveredHeatmapCell(day)}
                            onMouseLeave={() => setHoveredHeatmapCell(null)}
                            className={`w-full flex-1 rounded-[2px] transition-transform duration-100 hover:scale-125 cursor-pointer ${getHeatmapColor(
                              day.count,
                              day.isFuture
                            )}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* HEATMAP FOOTER & LEGEND */}
          <div className="pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-mono text-gray-400 text-[11px] h-5 flex items-center">
              {hoveredHeatmapCell ? (
                <span className="text-white bg-black/90 px-2.5 py-0.5 rounded-lg border border-white/20 shadow-lg">
                  <strong className="text-emerald-400">{hoveredHeatmapCell.count} submissions</strong> on{" "}
                  {hoveredHeatmapCell.date}
                </span>
              ) : (
                <span className="text-gray-500 text-[10px]">Hover any date square to inspect daily telemetry</span>
              )}
            </div>

            {/* INTENSITY SCALE */}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
              <span>Less</span>
              <span className="w-3 h-3 rounded-[3px] bg-[#0b1420] border border-white/5 inline-block" title="0 submissions"></span>
              <span className="w-3 h-3 rounded-[3px] bg-emerald-600/70 border border-emerald-500/60 inline-block" title="1 submission"></span>
              <span className="w-3 h-3 rounded-[3px] bg-emerald-500 border border-emerald-400 inline-block" title="2-3 submissions"></span>
              <span className="w-3 h-3 rounded-[3px] bg-amber-400 border border-amber-300 inline-block" title="4-5 submissions"></span>
              <span className="w-3 h-3 rounded-[3px] bg-white border border-amber-200 shadow-sm inline-block" title="5+ submissions"></span>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeActivityModule;
