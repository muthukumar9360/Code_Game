import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCalendarAlt, FaFire, FaCheckCircle, FaChartBar } from "react-icons/fa";

const SubmissionHeatmap = ({ userId }) => {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchActivity = async () => {
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
        setLoading(false);
      }
    };

    if (userId) fetchActivity();
  }, [userId, API]);

  // Generate 52 weeks (364 days) of grid cells ending at today
  const generateGrid = () => {
    const days = [];
    const today = new Date();
    const totalDays = 52 * 7;
    
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const count = activityData?.activityMap?.[dateStr] || 0;
      days.push({
        date: dateStr,
        count,
        dayOfWeek: d.getDay(),
        month: d.toLocaleString("default", { month: "short" })
      });
    }

    // Group into 52 columns of 7 days
    const columns = [];
    for (let i = 0; i < days.length; i += 7) {
      columns.push(days.slice(i, i + 7));
    }
    return columns;
  };

  const getCellColor = (count) => {
    if (!count || count === 0) return "bg-[#0b1320] border-white/5";
    if (count <= 2) return "bg-blue-600/80 border-blue-400/80 shadow-[0_0_8px_rgba(59,130,246,0.4)]";
    if (count <= 4) return "bg-yellow-400 border-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.6)]";
    return "bg-white border-yellow-100 shadow-[0_0_16px_rgba(255,255,255,0.95)]";
  };

  if (loading) {
    return (
      <div className="bg-[#0a1118] border border-white/10 rounded-2xl p-6 mb-8 text-center animate-pulse">
        <p className="text-xs text-gray-500 font-mono">LOADING ACTIVITY MATRIX...</p>
      </div>
    );
  }

  const columns = generateGrid();
  const totalSubmissions = activityData?.totalSubmissions || 0;
  const activeDaysCount = activityData?.activeDaysCount || 0;
  const streakCount = activityData?.streakCount || 1;
  const longestStreak = activityData?.longestStreak || streakCount;

  return (
    <div className="bg-[#0a1118] border border-white/10 rounded-3xl p-6 mb-10 shadow-2xl relative w-full">
      {/* HEADER & SUMMARY METRICS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6 w-full">
        <div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-2">
            <FaCalendarAlt className="text-orange-500" /> Submission & Battle Heatmap
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-1">
            Rolling 365-day algorithmic training and tournament activity log.
          </p>
        </div>

        {/* YEARLY SUBMISSION METRIC - NO DUPLICATE ACTIVE DAYS */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl flex items-center gap-2.5">
            <FaChartBar className="text-orange-400 text-xs" />
            <div>
              <div className="text-[9px] uppercase font-bold text-gray-400">Yearly Logged Submissions</div>
              <div className="text-sm font-black text-white font-mono">{totalSubmissions} Submissions</div>
            </div>
          </div>
        </div>
      </div>

      {/* HEATMAP GRID - FULL WIDTH */}
      <div className="w-full overflow-x-auto pb-3 custom-scrollbar">
        <div className="w-full min-w-[840px]">
          {/* Day of Week Labels + 52 Column Grid */}
          <div className="flex items-start gap-2 w-full">
            {/* Days labels */}
            <div className="flex flex-col justify-between text-[9px] text-gray-500 font-mono pr-2 py-0.5 h-[112px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Grid Columns - Full width distribution */}
            <div className="flex gap-1.5 flex-1 justify-between w-full">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1.5 flex-1 items-center">
                  {col.map((day) => (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredCell(day)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-full aspect-square max-w-[15px] min-w-[9px] rounded-[3px] border transition-transform duration-150 hover:scale-125 cursor-pointer ${getCellColor(
                        day.count
                      )}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* LEGEND & TOOLTIP */}
          <div className="flex items-center justify-between pt-4 mt-2 text-xs w-full">
            <div className="font-mono text-gray-400 text-[11px] h-5 flex items-center">
              {hoveredCell ? (
                <span className="text-white bg-black/60 px-2 py-0.5 rounded border border-white/10">
                  <strong className="text-orange-400">{hoveredCell.count} submissions</strong> on{" "}
                  {hoveredCell.date}
                </span>
              ) : (
                <span className="text-gray-500 text-[10px]">Hover any date to inspect telemetry</span>
              )}
            </div>

            {/* Heatmap intensity legend */}
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
              <span>Less</span>
              <span className="w-3 h-3 rounded-[3px] bg-[#0b1320] border border-white/5 inline-block" title="0 activities"></span>
              <span className="w-3 h-3 rounded-[3px] bg-blue-600/80 border border-blue-400/80 inline-block" title="1-2 activities"></span>
              <span className="w-3 h-3 rounded-[3px] bg-yellow-400 border border-yellow-300 inline-block" title="3-4 activities"></span>
              <span className="w-3 h-3 rounded-[3px] bg-white border border-yellow-100 shadow-[0_0_8px_rgba(255,255,255,0.8)] inline-block" title="5+ activities"></span>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionHeatmap;
