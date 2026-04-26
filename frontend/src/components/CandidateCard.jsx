import React, { memo } from "react";

const CandidateCard = memo(({
  candidate,
  isSelected,
  onSelect,
  showResults = false,
  voteCount = 0,
  percentage = 0,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 sm:p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-yellow-500 bg-yellow-50 shadow-lg"
          : "border-gray-200 bg-white hover:border-yellow-300"
      }`}
    >
      {/* Profile Picture - Responsive aspect ratio */}
      <div className="mb-4 aspect-video bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
        {candidate.profilePictureUrl ? (
          <img
            src={candidate.profilePictureUrl}
            alt={candidate.fullName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-xs sm:text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-bold text-sm sm:text-lg text-navy-900 line-clamp-2">
        {candidate.fullName}
      </h3>

      {/* Program */}
      {candidate.program && (
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{candidate.program}</p>
      )}

      {/* Slogan */}
      {candidate.slogan && (
        <p className="text-xs sm:text-sm italic text-gray-700 mt-2 line-clamp-2">
          "{candidate.slogan}"
        </p>
      )}

      {/* Results */}
      {showResults && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xl sm:text-2xl font-bold text-yellow-600">
            {voteCount}
          </p>
          <p className="text-xs sm:text-sm text-gray-600">{percentage}%</p>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-3 flex items-center text-yellow-600 font-semibold text-xs sm:text-sm">
          <span className="mr-2">✓</span>
          Selected
        </div>
      )}
    </div>
  );
});

CandidateCard.displayName = "CandidateCard";

export default CandidateCard;
