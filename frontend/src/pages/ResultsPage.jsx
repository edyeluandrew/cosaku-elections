import React, { useEffect, useState } from "react";
import VoterLayout from "../layouts/VoterLayout";
import PositionSection from "../components/PositionSection";
import ResultChart from "../components/ResultChart";
import resultsService from "../utils/resultsService";
import electionService from "../utils/electionService";
import { downloadChart } from "../utils/chartDownloader";
import socket from "../sockets/socket";

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState("bar");
  const [electionId, setElectionId] = useState(null);
  const [election, setElection] = useState(null);

  useEffect(() => {
    let currentId = null;
    const init = async () => {
      try {
        const el = await electionService.getActive();
        currentId = el.id;
        setElectionId(el.id);
        setElection(el);
        const response = await resultsService.getLiveResults(el.id);
        setResults(response.results || []);
        socket.emit("join_election", el.id);
        socket.on("results:update", (data) => {
          if (data.electionId === el.id) {
            setResults(data.results || []);
          }
        });
      } catch (error) {
        console.error("Failed to load results:", error);
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
      <VoterLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </VoterLayout>
    );
  }

  return (
    <VoterLayout>
      <div className="space-y-6 sm:space-y-8 md:space-y-10">
        {!election?.results_published && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 sm:p-6 rounded-lg">
            <p className="text-yellow-800 font-semibold text-sm sm:text-base">
              ⏳ Results are pending admin approval
            </p>
            <p className="text-yellow-700 text-xs sm:text-sm mt-1">
              The election administrator will publish results here once they close the election.
            </p>
          </div>
        )}
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-navy-900 mb-2">
              Election Results
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              {election?.results_published ? "Live results are updating in real-time" : "Results will appear here when published"}
            </p>
          </div>
          <div className="flex gap-2 text-xs sm:text-sm">
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded font-semibold transition ${
                chartType === "bar"
                  ? "bg-yellow-500 text-navy-900"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Bar Chart
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`px-3 sm:px-4 md:px-6 py-2 md:py-3 rounded font-semibold transition ${
                chartType === "pie"
                  ? "bg-yellow-500 text-navy-900"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Pie Chart
            </button>
          </div>
        </div>

        {/* Results */}
        {results.map((position) => (
          <div key={position.id} className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-navy-900 mb-4 sm:mb-6 md:mb-8">
              {position.name}
            </h2>

            {/* Chart */}
            <div className="mb-6 sm:mb-8 md:mb-10 bg-gray-50 p-3 sm:p-4 md:p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-700">
                  {chartType === "pie" ? "Pie Chart" : "Bar Chart"}
                </h3>
                <button
                  onClick={() => downloadChart(`chart-${position.id}`, `${position.name}-results`)}
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition font-semibold"
                >
                  ⬇️ Download Chart
                </button>
              </div>
              <div id={`chart-${position.id}`}>
                <ResultChart position={position} type={chartType} />
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-navy-900">
                      Candidate
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-navy-900">
                      Votes
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-navy-900">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {position.candidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{candidate.name}</td>
                      <td className="text-right py-3 px-4 font-semibold">
                        {candidate.voteCount}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span className="text-yellow-600 font-semibold">
                          {candidate.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </VoterLayout>
  );
};

export default ResultsPage;
