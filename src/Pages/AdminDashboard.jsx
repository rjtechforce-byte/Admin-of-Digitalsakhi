import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [blocks, setBlocks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBlocks = async () => {
      const pass = localStorage.getItem("adminPass");

      const res = await fetch(
        "https://backend.digitalsakhichuru.in/api/blocks",
        {
          headers: {
            "x-admin-password": pass,
          },
        }
      );

      if (res.status === 401) {
        navigate("/");
        return;
      }

      const data = await res.json();
      setBlocks(Array.isArray(data) ? data : []);
    };

    loadBlocks().catch((err) => console.error(err));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6">

      {/* 🔷 Header */}
      <div className="text-white mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-white/80">Select a block to view users</p>
      </div>

      {/* 🔥 Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

        {blocks.map((b, i) => (
          <div
            key={i}
            onClick={() => navigate(`/admin/block/${b}`)}
            className="cursor-pointer bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 text-white shadow-xl hover:scale-105 hover:bg-white/30 transition duration-300"
          >

            {/* Block name */}
            <h2 className="text-xl font-semibold mb-2">
              {b}
            </h2>

            {/* count (optional placeholder) */}
            <p className="text-white/70 text-sm">
              Users available
            </p>

            {/* arrow */}
            <div className="mt-4 text-right text-lg">
              ➜
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}
