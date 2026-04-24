import React, { useEffect, useState } from "react";
import VoterLayout from "../layouts/VoterLayout";
import PositionSection from "../components/PositionSection";
import candidateService from "../utils/candidateService";
import voteService from "../utils/voteService";

const VotingPage = () => {
  const [positions, setPositions] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const electionId = "YOUR_ELECTION_ID"; // This should come from context/state

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await candidateService.getCandidatesByPosition(
          electionId
        );
        setPositions(response.positions || []);
      } catch (error) {
        setMessage("Failed to load candidates");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleSelectCandidate = (positionId, candidate) => {
    setSelectedCandidates((prev) => ({
      ...prev,
      [positionId]: candidate,
    }));
  };

  const handleSubmitVote = async (positionId, candidate) => {
    setSubmitting(true);
    try {
      await voteService.submitVote(electionId, positionId, candidate.id);
      setMessage(`Vote submitted for ${candidate.fullName}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to submit vote";
      setMessage(errorMsg);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAllVotes = async () => {
    const unvotedPositions = positions.filter(
      (pos) => !selectedCandidates[pos.id]
    );

    if (unvotedPositions.length > 0) {
      setMessage(`You haven't voted for all positions yet`);
      return;
    }

    setSubmitting(true);
    try {
      for (const position of positions) {
        const candidate = selectedCandidates[position.id];
        if (candidate) {
          await voteService.submitVote(electionId, position.id, candidate.id);
        }
      }
      setMessage("All votes submitted successfully!");
      setSelectedCandidates({});
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Failed to submit votes";
      setMessage(errorMsg);
    } finally {
      setSubmitting(false);
    }
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Cast Your Votes</h1>
          <p className="text-gray-600">
            Select one candidate for each position. You can vote for all
            positions or vote for individual ones.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes("success") || message.includes("submitted")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* Positions */}
        {positions.map((position) => (
          <PositionSection
            key={position.id}
            position={position}
            candidates={position.candidates}
            selectedCandidate={selectedCandidates[position.id]}
            onSelectCandidate={handleSelectCandidate}
          />
        ))}

        {/* Submit Button */}
        <div className="sticky bottom-6 bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Selected:{" "}
            <span className="font-bold text-navy-900">
              {Object.keys(selectedCandidates).length} / {positions.length}
            </span>
          </p>
          <button
            onClick={handleSubmitAllVotes}
            disabled={submitting || Object.keys(selectedCandidates).length === 0}
            className="bg-yellow-500 text-navy-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 transition"
          >
            {submitting ? "Submitting..." : "Submit All Votes"}
          </button>
        </div>
      </div>
    </VoterLayout>
  );
};

export default VotingPage;
