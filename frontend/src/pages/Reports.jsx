import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import resultsService from "../utils/resultsService";
import adminService from "../utils/adminService";
import electionService from "../utils/electionService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const Reports = () => {
  const [election, setElection] = useState(null);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const el = await electionService.getActive();
        setElection(el);
        const [r, dash] = await Promise.all([
          resultsService.getLiveResults(el.id),
          adminService.getDashboard(el.id),
        ]);
        setResults(r.results || []);
        setStats(dash.stats);
      } catch (e) {
        setError(e.response?.data?.error || "Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const buildRows = () => {
    const rows = [];
    results.forEach((p) => {
      p.candidates.forEach((c) => {
        rows.push({
          Position: p.name,
          Candidate: c.name,
          Program: c.program || "",
          Votes: c.voteCount,
          "Percentage (%)": c.percentage,
        });
      });
    });
    return rows;
  };

  const exportExcel = () => {
    const rows = buildRows();
    if (rows.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Results");
    XLSX.writeFile(
      wb,
      `cosaku-results-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const exportCSV = () => {
    const rows = buildRows();
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers.map((h) => `"${String(r[h]).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cosaku-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text("COSAKU Election Results", 14, y);
    y += 8;
    doc.setFontSize(11);
    doc.text(`${election?.title || ""}`, 14, y);
    y += 6;
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, y);
    y += 10;

    if (stats) {
      doc.setFontSize(12);
      doc.text(`Total voters: ${stats.totalVoters}`, 14, y); y += 6;
      doc.text(`Votes cast: ${stats.totalVotesCast}`, 14, y); y += 6;
      doc.text(`Participation: ${stats.participationRate}%`, 14, y); y += 10;
    }

    results.forEach((p) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.text(p.name, 14, y);
      y += 7;
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);
      p.candidates.forEach((c) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(
          `  - ${c.name} - ${c.voteCount} votes (${c.percentage}%)`,
          14,
          y
        );
        y += 5;
      });
      y += 4;
    });

    doc.save(`cosaku-results-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-gray-500">Loading report...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-1">Reports</h1>
          <p className="text-gray-600">{election?.title}</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500">Voters</p>
              <p className="text-2xl font-bold text-navy-900">{stats.totalVoters}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500">Votes Cast</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalVotesCast}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500">Participation</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.participationRate}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-xs text-gray-500">Positions</p>
              <p className="text-2xl font-bold text-navy-900">{stats.totalPositions}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Export Reports</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportPDF}
              className="bg-red-600 text-white px-5 py-2 rounded font-semibold hover:bg-red-700"
            >
              Export PDF
            </button>
            <button
              onClick={exportExcel}
              className="bg-emerald-600 text-white px-5 py-2 rounded font-semibold hover:bg-emerald-700"
            >
              Export Excel
            </button>
            <button
              onClick={exportCSV}
              className="bg-navy-900 text-white px-5 py-2 rounded font-semibold hover:bg-navy-800"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-navy-900 text-white">
              <tr>
                <th className="text-left py-3 px-4">Position</th>
                <th className="text-left py-3 px-4">Candidate</th>
                <th className="text-right py-3 px-4">Votes</th>
                <th className="text-right py-3 px-4">%</th>
              </tr>
            </thead>
            <tbody>
              {results.flatMap((p) =>
                p.candidates.map((c, i) => (
                  <tr key={`${p.id}-${c.id}`} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">
                      {i === 0 ? p.name : ""}
                    </td>
                    <td className="py-3 px-4">{c.name}</td>
                    <td className="py-3 px-4 text-right font-semibold">{c.voteCount}</td>
                    <td className="py-3 px-4 text-right text-yellow-600">{c.percentage}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
