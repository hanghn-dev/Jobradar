import React, { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useAuthStore } from "../zustand/useAuthStore.js";
import { XIcon } from "lucide-react";
import { Loader } from "lucide-react";
import HeadeProfilepage from "../components/HeadeProfilepage.jsx";
const ProfilePage = () => {
  const [preview, setPreview] = useState(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img64 = reader.result;
      setPreview(img64);
      updateProfile(img64);
    };
  };
  const inputRef = useRef();
  const deletePrepic = (e) => {
    setPreview(null);
    inputRef.current.value = "";
  };

  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  console.log(authUser);
  if (isUpdatingProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin size-20" />
      </div>
    );
  }
  return (
    <div>
      <HeadeProfilepage />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-[32px] border border-zinc-800 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 shadow-[0_0_100px_rgba(59,130,246,0.08)] overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center py-12 px-6">
            <div className="relative">
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full object-cover border border-zinc-700 ring-4 ring-zinc-900 shadow-[0_0_40px_rgba(255,255,255,0.08)]"
                  />

                  <button
                    onClick={deletePrepic}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
                  >
                    <XIcon size={18} />
                  </button>
                </div>
              ) : (
                <img
                  src={
                    authUser.profilePic ||
                    "https://mautranhve.vn/wp-content/uploads/2025/10/anh-avatar-mac-dinh-ngau.jpg"
                  }
                  alt=""
                  className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full object-cover border border-zinc-700 ring-4 ring-zinc-900 shadow-[0_0_40px_rgba(255,255,255,0.08)]"
                />
              )}

              <label
                htmlFor="profile"
                className="absolute bottom-2 right-2 cursor-pointer bg-black border border-zinc-700 hover:border-zinc-500 text-white p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Camera size={20} />

                <input
                  type="file"
                  id="profile"
                  accept="image/*"
                  hidden
                  onChange={handleFile}
                  ref={inputRef}
                />
              </label>
            </div>

            <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {authUser.fullName}
            </h2>

            <p className="text-zinc-400 text-base sm:text-lg mt-2">
              Manage your profile information
            </p>
          </div>

          {/* Information */}
          <div className="px-4 sm:px-6 pb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-violet-500" />

              <span className="text-white text-lg sm:text-xl font-bold tracking-wider">
                INFORMATION
              </span>
            </div>

            <div className="space-y-5">
              {/* Full Name */}
              <div className="rounded-3xl p-5 bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-300">
                <p className="text-xs sm:text-sm text-zinc-500 uppercase tracking-wider">
                  Full Name
                </p>

                <p className="text-lg sm:text-xl font-semibold text-white mt-2">
                  {authUser.fullName}
                </p>
              </div>

              {/* Email */}
              <div className="rounded-3xl p-5 bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-300">
                <p className="text-xs sm:text-sm text-zinc-500 uppercase tracking-wider">
                  Email
                </p>

                <p className="text-lg sm:text-xl font-semibold text-white mt-2 break-all">
                  {authUser.email}
                </p>
              </div>

              {/* Date Joined */}
              <div className="rounded-3xl p-5 bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-all duration-300">
                <p className="text-xs sm:text-sm text-zinc-500 uppercase tracking-wider">
                  Date Joined
                </p>

                <p className="text-lg sm:text-xl font-semibold text-white mt-2">
                  {authUser?.createdAt?.split("T")[0]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
