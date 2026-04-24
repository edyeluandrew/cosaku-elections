import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import VoterLayout from "../layouts/VoterLayout";
import resultsService from "../utils/resultsService";
import voteService from "../utils/voteService";
import electionService from "../utils/electionService";

const VoterDashboard = () => {
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [myVotes, setMyVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const el = await electionService.getActive();
        setElection(el);
        const votesResponse = await voteService.getMyVotes(el.id);
        setMyVotes(votesResponse.votes || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalVotes = myVotes.length;
  const maxVotes = 9; // 9 positions

  return (
    <VoterLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Voter Dashboard
          </h1>
          <p className="text-gray-600">
            Cast your votes for the COSAKU Executive Committee positions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Votes Cast</p>
            <p className="text-4xl font-bold text-yellow-600">{totalVotes}</p>
            <p className="text-xs text-gray-500 mt-2">Out of {maxVotes} positions</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Votes Remaining</p>
            <p className="text-4xl font-bold text-blue-600">{maxVotes - totalVotes}</p>
            <p className="text-xs text-gray-500 mt-2">Positions to vote on</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Progress</p>
            <p className="text-4xl font-bold text-emerald-600">
              {((totalVotes / maxVotes) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Completion rate</p>
          </div>
        </div>

        {/* My Votes */}
        {myVotes.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-navy-900 mb-4">Your Votes</h2>
            <div className="space-y-2">
              {myVotes.map((vote) => (
                <div
                  key={vote.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <div>
                    <p className="font-semibold text-navy-900">
                      {vote.position_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {vote.candidate_name}
                    </p>
                  </div>
                  <div className="text-emerald-600">✓</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            to="/vote"
            className="bg-yellow-500 text-navy-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
          >
            {totalVotes === 0 ? "Start Voting" : "Continue Voting"}
          </Link>
          <Link
            to="/results"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View Results
          </Link>
        </div>
      </div>
    </VoterLayout>
  );
};

export default VoterDashboard;
