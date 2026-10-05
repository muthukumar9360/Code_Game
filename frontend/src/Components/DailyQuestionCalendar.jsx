import React, { useState } from "react";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaFire,
  FaBolt,
  FaCheckCircle,
  FaTrophy,
  FaMedal,
  FaCrown,
  FaLock,
  FaCalendarCheck
} from "react-icons/fa";

const DailyQuestionCalendar = ({
  dailySolvedDates = [],
  streakCount = 0,
  longestStreak = 0,
  activeDaysStreak = 0,
  longestActiveStreak = 0,
  totalDailySolved = 0
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const solvedSet = new Set(
    (dailySolvedDates || []).map((d) => (typeof d === "string" ? d.slice(0, 10) : ""))
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Days in current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  // Calculate solved in this visible month
  let solvedInMonthCount = 0;
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (solvedSet.has(formatted)) {
      solvedInMonthCount++;
    }
  }

  // Generate calendar grid cells
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = totalDaysInPrevMonth - i;
    calendarCells.push({
      day: prevDay,
      isCurrentMonth: false,
      dateStr: null
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isSolved = solvedSet.has(formatted);
    const isToday = formatted === todayStr;

    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr: formatted,
      isSolved,
      isToday
    });
  }

  // Next month leading days to fill grid (multiple of 7)
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      dateStr: null
    });
  }

  return (
    <div className="relative bg-gradient-to-br from-[#070d14] via-[#09131d] to-[#04080e] border border-orange-500/20 rounded-3xl p-6 mb-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* BACKGROUND NEON ACCENTS */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* HEADER & METRICS */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-black font-black shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              <FaCalendarAlt size={18} />
            </span>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
                Daily Challenge Calendar
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase">
                  Cadence Tracker
                </span>
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Solve daily challenges and maintain active practice consistency.
              </p>
            </div>
          </div>
        </div>

        {/* METRICS SUMMARY BADGES - CLEAN NO DUPLICATE ACTIVE DAYS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-black/50 border border-yellow-500/30 rounded-2xl flex items-center gap-2.5 backdrop-blur-md">
            <FaBolt className="text-yellow-400 text-sm" />
            <div>
              <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Daily Solved</div>
              <div className="text-sm font-black text-white font-mono">{totalDailySolved} Solved</div>
            </div>
          </div>

          <div className="px-4 py-2 bg-black/50 border border-cyan-500/30 rounded-2xl flex items-center gap-2.5 backdrop-blur-md">
            <FaCheckCircle className="text-cyan-400 text-sm" />
            <div>
              <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{monthNames[month]} Progress</div>
              <div className="text-sm font-black text-cyan-400 font-mono">
                {solvedInMonthCount}/{totalDaysInMonth} Days
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full">
        {/* CALENDAR MATRIX (FULL WIDTH) */}
        <div className="w-full bg-[#05090f]/90 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
          {/* MONTH NAVIGATION BAR */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-black text-white uppercase tracking-widest font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                {monthNames[month]} <span className="text-orange-400">{year}</span>
              </h3>
              <button
                onClick={handleCurrentMonth}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-[10px] font-mono uppercase font-bold border border-white/10 transition active:scale-95"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500 text-gray-300 hover:text-orange-400 border border-white/10 transition active:scale-95"
                title="Previous Month"
              >
                <FaChevronLeft size={11} />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-white/5 hover:bg-orange-500/20 hover:border-orange-500 text-gray-300 hover:text-orange-400 border border-white/10 transition active:scale-95"
                title="Next Month"
              >
                <FaChevronRight size={11} />
              </button>
            </div>
          </div>

          {/* DAY NAMES */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-[10px] uppercase font-mono font-bold text-gray-500 py-1 tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* DAYS MATRIX */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="h-12 sm:h-14 rounded-xl border border-white/5 bg-black/20 p-2 text-gray-700 font-mono text-xs flex flex-col justify-between select-none opacity-30"
                  >
                    <span>{cell.day}</span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className={`h-12 sm:h-14 rounded-xl border p-2 font-mono text-xs flex flex-col justify-between transition-all duration-200 relative group cursor-pointer ${
                    cell.isSolved
                      ? "bg-gradient-to-br from-amber-500/25 via-orange-500/20 to-black/70 border-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.3)] hover:scale-[1.03]"
                      : cell.isToday
                      ? "bg-blue-500/10 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] hover:scale-[1.03]"
                      : "bg-[#081018]/70 border-white/10 hover:border-white/30 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold ${
                        cell.isSolved
                          ? "text-yellow-400 font-black"
                          : cell.isToday
                          ? "text-blue-400 font-black"
                          : "text-gray-400"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {cell.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                    )}
                  </div>

                  {cell.isSolved ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-black text-[10px] font-black shadow-sm">
                        <FaBolt size={9} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-5"></div>
                  )}

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 bg-black/95 text-white text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-orange-500/40 whitespace-nowrap shadow-2xl backdrop-blur-md">
                    {cell.dateStr}: {cell.isSolved ? "Daily Challenge Conquered" : cell.isToday ? "Today's Challenge Active" : "Unsolved Challenge"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* FOOTER LEGEND */}
          <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10 text-[11px] font-mono text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-gradient-to-br from-yellow-400 to-orange-500 border border-orange-400 inline-block shadow-sm"></span>
                Solved Day
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-500/20 border border-blue-400 inline-block"></span>
                Today
              </span>
            </div>
            <span>Personal Best: <strong className="text-yellow-400 font-mono">{longestStreak}d Streak</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuestionCalendar;
