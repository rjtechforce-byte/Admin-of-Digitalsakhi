import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export default function AdminBlockUsers() {
  const { block } = useParams();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [highlighted, setHighlighted] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [exportLimit, setExportLimit] = useState("100");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Jaldi-jaldi page badalne pe purana response naye ko overwrite na kare
    let ignore = false;

    const loadData = async () => {
      const pass = localStorage.getItem("adminPass");

      const res = await fetch(
        `https://backend.digitalsakhichuru.in/api/users?page=${page}&limit=100&block=${encodeURIComponent(
          block
        )}`,
        { headers: { "x-admin-password": pass } }
      );

      const result = await res.json();
      if (ignore) return;

      setData(result.data || []);
      setTotalPages(result.totalPages || 1);
      setTotalUsers(result.total || 0);
    };

    loadData().catch((err) => console.error(err));
    window.scrollTo(0, 0);

    return () => {
      ignore = true;
    };
  }, [page, block]);

  // 🔍 local filter (100 rows पर fast)
  const filtered = useMemo(() => {
    return data.filter((u) => {
      const matchSearch = u.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchFilter =
        filter === "all" ? true : u.result === filter;

      return matchSearch && matchFilter;
    });
  }, [data, search, filter]);

  // ✏️ inline edit (frontend)
  const handleEdit = (rowIndex, field, value) => {
    setData((prev) => {
      const updated = [...prev];
      updated[rowIndex][field] = value;
      return updated;
    });
  };

  // 🖱️ context menu
  const handleRightClick = (e, index) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      row: index,
    });
  };

  // 🎨 highlight toggle
  const toggleHighlight = () => {
    if (!contextMenu) return;

    const newSet = new Set(highlighted);
    if (newSet.has(contextMenu.row)) {
      newSet.delete(contextMenu.row);
    } else {
      newSet.add(contextMenu.row);
    }
    setHighlighted(newSet);
    setContextMenu(null);
  };

  // 🗑️ delete (frontend)
  const deleteRow = () => {
    if (!contextMenu) return;

    const updated = data.filter((_, i) => i !== contextMenu.row);
    setData(updated);

    const newSet = new Set(
      [...highlighted].filter((i) => i !== contextMenu.row)
    );
    setHighlighted(newSet);

    setContextMenu(null);
  };

  // 📥 CSV export (current page)
const exportCSV = async () => {
  try {
    setExporting(true);

    const pass = localStorage.getItem("adminPass");

    const res = await fetch(
      `https://backend.digitalsakhichuru.in/api/users?block=${encodeURIComponent(
        block
      )}&exportLimit=${exportLimit}`,
      {
        headers: {
          "x-admin-password": pass,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }

    const result = await res.json();

    const users = result.data || [];

    if (!users.length) {
      alert("No users found.");
      return;
    }

    const headers = [
      "#",
      "Name",
      "Phone",
      "Email",
      "Block",
      "Address",
      "Score",
      "Result",
      "Attempts",
      "Date",
      "Certificate",
    ];

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return "";

      return `"${String(value).replace(/"/g, '""')}"`;
    };

    const rows = users.map((u, i) => [
      i + 1,
      escapeCSV(u.name),
      escapeCSV(u.phone),
      escapeCSV(u.email),
      escapeCSV(u.block),
      escapeCSV(u.address),
      escapeCSV(u.score || ""),
      escapeCSV(u.result || ""),
      escapeCSV(u.attemptedExams || 0),
      escapeCSV(
        u.createdAt
          ? new Date(u.createdAt).toLocaleString()
          : ""
      ),
      escapeCSV(u.certificateUrl || ""),
    ]);

    let csv = headers.join(",") + "\n";

    rows.forEach((r) => {
      csv += r.join(",") + "\n";
    });

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =
      exportLimit === "all"
        ? `${block}-all-users.csv`
        : `${block}-${exportLimit}-users.csv`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Unable to export CSV.");
  } finally {
    setExporting(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-100">

      {/* 🔷 Top Bar */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500  text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="font-semibold">Block: {block}</h2>
          <p className="text-sm text-white/80">
            Total Users: {totalUsers}
          </p>
        </div>

    <div className="flex items-center gap-2">
  <select
    value={exportLimit}
    onChange={(e) => setExportLimit(e.target.value)}
    className="text-black rounded px-2 py-1"
    disabled={exporting}
  >
    <option value="100">100 Users</option>
    <option value="200">200 Users</option>
    <option value="500">500 Users</option>
    <option value="1000">1000 Users</option>
    <option value="all">All Users</option>
  </select>

  <button
    onClick={exportCSV}
    disabled={exporting}
    className="bg-white text-indigo-600 px-3 py-1 rounded disabled:opacity-50"
  >
    {exporting ? "Exporting..." : "Export CSV"}
  </button>
</div>
      </div>

      {/* 🔍 Controls */}
      <div className="p-4 flex gap-2">
        <input
          placeholder="Search name..."
          className="p-2 border rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="p-2 border rounded"
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pass">Pass</option>
          <option value="fail">Fail</option>
        </select>
      </div>

      {/* 📊 TABLE */}
      <div className="p-4 overflow-auto">
        <table className="w-full bg-white border border-gray-300 border-collapse">

          <thead className="bg-gray-200 sticky top-0">
            <tr>
              {[
                "#",
                "Name",
                "Phone",
                "Email",
                "Block",
                "Address",
                "Score",
                "Result",
                "Attempts",
                "Date",
                "Certificate",
              ].map((h) => (
                <th
                  key={h}
                  className="border border-gray-300 px-3 py-2"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((u, i) => (
              <tr
                key={u._id}
                onContextMenu={(e) => handleRightClick(e, i)}
                className={`text-center cursor-pointer
                  ${highlighted.has(i) ? "bg-yellow-200" : ""}
                  ${u.result === "pass" ? "bg-green-50" : ""}
                  ${u.result === "fail" ? "bg-red-50" : ""}
                `}
              >
                {/* 🔢 block-wise numbering */}
                <td className="border border-gray-300">
                  {(page - 1) * 100 + i + 1}
                </td>

                {["name", "phone", "email", "block", "address"].map(
                  (field) => (
                    <td
                      key={field}
                      className="border border-gray-300"
                    >
                      <input
                        value={u[field] || ""}
                        onChange={(e) =>
                          handleEdit(i, field, e.target.value)
                        }
                        className="w-full text-center bg-transparent outline-none"
                      />
                    </td>
                  )
                )}

                <td className="border border-gray-300">
                  {u.score || "-"}
                </td>

                <td
                  className={`border border-gray-300 ${
                    u.result === "pass"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {u.result || "-"}
                </td>

                <td className="border border-gray-300">
                  {u.attemptedExams || 0}
                </td>

                <td className="border border-gray-300">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleString()
                    : "-"}
                </td>

                <td className="border border-gray-300">
                  {u.certificateUrl ? (
                    <a
                      href={u.certificateUrl}
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
      <div className="flex justify-between items-center p-4 bg-white border-t">
        <div className="text-sm">
          Page {page} / {totalPages}
        </div>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            ⬅ Prev
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>
      </div>

      {/* 🖱️ Context Menu */}
      {contextMenu && (
        <div
          className="absolute bg-white shadow-lg border rounded"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={toggleHighlight}
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
          >
            {highlighted.has(contextMenu.row)
              ? "Unhighlight Row"
              : "Highlight Row"}
          </button>

          <button
            onClick={deleteRow}
            className="block px-4 py-2 hover:bg-red-100 text-red-600 w-full text-left"
          >
            Delete Row
          </button>
        </div>
      )}
    </div>
  );
}
