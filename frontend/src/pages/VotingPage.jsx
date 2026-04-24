import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const load = async () => {
      try {
        const el = await electionService.getActive();
        setElection(el);
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
  }, []);

  const handleSelectCandidate = (positionId, candidate) => {
    setSelectedCandidates((prev) => ({ ...prev, [positionId]: candidate }));
  };

  const handleProceedToReview = () => {
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
      })
    );
    navigate("/vote/review");
  };

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

  return (
    <VoterLayout>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Cast Your Votes</h1>
          <p className="text-gray-600">
            {election?.title} — Select one candidate for each position. You'll
            review your selections before they are submitted.
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-200">
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

        <div className="sticky bottom-6 bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Selected:{" "}
            <span className="font-bold text-navy-900">
              {Object.keys(selectedCandidates).length} / {positions.length}
            </span>
          </p>
          <button
            onClick={handleProceedToReview}
            disabled={Object.keys(selectedCandidates).length !== positions.length}
            className="bg-yellow-500 text-navy-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 transition"
          >
            Review Selections →
          </button>
        </div>
      </div>
    </VoterLayout>
  );
};

export default VotingPage;
