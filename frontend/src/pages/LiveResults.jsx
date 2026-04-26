import React, { useEffect, useState, useCallback } from "react";
import AdminLayout from "../layouts/AdminLayout";
import ResultChart from "../components/ResultChart";
import resultsService from "../utils/resultsService";
import electionService from "../utils/electionService";
import socket from "../sockets/socket";

const LiveResults = () => {
  const [results, setResults] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("bar");
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    let currentId = null;
    const init = async () => {
      try {
        const el = await electionService.getActive();
        setElection(el);
        currentId = el.id;
        const r = await resultsService.getLiveResults(el.id);
        setResults(r.results || []);
        setLastUpdate(new Date());

        socket.emit("join_election", el.id);
        socket.on("results:update", (data) => {
          if (data.electionId === el.id) {
            setResults(data.results || []);
            setLastUpdate(new Date());
          }
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();

    return () => {
      if (currentId) socket.emit("leave_election", currentId);
      socket.off("results:update");
    };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-8 text-gray-500">Loading results...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className=\"space-y-4 sm:space-y-6\">
        <div className=\"bg-white rounded-lg shadow p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4\">
          <div>
            <h1 className=\"text-2xl sm:text-3xl font-bold text-navy-900 mb-1\">Live Results</h1>
            <p className=\"text-xs sm:text-base text-gray-600\">
              {election?.title} —{\" \"}
              <span className=\"inline-flex items-center gap-1 text-emerald-600\">
                <span className=\"w-2 h-2 bg-emerald-500 rounded-full animate-pulse\"></span>
                Live
              </span>
              {lastUpdate && (
                <span className=\"text-xs text-gray-400 ml-2\">
                  Updated {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className=\"flex gap-2 w-full sm:w-auto\">
            <button
              onClick={() => setChartType(\"bar\")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded font-semibold text-sm ${
                chartType === \"bar\"
                  ? \"bg-yellow-500 text-navy-900\"
                  : \"bg-gray-200 text-gray-700\"
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType(\"pie\")}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded font-semibold text-sm ${
                chartType === \"pie\"
                  ? \"bg-yellow-500 text-navy-900\"
                  : \"bg-gray-200 text-gray-700\"
              }`}
            >
              Pie
            </button>
          </div>
        </div>

        {results.map((position) => (
          <div key={position.id} className=\"bg-white rounded-lg shadow p-4 sm:p-6\">
            <div className=\"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4\">
              <h2 className=\"text-lg sm:text-xl font-bold text-navy-900\">{position.name}</h2>
              <span className=\"text-xs sm:text-sm text-gray-500\">
                Total votes: <span className=\"font-bold\">{position.totalVotes}</span>
              </span>
            </div>

            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6\">
              <div className=\"bg-gray-50 p-3 sm:p-4 rounded-lg overflow-x-auto\">
                <ResultChart position={position} type={chartType} />
              </div>

              <div className=\"space-y-2\">
                {position.candidates.map((c) => (
                  <div key={c.id} className=\"border border-gray-200 rounded p-2 sm:p-3\">
                    <div className=\"flex flex-col sm:flex-row justify-between sm:items-center gap-1 mb-1\">
                      <span className=\"font-medium text-sm sm:text-base text-navy-900\">{c.name}</span>
                      <span className=\"text-xs sm:text-sm\">
                        <span className=\"font-bold\">{c.voteCount}</span>{\" \"}
                        <span className=\"text-yellow-600\">({c.percentage}%)</span>
                      </span>
                    </div>
                    <div className=\"h-2 bg-gray-200 rounded\">
                      <div
                        className=\"h-2 bg-yellow-500 rounded transition-all\"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default LiveResults;
