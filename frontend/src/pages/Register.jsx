import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../utils/authService";
import { validateEmail, validatePassword } from "../utils/validators";
import voteService from "../utils/voteService";
import electionService from "../utils/electionService";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated and has voted
    const checkVotingStatus = async () => {
      try {
        const user = authService.getCurrentUser();
        if (user) {
          const el = await electionService.getActive();
          const votesResponse = await voteService.getMyVotes(el.id);
          if ((votesResponse.votes || []).length > 0) {
            setHasAlreadyVoted(true);
          }
        }
      } catch (error) {
        // Silently fail - user might not be authenticated yet
        console.log("Checking vote status...");
      }
    };
    checkVotingStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      await authService.register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.confirmPassword
      );

      setRegisteredEmail(formData.email);
      setRegistrationSuccess(true);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Registration failed";
      if (errorMsg.includes("already") || errorMsg.includes("exist")) {
        setServerError("This email is already registered. Please login instead.");
      } else {
        setServerError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (hasAlreadyVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-blue-500 text-5xl mb-4">ℹ️</div>
          <h1 className="text-3xl font-bold text-navy-900 mb-6">
            Already Voted!
          </h1>
          <p className="text-gray-700 mb-8 leading-relaxed">
            You have already submitted your votes in this election. You cannot vote again.
          </p>
          <p className="text-gray-600 mb-8">
            Please go to your dashboard to view your votes or wait for results to be published.
          </p>
          <Link
            to="/voter/dashboard"
            className="inline-block bg-navy-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-800"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-navy-900 mb-6">
            Registration Successful!
          </h1>
          <p className="text-gray-600 mb-3">
            A verification email has been sent to:
          </p>
          <p className="font-semibold text-gray-900 mb-8">{registeredEmail}</p>
          <p className="text-gray-700 mb-8 leading-relaxed">
            Please check your email inbox and click the verification link to confirm your registration and proceed to voting.
          </p>
          <p className="text-sm text-gray-500">
            The link will expire in 24 hours.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 to-navy-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2 text-center">
          COSAKU Votes
        </h1>
        <p className="text-gray-600 text-center mb-8">Register to Vote</p>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Your full name"
              disabled={loading}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              University Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="2024akcs0001gf@kab.ac.ug"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="At least 8 characters"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy-900 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Confirm your password"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-navy-900 font-semibold py-2 px-4 rounded-lg"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-yellow-500 font-semibold hover:text-yellow-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
