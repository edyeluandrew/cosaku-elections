import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Public Pages - Direct imports for fast initial load
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

// Voter Pages - Lazy loaded
const VoterDashboard = React.lazy(() => import("./pages/VoterDashboard"));
const VotingPage = React.lazy(() => import("./pages/VotingPage"));
const VoteReview = React.lazy(() => import("./pages/VoteReview"));
const VoteSuccess = React.lazy(() => import("./pages/VoteSuccess"));
const ResultsPage = React.lazy(() => import("./pages/ResultsPage"));

// Admin Pages - Lazy loaded
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const ManageCandidates = React.lazy(() => import("./pages/ManageCandidates"));
const ManageVoters = React.lazy(() => import("./pages/ManageVoters"));
const ManageVotes = React.lazy(() => import("./pages/ManageVotes"));
const ElectionControl = React.lazy(() => import("./pages/ElectionControl"));
const LiveResults = React.lazy(() => import("./pages/LiveResults"));
const Reports = React.lazy(() => import("./pages/Reports"));

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Loading Fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-navy-900 to-navy-800">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
      <p className="text-gray-300">Loading...</p>
    </div>
  </div>
);

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
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="voter">
                <VoterDashboard />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/vote"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="voter">
                <VotingPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/vote/review"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="voter">
                <VoteReview />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/vote/success"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="voter">
                <VoteSuccess />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/results"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="voter">
                <ResultsPage />
              </ProtectedRoute>
            </Suspense>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/candidates"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="admin">
                <ManageCandidates />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/voters"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="admin">
                <ManageVoters />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/votes"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="admin">
                <ManageVotes />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/election-control"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="admin">
                <ElectionControl />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/live-results"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="admin">
                <LiveResults />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProtectedRoute requiredRole="admin">
                <Reports />
              </ProtectedRoute>
            </Suspense>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
