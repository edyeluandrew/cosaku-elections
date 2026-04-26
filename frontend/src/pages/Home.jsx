import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 text-white">
      {/* Navigation */}
      <nav className="bg-navy-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-500">COSAKU Votes</h1>
          <div className="flex gap-4">
            <Link to="/login" className="px-4 py-2 hover:text-yellow-500">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">COSAKU Executive Committee Elections</h2>
        <p className="text-xl text-gray-300 mb-12">
          Real-time voting system for Computing Students Association of Kabale University
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/register"
            className="bg-yellow-500 text-navy-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-600 transition text-center"
          >
            Register to Vote
          </Link>
          <Link
            to="/login"
            className="bg-transparent border-2 border-yellow-500 text-yellow-500 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 hover:text-navy-900 transition text-center"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-navy-800 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-yellow-500 mb-4">Secure Voting</h3>
          <p className="text-gray-300">Email verification ensures only valid voters can participate in the election.</p>
        </div>

        <div className="bg-navy-800 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-yellow-500 mb-4">Real-Time Results</h3>
          <p className="text-gray-300">Live results update as votes are cast, with transparent vote tracking.</p>
        </div>

        <div className="bg-navy-800 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-yellow-500 mb-4">Fair & Transparent</h3>
          <p className="text-gray-300">Complete audit trail and vote edit logging for accountability.</p>
        </div>
      </div>

      {/* Positions */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Available Positions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            "President",
            "Vice President",
            "Speaker",
            "Deputy Speaker",
            "Project Lead",
            "General Secretary",
            "Publicity Secretary",
            "Treasurer",
            "Guild Council Representative",
          ].map((position) => (
            <div key={position} className="bg-navy-800 p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold text-yellow-500">{position}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
