import React, { memo } from "react";
import CandidateCard from "./CandidateCard";

const PositionSection = memo(({
  position,
  candidates,
  selectedCandidate = null,
  onSelectCandidate,
  showResults = false,
}) => {
  // Determine grid columns based on number of candidates
  const getCandidateGridClass = () => {
    const count = candidates?.length || 0;
    
    // Mobile first approach
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (count >= 5) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-8">
      {/* Position Header */}
      <div className="mb-6 pb-4 border-b-2 border-yellow-500">
        <h2 className="text-2xl font-bold text-navy-900">{position.name}</h2>
        {position.description && (
          <p className="text-gray-600 text-sm mt-1">{position.description}</p>
        )}
      </div>

      {/* Vote Info */}
      {showResults && (
        <div className="mb-6 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-700">
            Total votes: <span className="font-bold">{position.totalVotes}</span>
          </p>
        </div>
      )}

      {/* Candidates Grid - Responsive columns */}
      {candidates && candidates.length > 0 ? (
        <div className={`grid ${getCandidateGridClass()} gap-3 sm:gap-4 auto-rows-max`}>
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidate?.id === candidate.id}
              onSelect={() =>
                onSelectCandidate && onSelectCandidate(position.id, candidate)
              }
              showResults={showResults}
              voteCount={candidate.voteCount}
              percentage={candidate.percentage}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No candidates for this position yet.</p>
        </div>
      )}
    </div>
  );
});

PositionSection.displayName = "PositionSection";

export default PositionSection;
