import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance.js";
import toast from "react-hot-toast";
export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: false,
  isSigningUp: false,
  isLoggingIn: false,
  isLoggingOut: false,
  isUpdatingProfile: false,

  authCheck: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/authCheck");
      set({ authUser: res.data.user });
      toast.success("Checking Auth successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "authCheck failed");
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("auth/signup", data);
      set({ authUser: res.data });
      toast.success("Signing up successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      set({ authUser: null });
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logging in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      set({ authUser: null });
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    set({ isLoggingOut: true });

    try {
      await axiosInstance.post("/auth/logout");

      set({ authUser: null });

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    } finally {
      set({ isLoggingOut: false });
    }
  },

  updateProfile: async (profilePic) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/profileUpdate", {
        profilePic,
      });
      console.log("aucheck", authUser);
      set({ authUser: res.data.profilePic });
      toast.success("Update Pic successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update Pic failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
