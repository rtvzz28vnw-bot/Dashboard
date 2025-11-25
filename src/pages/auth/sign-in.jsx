import { useState } from "react";
import { Input, Button, Typography } from "@material-tailwind/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_URL}/auth/admin/login`, {
        email,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);

      Swal.fire({
        icon: "success",
        title: "Login successful!",
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });

      navigate("/dashboard/home");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: err?.response?.data?.message || "Login failed",
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: "top-end",
      });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-7xl flex gap-8 items-center">
        <div className="w-full lg:w-3/5">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 mx-auto max-w-2xl">
            <div className="text-center mb-8">
              <Typography variant="h2" className="font-bold mb-4">
                Sign In
              </Typography>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="text-lg font-normal"
              >
                Enter your email and password to Sign In.
              </Typography>
            </div>
            <form
              onSubmit={handleSubmit}
              className="mt-8 mb-2 mx-auto w-full max-w-md"
            >
              <div className="mb-1 flex flex-col gap-6">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="-mb-3 font-medium"
                >
                  Your email
                </Typography>
                <Input
                  size="lg"
                  placeholder="name@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
                <div className="mb-1 flex flex-col gap-2 relative">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="-mb-3 font-medium"
                  >
                    Password
                  </Typography>
                  <Input
                    type={showPassword ? "text" : "password"}
                    size="lg"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="!border-t-blue-gray-200 focus:!border-t-gray-900 pr-12"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-gray-500 hover:text-blue-gray-700 transition-colors duration-200"
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

              <Button
                type="submit"
                className="mt-6 shadow-md hover:shadow-lg transition-all duration-300"
                fullWidth
              >
                Sign In
              </Button>
            </form>
          </div>
        </div>
        <div className="w-2/5 h-full hidden lg:block">
          <img
            src="/img/pattern.png"
            className="h-[40rem] w-full object-cover rounded-3xl shadow-xl"
            alt="Sign in visual"
          />
        </div>
      </div>
    </section>
  );
}

export default SignIn;
