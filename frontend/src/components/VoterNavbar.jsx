import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../utils/authService";
import voteService from "../utils/voteService";
import electionService from "../utils/electionService";

const VoterNavbar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [hasVoted, setHasVoted] = useState(false);
  const [resultsPublished, setResultsPublished] = useState(false);

  useEffect(() => {
    const checkVotingStatus = async () => {
      try {
        const el = await electionService.getActive();
        setResultsPublished(el.results_published || false);
        const votesResponse = await voteService.getMyVotes(el.id);
        setHasVoted((votesResponse.votes || []).length > 0);
      } catch (error) {
        console.error("Failed to check voting status:", error);
      }
    };

    checkVotingStatus();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <nav className="bg-navy-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/voter/dashboard" className="text-2xl font-bold text-yellow-500">
          COSAKU Votes
        </Link>

        <div className="flex items-center gap-6">
          <Link 
            to="/voter/dashboard" 
            className="hover:text-yellow-500"
          >
            Dashboard
          </Link>
          {hasVoted ? (
            <span className="text-gray-400 cursor-not-allowed">
              Results
            </span>
          ) : (
            <Link to="/results" className="hover:text-yellow-500">
              Results
            </Link>
          )}
          
          <div className="flex items-center gap-4 border-l border-gray-600 pl-6">
            <span className="text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-yellow-500 text-navy-900 px-4 py-2 rounded font-semibold hover:bg-yellow-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default VoterNavbar;
