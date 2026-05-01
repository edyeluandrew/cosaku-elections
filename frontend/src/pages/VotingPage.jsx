import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import VoterLayout from "../layouts/VoterLayout";
import PositionSection from "../components/PositionSection";
import candidateService from "../utils/candidateService";
import electionService from "../utils/electionService";

const STORAGE_KEY = "cosaku_pending_votes";

const VotingPage = () => {
  const navigate = useNavigate();
  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const el = await electionService.getActive();
        setElection(el);
        
        // Check if voter has already voted
        const votesResponse = await voteService.getMyVotes(el.id);
        const votes = votesResponse.votes || [];
        
        if (votes.length > 0) {
          setHasVoted(true);
          setMessage("You have already submitted your votes and cannot vote again.");
          // Redirect back to dashboard after a short delay
          setTimeout(() => navigate("/voter/dashboard", { replace: true }), 2000);
          return;
        }
        
        const response = await candidateService.getCandidatesByPosition(el.id);
        setPositions(response.positions || []);
        // Restore prior selections if any
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed.electionId === el.id && parsed.map) {
              setSelectedCandidates(parsed.map);
            }
          } catch {
            /* ignore */
          }
        }
      } catch (error) {
        setMessage(
          error.response?.data?.error || "Failed to load election or candidates"
        );
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleSelectCandidate = useCallback((positionId, candidate) => {
    setSelectedCandidates((prev) => ({ ...prev, [positionId]: candidate }));
  }, []);

  const handleProceedToReview = useCallback(() => {
    if (!election) return;
    if (Object.keys(selectedCandidates).length !== positions.length) {
      setMessage("Please select a candidate for every position before proceeding.");
      return;
    }

    const selections = positions.map((p) => {
      const c = selectedCandidates[p.id];
      return {
        positionId: p.id,
        positionName: p.name,
        candidateId: c.id,
        candidateName: c.fullName || c.full_name,
        candidateProgram: c.program,
      };
    });

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        electionId: election.id,
        map: selectedCandidates,
        selections,
        totalPositions: positions.length,
      })
    );
    navigate("/vote/review");
  }, [election, selectedCandidates, positions, navigate]);

  if (loading) {
    return (
      <VoterLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading candidates...</p>
        </div>
      </VoterLayout>
    );
  }

  if (hasVoted) {
    return (
      <VoterLayout>
        <div className="space-y-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-700 mb-2">Voting Complete</h2>
            <p className="text-red-800 mb-4">{message}</p>
            <p className="text-sm text-red-700">Redirecting to dashboard...</p>
          </div>
        </div>
      </VoterLayout>
    );
  }

  return (
    <VoterLayout>
      <div className="space-y-4 sm:space-y-6 md:space-y-8">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6 lg:p-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-navy-900 mb-2">Cast Your Votes</h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            {election?.title} — Select one candidate for each position. You'll
            review your selections before they are submitted.
          </p>
        </div>

        {message && (
          <div className="p-3 sm:p-4 md:p-6 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs sm:text-sm md:text-base">
            {message}
          </div>
        )}

        {positions.map((position) => (
          <PositionSection
            key={position.id}
            position={position}
            candidates={position.candidates}
            selectedCandidate={selectedCandidates[position.id]}
            onSelectCandidate={handleSelectCandidate}
          />
        ))}

        {/* Sticky bottom button - responsive */}
        <div className="fixed bottom-0 left-0 right-0 sm:relative bg-white rounded-none sm:rounded-lg shadow p-3 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 border-t sm:border-none">
          <p className="text-xs sm:text-sm text-gray-600">
            Selected:{" "}
            <span className="font-bold text-navy-900">
              {Object.keys(selectedCandidates).length} / {positions.length}
            </span>
          </p>
          <button
            onClick={handleProceedToReview}
            disabled={Object.keys(selectedCandidates).length !== positions.length}
            className="w-full sm:w-auto bg-yellow-500 text-navy-900 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 transition text-sm sm:text-base"
          >
            Review Selections →
          </button>
        </div>

        {/* Bottom spacing for mobile to account for sticky button */}
        <div className="h-20 sm:h-0" />
      </div>
    </VoterLayout>
  );
};

export default VotingPage;
