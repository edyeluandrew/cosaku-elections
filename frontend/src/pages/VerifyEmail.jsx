import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "../utils/authService";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const result = await authService.verifyEmail(token);
        setStatus("success");
        setMessage("Email verified successfully!");

        // Automatically redirect to voting page after verification
        setTimeout(() => {
          navigate("/vote");
        }, 2000);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.error || "Verification failed");
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-navy-900 mb-4">
          Email Verification
        </h1>

        {status === "verifying" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <p className="text-gray-700 mb-4">{message}</p>
            <p className="text-sm text-gray-600">Redirecting to voting page...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <p className="text-red-600 mb-6">{message}</p>
            <button
              onClick={() => navigate("/register")}
              className="bg-yellow-500 text-navy-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
