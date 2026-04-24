import React from "react";
import VoterNavbar from "../components/VoterNavbar";

const VoterLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <VoterNavbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default VoterLayout;
