import React from "react";
import "./index.css";
import { Route, Routes } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "./zustand/useAuthStore.js";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import HomePage from "./Pages/HomePage.jsx";
import SignUpPage from "./Pages/SignUpPage.jsx";
import LogInPage from "./Pages/LogInPage.jsx";
import SavedjobsPage from "./Pages/SavedjobsPage.jsx";
import AppliedJobsPage from "./Pages/AppliedJobsPage.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import ProfilePage from "./Pages/ProfilePage.jsx";
const App = () => {
  const { authUser, isCheckingAuth, authCheck } = useAuthStore();
  console.log("authCheck called");
  useEffect(() => {
    authCheck();
  }, [authCheck]);

  console.log(authUser);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin size-20" />
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/login"
          element={!authUser ? <LogInPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/sso-callback"
          element={<AuthenticateWithRedirectCallback />}
        />

        <Route
          path="/savedJobs"
          element={
            authUser ? <SavedjobsPage /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/appliedJobs"
          element={
            authUser ? <AppliedJobsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/settings"
          element={
            authUser ? <ProfilePage /> : <Navigate to="/login" replace />
          }
        ></Route>
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
