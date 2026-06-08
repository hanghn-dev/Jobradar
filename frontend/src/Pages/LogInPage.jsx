import React from "react";
import { useAuthStore } from "../zustand/useAuthStore.js";
import { Loader } from "lucide-react";
import { EyeIcon, EyeOff } from "lucide-react";
import { useState } from "react";
const LogInPage = () => {
  const [showPass, setShowpass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const { authUser, isLoggingIn, login } = useAuthStore();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const validation = () => {
    if (!form.email.trim() || !form.password.trim()) {
      return toast.error("Please enter all information");
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      return toast.error("Email Form Invalid");
    }
    if (form.password.length < 6) {
      return toast.error("Password must have at least 6 characters");
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let checkError = validation();
    if (checkError === true) {
      return login(form);
    }
  };

  if (isLoggingIn && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin size-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-600">
            Login Page
          </h1>
          <span className="text-sm text-slate-500">
            Join us today to get started
          </span>
        </div>
        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPass ? "text" : "password"}
                placeholder="Create password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
              />
              <span
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 cursor-pointer"
                onClick={() => setShowpass(!showPass)}
              >
                {showPass ? <EyeOff /> : <EyeIcon />}
              </span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoggingIn}
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition shadow-sm"
          >
            Login
          </button>
        </form>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-xs text-slate-400 uppercase">or</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        <div className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="text-cyan-600 hover:underline font-medium"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
};

export default LogInPage;
