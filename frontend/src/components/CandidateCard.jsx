import React, { memo } from "react";
import { resolveImageUrl } from "../utils/imageUtils";

const CandidateCard = memo(({
  candidate,
  isSelected,
  onSelect,
  showResults = false,
  voteCount = 0,
  percentage = 0,
}) => {
  // Resolve the image URL to ensure it's correctly formatted
  const imageUrl = resolveImageUrl(candidate.profilePictureUrl);
  
  return (
    <div
      onClick={onSelect}
      className={`p-2 sm:p-3 rounded-lg border-2 transition-all cursor-pointer h-full flex flex-col ${
        isSelected
          ? "border-yellow-500 bg-yellow-50 shadow-lg"
          : "border-gray-200 bg-white hover:border-yellow-300"
      }`}
    >
      {/* Profile Picture - Responsive aspect ratio */}
      <div className="mb-2 sm:mb-3 aspect-square sm:aspect-video bg-gray-200 rounded-md overflow-hidden flex-shrink-0 w-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={candidate.fullName}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              console.error("Image load error for:", imageUrl);
              e.target.style.display = "none";
              e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-300 flex items-center justify-center"><span class="text-gray-500 text-xs">Failed</span></div>';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-xs sm:text-sm">No Image</span>
          </div>
        )}
      </div>

      {/* Content - grows to fill available space */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Name */}
        <h3 className="font-bold text-xs sm:text-sm md:text-base text-navy-900 line-clamp-2">
          {candidate.fullName}
        </h3>

        {/* Program */}
        {candidate.program && (
          <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">{candidate.program}</p>
        )}

        {/* Slogan */}
        {candidate.slogan && (
          <p className="text-xs italic text-gray-700 mt-1 sm:mt-2 line-clamp-2 flex-grow">
            "{candidate.slogan}"
          </p>
        )}
      </div>

      {/* Results */}
      {showResults && (
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
          <p className="text-lg sm:text-xl font-bold text-yellow-600">
            {voteCount}
          </p>
          <p className="text-xs text-gray-600">{percentage}%</p>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-2 flex items-center text-yellow-600 font-semibold text-xs">
          <span className="mr-1">✓</span>
          Selected
        </div>
      )}
    </div>
  );
});

CandidateCard.displayName = "CandidateCard";

export default CandidateCard;
