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
  // Mobile first approach - aggressive responsive design
  const getCandidateGridClass = () => {
    const count = candidates?.length || 0;
    
    // All single column on mobile, expand on larger screens
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-1 md:grid-cols-2";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (count === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (count === 5) return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    
    // 6+ candidates
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";
  };

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 md:p-6 lg:p-8 shadow-md mb-6 sm:mb-8 md:mb-10">
      {/* Position Header */}
      <div className="mb-4 sm:mb-6 md:mb-8 pb-3 sm:pb-4 md:pb-6 border-b-2 border-yellow-500">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-navy-900">{position.name}</h2>
        {position.description && (
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">{position.description}</p>
        )}
      </div>

      {/* Vote Info */}
      {showResults && (
        <div className="mb-4 sm:mb-6 md:mb-8 p-2 sm:p-3 md:p-4 bg-yellow-50 rounded-lg">
          <p className="text-xs sm:text-sm md:text-base text-gray-700">
            Total votes: <span className="font-bold">{position.totalVotes}</span>
          </p>
        </div>
      )}

      {/* Candidates Grid - Aggressive mobile responsiveness */}
      {candidates && candidates.length > 0 ? (
        <div className={`grid ${getCandidateGridClass()} gap-2 sm:gap-3 md:gap-4 lg:gap-6 auto-rows-max`}>
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
        <div className="text-center py-6 sm:py-8 md:py-12">
          <p className="text-sm sm:text-base md:text-lg text-gray-500">No candidates for this position yet.</p>
        </div>
      )}
    </div>
  );
});

PositionSection.displayName = "PositionSection";

export default PositionSection;
