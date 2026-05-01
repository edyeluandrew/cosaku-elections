import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VoterLayout from "../layouts/VoterLayout";
import electionService from "../utils/electionService";

const VoteSuccess = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [election, setElection] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("cosaku_vote_results");
    if (!raw) {
      navigate("/voter/dashboard", { replace: true });
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      navigate("/voter/dashboard", { replace: true });
    }

    // Fetch election status
    const fetchElection = async () => {
      try {
        const el = await electionService.getActive();
        setElection(el);
      } catch (error) {
        console.error("Failed to fetch election:", error);
      }
    };
    fetchElection();
  }, [navigate]);

  if (!data) return null;

  const succeeded = data.results.filter((r) => r.ok);
  const failed = data.results.filter((r) => !r.ok);

  return (
    <VoterLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl mb-4">
            ✓
          </div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Votes Submitted
          </h1>
          <p className="text-gray-600">
            {succeeded.length} of {data.results.length} vote(s) recorded
            successfully.
          </p>
        </div>

        {failed.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-red-700 mb-2">
              Failed votes
            </h2>
            <ul className="space-y-2">
              {failed.map((f) => (
                <li
                  key={f.positionId}
                  className="text-sm text-gray-700 border-l-4 border-red-400 pl-3"
                >
                  <span className="font-semibold">{f.positionName}:</span>{" "}
                  {f.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {!election?.results_published && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-800 font-semibold">⏳ Results Coming Soon</p>
              <p className="text-yellow-700 text-sm mt-1">The admin will publish results after closing the election.</p>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow p-6 flex flex-wrap gap-3 justify-center">
            <Link
              to="/voter/dashboard"
              className="bg-navy-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-800"
            >
              Back to Dashboard
            </Link>
            {election?.results_published ? (
              <Link
                to="/results"
                className="bg-yellow-500 text-navy-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600"
              >
                View Live Results
              </Link>
            ) : (
              <button
                disabled
                className="bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-semibold cursor-not-allowed"
              >
                View Live Results
              </button>
            )}
          </div>
        </div>
      </div>
    </VoterLayout>
  );
};

export default VoteSuccess;
