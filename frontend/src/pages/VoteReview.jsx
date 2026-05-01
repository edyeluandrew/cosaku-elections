import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VoterLayout from "../layouts/VoterLayout";
import voteService from "../utils/voteService";

const STORAGE_KEY = "cosaku_pending_votes";

const VoteReview = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isIncomplete, setIsIncomplete] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      navigate("/vote", { replace: true });
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setPending(parsed);
      // Validate that all positions have been voted for
      const expectedCount = parsed.totalPositions || 0;
      const actualCount = (parsed.selections || []).length;
      if (actualCount !== expectedCount) {
        setIsIncomplete(true);
      }
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      navigate("/vote", { replace: true });
    }
  }, [navigate]);

  const handleConfirm = async () => {
    if (!pending) return;
    setSubmitting(true);
    setError("");

    const results = [];
    try {
      for (const sel of pending.selections) {
        try {
          await voteService.submitVote(
            pending.electionId,
            sel.positionId,
            sel.candidateId
          );
          results.push({ ...sel, ok: true });
        } catch (err) {
          results.push({
            ...sel,
            ok: false,
            error: err.response?.data?.error || "Failed",
          });
        }
      }

      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(
        "cosaku_vote_results",
        JSON.stringify({ electionId: pending.electionId, results })
      );
      navigate("/vote/success", { replace: true });
    } catch (err) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => navigate("/vote");

  if (!pending) return null;

  return (
    <VoterLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Review Your Votes
          </h1>
          <p className="text-gray-600">
            Please confirm your selections. Once submitted, votes cannot be
            changed (except by an administrator).
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {isIncomplete && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            <p className="font-semibold mb-1">⚠️ Incomplete Votes</p>
            <p className="text-sm">You have not voted for all positions. Please go back and complete your votes.</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow divide-y">
          {pending.selections.map((s) => (
            <div
              key={s.positionId}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm text-gray-500">{s.positionName}</p>
                <p className="text-lg font-semibold text-navy-900">
                  {s.candidateName}
                </p>
                {s.candidateProgram && (
                  <p className="text-sm text-gray-600">{s.candidateProgram}</p>
                )}
              </div>
              <div className="text-emerald-600 text-2xl">✓</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center sticky bottom-6">
          <button
            onClick={handleEdit}
            disabled={submitting}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ← Edit Selections
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting || isIncomplete}
            className="bg-yellow-500 text-navy-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50"
            title={isIncomplete ? "Please vote for all positions before submitting" : ""}
          >
            {submitting ? "Submitting..." : "Confirm & Submit"}
          </button>
        </div>
      </div>
    </VoterLayout>
  );
};

export default VoteReview;
