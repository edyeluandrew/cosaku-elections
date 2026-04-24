import React from "react";

const CandidateCard = ({
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
      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-yellow-500 bg-yellow-50 shadow-lg"
          : "border-gray-200 bg-white hover:border-yellow-300"
      }`}
    >
      {/* Profile Picture */}
      <div className="mb-4">
        {candidate.profilePictureUrl ? (
          <img
            src={candidate.profilePictureUrl}
            alt={candidate.fullName}
            className="w-full h-40 object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-40 bg-gray-300 rounded-md flex items-center justify-center">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-bold text-lg text-navy-900 truncate">
        {candidate.fullName}
      </h3>

      {/* Program */}
      {candidate.program && (
        <p className="text-sm text-gray-600">{candidate.program}</p>
      )}

      {/* Slogan */}
      {candidate.slogan && (
        <p className="text-sm italic text-gray-700 mt-2 line-clamp-2">
          "{candidate.slogan}"
        </p>
      )}

      {/* Results */}
      {showResults && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-2xl font-bold text-yellow-600">{voteCount}</p>
          <p className="text-sm text-gray-600">{percentage}%</p>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-3 flex items-center text-yellow-600 font-semibold">
          <span className="mr-2">✓</span>
          Selected
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
