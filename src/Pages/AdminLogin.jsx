import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!password) {
      setError("Password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const headers = { "x-admin-password": password };

      // Sirf password check — database query nahi chalti
      let res = await fetch(
        "https://backend.digitalsakhichuru.in/api/admin/verify",
        { headers }
      );

      // Purana backend (jisme /admin/verify nahi hai): halka /blocks check
      if (res.status === 404) {
        res = await fetch(
          "https://backend.digitalsakhichuru.in/api/blocks",
          { headers }
        );
      }

      if (res.status === 401) {
        setError("Invalid password");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError("Server error");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminPass", password);
      navigate("/admin/dashboard");

    } catch {
      setError("Server error");
    }

    setLoading(false);
  };

  // ⏎ Enter key support
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-600 to-pink-500 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-[300px] h-[300px] bg-white/10 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>

      {/* Card */}
      <div className="relative bg-white/20 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-[360px] border border-white/30 transition-all duration-300 hover:scale-[1.02]">

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          Admin Panel
        </h2>

        <p className="text-white/70 text-center text-sm mb-6">
          Secure access
        </p>

        {/* Input */}
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            placeholder="Enter password"
            className="w-full p-3 pr-12 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* 👁 toggle */}
          <button
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 text-white/70 text-sm"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        {/* ❌ Error */}
        {error && (
          <p className="text-red-300 text-sm mt-2 text-center">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-5 py-3 rounded-lg bg-white text-indigo-600 font-semibold hover:bg-gray-200 transition flex justify-center items-center gap-2 disabled:opacity-60"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          {loading ? "Checking..." : "Login"}
        </button>

      </div>
    </div>
  );
}
