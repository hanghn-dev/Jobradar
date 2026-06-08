import { create } from "zustand";
import { axiosInstance } from "../utils/axiosInstance";
import toast from "react-hot-toast";
import qs from "qs";

export const jobsStore = create((set, get) => ({
  jobsList: [],
  savedJobs: [],
  appliedJobs: [],
  savingJobId: null,
  applyingJobId: null,
  isLoadingJobs: false,
  isFetchingSavedJobs: false,
  isFetchingAppliedJobs: false,
  isSearchingJobs: false,

  isSavingJob: false,
  isApplyingJob: false,

  isDeletingSavedJob: false,
  isDeletingAppliedJob: false,

  fetchSavedJobs: async () => {
    set({ isFetchingSavedJobs: true });
    try {
      const res = await axiosInstance.get("/jobs/saved");
      console.log("savedJobs response:", res.data);
      set({ savedJobs: res.data.savedJobs });
      toast.success("Getting saved jobs successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Getting list failure");
    } finally {
      set({ isFetchingSavedJobs: false });
    }
  },

  fetchAppliedJobs: async () => {
    set({ isFetchingAppliedJobs: true });
    try {
      const res = await axiosInstance.get("/jobs/applied");
      set({ appliedJobs: res.data.appliedJobs });
      toast.success("Getting list successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Getting list failure");
    } finally {
      set({ isFetchingAppliedJobs: false });
    }
  },

  searchJobs: async (data) => {
    set({ isSearchingJobs: true });
    try {
      const res = await axiosInstance.get("/jobs/search", {
        params: data,
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: "repeat" }),
      });
      set({ jobsList: res.data.data });
      toast.success("Search jobs successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Searching jobs failed");
    } finally {
      set({ isSearchingJobs: false });
    }
  },

  getJobs: async () => {
    set({ isLoadingJobs: true });
    try {
      const res = await axiosInstance.get("/jobs/getjobs");
      set({ jobsList: res.data });
      toast.success("Get jobs successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Getting jobs failed");
    } finally {
      set({ isLoadingJobs: false });
    }
  },

  saveJob: async (id) => {
    set({ savingJobId: id });
    try {
      const res = await axiosInstance.post(`/jobs/save/${id}`);
      set((state) => ({
        savedJobs: [...state.savedJobs, res.data],
      }));
      toast.success("Job saved successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Saving job failed");
    } finally {
      set({ savingJobId: null });
    }
  },

  applyJob: async (id) => {
    set({ applyingJobId: id });
    try {
      console.log("id:", id);
      const res = await axiosInstance.post(`/jobs/apply/${id}`);
      set((state) => ({
        appliedJobs: [...state.appliedJobs, res.data],
      }));
      toast.success("Saving jobs successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Saving jobs failed");
    } finally {
      set({ applyingJobId: null });
    }
  },

  deleteSavedJob: async (id) => {
    try {
      const res = await axiosInstance.delete(`/jobs/deleteds/${id}`);
      set((state) => ({
        savedJobs: state.savedJobs.filter((job) => job._id !== id),
      }));
      toast.success("Deleting jobs successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Deleting jobs failed");
    }
  },

  deleteAppliedJob: async (id) => {
    try {
      const res = await axiosInstance.delete(`/jobs/deleteda/${id}`);
      set((state) => ({
        appliedJobs: state.appliedJobs.filter((job) => job._id !== id),
      }));
      toast.success("Deleting jobs successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Deleting jobs failed");
    }
  },
}));
