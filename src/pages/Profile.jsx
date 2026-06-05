import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../features/auth/authSlice";
import api from "../services/api";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  UserCircle,
  Mail,
  User,
  Lock,
  Image,
  Loader2,
  CheckCircle,
  Key,
} from "lucide-react";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // Forms hooks
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm();

  // States
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onProfileSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const result = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(result)) {
      toast.success("Profile settings updated!");
      setAvatarFile(null); // clear staged file after save
    } else {
      toast.error(result.payload || "Profile update failed");
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    try {
      const response = await api.put("/users/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        toast.success("Password updated successfully!");
        resetPasswordForm();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Password update failed");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary Left */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          <img
            src={
              photoPreview ||
              user?.avatar ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"
            }
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover border-2 border-brand-500 shadow-md mb-4"
          />
          <h4 className="text-base font-bold text-slate-800 dark:text-white">
            {user?.name}
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
            {user?.role}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">
            {user?.email}
          </p>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left text-xs font-semibold text-slate-400">
            <div className="flex justify-between items-center py-1.5">
              <span>Account Status:</span>
              <span className="text-emerald-500 flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                Active
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span>Session Logged-in:</span>
              <span className="text-slate-700 dark:text-slate-200">Yes</span>
            </div>
          </div>
        </div>

        {/* Profile Details Edit Form Middle/Right */}
        <div className="md:col-span-2 space-y-6">
          {/* Info Edit */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Profile Information
            </h4>

            <form
              onSubmit={handleProfileSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    {...registerProfile("name", {
                      required: "Name is required",
                    })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                {profileErrors.name && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="email"
                    {...registerProfile("email", {
                      required: "Email is required",
                    })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {profileErrors.email.message}
                  </p>
                )}
              </div>

              {/* Profile Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  {/* Avatar preview */}
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-brand-400 shadow-sm flex-shrink-0">
                    <img
                      src={
                        photoPreview ||
                        user?.avatar ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"
                      }
                      alt="avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Upload trigger */}
                  <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-950/10 transition-colors duration-200 group">
                    <Image className="w-5 h-5 text-slate-400 group-hover:text-brand-500 mb-1 transition-colors" />
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-brand-500 transition-colors">
                      {avatarFile ? avatarFile.name : "Click to upload a photo"}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      PNG, JPG or GIF · max 5 MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  {loading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Password Edit */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Security Credentials (Change Password)
            </h4>

            <form
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword("currentPassword", {
                      required: "Current password is required",
                    })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword("newPassword", {
                      required: "New password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword("confirmPassword", {
                      required: "Please confirm your new password",
                      validate: (val) =>
                        val === watch("newPassword") ||
                        "Passwords do not match",
                    })}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs"
                  />
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  {passwordLoading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                  )}
                  <span>Change Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
