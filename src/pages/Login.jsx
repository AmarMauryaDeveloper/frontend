import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, clearError } from "../features/auth/authSlice";
import { toast } from "react-toastify";
import { Mail, Lock, Loader2 } from "lucide-react";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const resultAction = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(resultAction)) {
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } else {
      toast.error(resultAction.payload || "Invalid credentials");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-6">
        Sign In to Your Account
      </h3>

      {error && (
        <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="email"
              placeholder="name@company.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-brand-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
            />
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Authenticating...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Seeding credentials tip */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
        <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
          Sandbox Demo Credentials
        </h5>
        <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
          <p>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Admin Account:
            </span>{" "}
            admin@saas.com / password123
          </p>
          <p>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Standard User:
            </span>{" "}
            user@saas.com / password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
