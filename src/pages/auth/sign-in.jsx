import { useState } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff, LogIn } from "lucide-react";

// Centralized API configuration
const API_URL = import.meta.env.VITE_API_URL;

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = () => {
    if (!email.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Email Required",
        text: "Please enter your email address",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (!isValidEmail(email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (!password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Password Required",
        text: "Please enter your password",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "Password must be at least 6 characters long",
        confirmButtonText: "OK",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API_URL}/auth/admin/login`, {
        email: email.trim(),
        password,
      });

      if (!res.data.token) {
        throw new Error("No token received from server");
      }

      const token = res.data.token;
      localStorage.setItem("token", token);

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Redirecting to dashboard...",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      // Small delay for better UX
      setTimeout(() => {
        navigate("/dashboard/home");
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to login. Please check your credentials and try again.";

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-8">
      <div className="w-full max-w-7xl flex gap-8 items-center">
        {/* Form Section */}
        <div className="w-full lg:w-3/5">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 mx-auto max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <Typography
                variant="h2"
                className="font-bold mb-4 text-2xl sm:text-3xl lg:text-4xl"
              >
                Sign In
              </Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="text-base sm:text-lg font-normal"
              >
                Enter your email and password to access the admin dashboard
              </Typography>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 mb-2 mx-auto w-full max-w-md"
            >
              <div className="mb-1 flex flex-col gap-6">
                {/* Email Input */}
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    Email Address
                  </Typography>
                  <Input
                    type="email"
                    size="lg"
                    placeholder="name@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    containerProps={{
                      className: "min-w-0",
                    }}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    Password
                  </Typography>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      size="lg"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="!border-t-blue-gray-200 focus:!border-t-gray-900 !pr-12"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                      containerProps={{
                        className: "min-w-0",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="!absolute right-3 top-1/2 -translate-y-1/2 text-blue-gray-500 hover:text-blue-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="mt-6 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                fullWidth
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </Button>

              {/* Info Text */}
              <Typography
                variant="small"
                color="gray"
                className="mt-6 text-center font-normal"
              >
                Admin access only. Unauthorized access is prohibited.
              </Typography>
            </form>
          </div>
        </div>

        {/* Image Section - Desktop Only */}
        <div className="w-2/5 h-full hidden lg:block">
          <img
            src="/img/pattern.png"
            className="h-[40rem] w-full object-cover rounded-3xl shadow-xl"
            alt="Sign in visual"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

export default SignIn;
