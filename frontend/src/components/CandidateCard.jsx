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
      className={`p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg border-2 transition-all cursor-pointer h-full flex flex-col ${
        isSelected
          ? "border-yellow-500 bg-yellow-50 shadow-lg"
          : "border-gray-200 bg-white hover:border-yellow-300"
      }`}
    >
      {/* Content - grows to fill space */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Name */}
        <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl leading-tight text-navy-900 line-clamp-2">
          {candidate.fullName}
        </h3>

        {/* Program */}
        {candidate.program && (
          <p className="text-xs sm:text-sm md:text-base text-gray-600 line-clamp-1 mt-1 sm:mt-2">{candidate.program}</p>
        )}

        {/* Slogan */}
        {candidate.slogan && (
          <p className="text-xs sm:text-sm md:text-base italic text-gray-700 mt-2 sm:mt-3 md:mt-4 line-clamp-2 flex-grow text-center">
            "{candidate.slogan}"
          </p>
        )}
      </div>

      {/* Results */}
      {showResults && (
        <div className="mt-3 sm:mt-4 md:mt-5 pt-3 sm:pt-4 md:pt-5 border-t border-gray-200">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-yellow-600 text-center">
            {voteCount}
          </p>
          <p className="text-xs sm:text-xs md:text-sm text-gray-600 text-center">{percentage}%</p>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-2 sm:mt-3 md:mt-4 flex items-center justify-center text-yellow-600 font-semibold text-xs sm:text-xs md:text-sm">
          <span className="mr-1">✓</span>
          Selected
        </div>
      )}
    </div>
  );
});

CandidateCard.displayName = "CandidateCard";

export default CandidateCard;
