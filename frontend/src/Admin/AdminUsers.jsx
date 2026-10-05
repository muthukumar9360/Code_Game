import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft, FaUsers, FaSearch, FaUserShield } from "react-icons/fa";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    fetchUsers();
  }, [adminToken, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/users/admin/all`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error("Failed to fetch admin users:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;

    try {
      await axios.delete(`${API}/api/users/admin/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-[#050b10] text-white px-2 sm:px-4 py-4 font-sans relative overflow-hidden">
      {/* BACKGROUND ACCENTS */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-orange-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-[99%] mx-auto relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/home")}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-xs font-bold uppercase transition"
            >
              <FaArrowLeft /> Dashboard
            </button>
            <span className="text-gray-600">|</span>
            <h1 className="text-2xl font-black italic tracking-tight">
              BATT<span className="text-orange-500">LIX</span> <span className="text-xs text-orange-400 font-mono">(ADMIN USERS)</span>
            </h1>
          </div>

          <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
            <FaUserShield className="text-orange-400" />
            <span>Administrator Authorized</span>
          </div>
        </div>

        {/* TITLE & SEARCH */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight">
              REGISTERED <span className="text-orange-500">OPERATORS</span>
            </h2>
            <p className="text-gray-400 text-xs font-mono mt-1">
              Total Database Records: {users.length} Users
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
            <input
              type="text"
              placeholder="Filter by username/email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a1118] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-gray-600 outline-none focus:border-orange-500/50 font-mono transition"
            />
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="bg-[#0a1118]/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-12 text-center text-orange-400 font-mono animate-pulse">
              LOADING_USER_RECORDS...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-mono">
              No matching operator records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] uppercase tracking-widest text-gray-400 bg-white/5 font-mono">
                    <th className="py-4 px-6">Operator</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">XP</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 font-sans">
                        <div className="font-bold text-white">{u.username}</div>
                        <div className="text-[11px] text-gray-500">{u.fullname}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {u.email}
                      </td>
                      <td className="py-4 px-6 text-orange-400 font-bold">
                        {u.xp || 0}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id, u.username)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition active:scale-95"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
