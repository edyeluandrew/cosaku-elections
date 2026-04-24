import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

// Voter Pages
import VoterDashboard from "./pages/VoterDashboard";
import VotingPage from "./pages/VotingPage";
import VoteReview from "./pages/VoteReview";
import VoteSuccess from "./pages/VoteSuccess";
import ResultsPage from "./pages/ResultsPage";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ManageCandidates from "./pages/ManageCandidates";
import ManageVoters from "./pages/ManageVoters";
import ManageVotes from "./pages/ManageVotes";
import ElectionControl from "./pages/ElectionControl";
import LiveResults from "./pages/LiveResults";
import Reports from "./pages/Reports";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Voter Routes */}
        <Route
          path="/voter/dashboard"
          element={
            <ProtectedRoute requiredRole="voter">
              <VoterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vote"
          element={
            <ProtectedRoute requiredRole="voter">
              <VotingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vote/review"
          element={
            <ProtectedRoute requiredRole="voter">
              <VoteReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vote/success"
          element={
            <ProtectedRoute requiredRole="voter">
              <VoteSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute requiredRole="voter">
              <ResultsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/candidates"
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageCandidates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/voters"
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageVoters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/votes"
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageVotes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/election-control"
          element={
            <ProtectedRoute requiredRole="admin">
              <ElectionControl />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/live-results"
          element={
            <ProtectedRoute requiredRole="admin">
              <LiveResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
