"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  useGetChildrenQuery,
  useCreateChildMutation,
  useUpdateChildMutation,
  useGetMeQuery,
  useUpdateUserMutation,
  useUpdatePasswordMutation,
} from "@/lib/api/hooks";
import { useSelectedChild } from "@/lib/context/ChildContext";

export default function SettingsPage() {
  const { isLoaded, userId } = useAuth();
  const { data: children, refetch } = useGetChildrenQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { data: user } = useGetMeQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const { mutate: createChild, isLoading: isCreating } =
    useCreateChildMutation();
  const { mutate: updateChild, isLoading: isUpdating } =
    useUpdateChildMutation();
  const { mutate: updateUser, isLoading: isUpdatingProfile } =
    useUpdateUserMutation();
  const { mutate: updatePassword, isLoading: isUpdatingPassword } =
    useUpdatePasswordMutation();
  const { selectedChildId, setSelectedChild } = useSelectedChild();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", age: "", gender: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileFormData, setProfileFormData] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    country: user?.country || "",
    state: user?.state || "",
    timezone: user?.timezone || "",
    age: user?.age ? String(user.age) : "",
    zipcode: user?.zipcode || "",
  });

  const [showPasswordEdit, setShowPasswordEdit] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setProfileFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        state: user.state || "",
        timezone: user.timezone || "",
        age: user.age ? String(user.age) : "",
        zipcode: user.zipcode || "",
      });
    }
  }, [user]);

  // Auto-select first child when children are created
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChild(children[0].id);
    }
  }, [children, selectedChildId, setSelectedChild]);

  const handleSelectDefault = (childId: string) => {
    setSelectedChild(childId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name) {
      setError("Name is required");
      return;
    }

    if (!formData.age) {
      setError("Age is required");
      return;
    }

    if (!formData.gender) {
      setError("Gender is required");
      return;
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 1 || age > 18) {
      setError("Age must be between 1 and 18");
      return;
    }

    try {
      if (editingId) {
        await updateChild({
          id: editingId,
          name: formData.name,
          age,
          gender: formData.gender,
        });
        setEditingId(null);
      } else {
        await createChild({
          name: formData.name,
          age,
          gender: formData.gender,
        });
      }

      setFormData({ name: "", age: "", gender: "" });
      setShowForm(false);

      // Refetch children list - useEffect will auto-select first child if none selected
      await refetch();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to save child";
      setError(errorMessage);
    }
  };

  const handleEdit = (child: any) => {
    setEditingId(child.id);
    setFormData({
      name: child.name,
      age: String(child.age || ""),
      gender: child.gender || "",
    });
    setShowForm(true);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await updateUser({
        name: profileFormData.name || undefined,
        phoneNumber: profileFormData.phoneNumber || undefined,
        country: profileFormData.country || undefined,
        state: profileFormData.state || undefined,
        timezone: profileFormData.timezone || undefined,
        age: profileFormData.age ? Number(profileFormData.age) : undefined,
        zipcode: profileFormData.zipcode || undefined,
        profileImage: profileImageFile ?? undefined,
      });
      setProfileImageFile(null);
      setProfileImagePreview(null);
      setShowProfileEdit(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update profile";
      setError(errorMessage);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const isSettingPassword = !user?.hasPassword;

    if (!isSettingPassword && !passwordFormData.currentPassword) {
      setError("Current password is required");
      return;
    }

    if (!passwordFormData.newPassword) {
      setError("New password is required");
      return;
    }

    if (passwordFormData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const payload: { currentPassword?: string; newPassword: string } = {
        newPassword: passwordFormData.newPassword,
      };
      if (user?.hasPassword && passwordFormData.currentPassword) {
        payload.currentPassword = passwordFormData.currentPassword;
      }
      await updatePassword(payload);
      setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordEdit(false);
      // Show success - ideally with a toast/notification
      setError("");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update password";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your children and account preferences
          </p>
        </div>

        <div className="grid gap-8">
          {/* Children Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Children
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Add children (first one becomes default) and manage profiles
                </p>
              </div>
              {!showForm && (
                <button
                  onClick={() => {
                    setShowForm(true);
                    setEditingId(null);
                    setFormData({ name: "", age: "", gender: "" });
                  }}
                  className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium"
                >
                  + Add Child
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-6 border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            {/* Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {editingId ? "Edit Child" : "Add New Child"}
                </h3>

                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Child's name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="18"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="1-18"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                  >
                    {isCreating || isUpdating ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Children List */}
            <div className="space-y-3">
              {children && children.length > 0 ? (
                children.map((child) => (
                  <div
                    key={child.id}
                    className={`p-4 rounded-lg border-2 transition ${
                      child.id === selectedChildId
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-3xl">
                          {child.gender === "male" ? "👨" : "👩"}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {child.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {child.age} years old
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {child.id === selectedChildId && (
                          <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                            Default
                          </span>
                        )}
                        <button
                          onClick={() => handleSelectDefault(child.id)}
                          disabled={child.id === selectedChildId}
                          className={`px-4 py-2 rounded-lg font-medium transition ${
                            child.id === selectedChildId
                              ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-default"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                          }`}
                        >
                          Set as Default
                        </button>
                        <button
                          onClick={() => handleEdit(child)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
                  No children yet. Add one to get started!
                </p>
              )}
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">Edit your personal information</p>
              </div>
              {!showProfileEdit && (
                <button
                  onClick={() => setShowProfileEdit(true)}
                  className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-6 border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            {/* Edit Form */}
            {showProfileEdit ? (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Avatar upload */}
                <div className="flex items-center gap-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                    {profileImagePreview || user?.profileImage ? (
                      <img
                        src={profileImagePreview ?? user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">
                        {user?.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium">
                      {profileImageFile ? profileImageFile.name : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG or WebP — max 2MB</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                    <input
                      type="text"
                      value={profileFormData.name}
                      onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={profileFormData.phoneNumber}
                      onChange={(e) => setProfileFormData({ ...profileFormData, phoneNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age (Optional)</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={profileFormData.age}
                      onChange={(e) => setProfileFormData({ ...profileFormData, age: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Age"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country (Optional)</label>
                    <input
                      type="text"
                      value={profileFormData.country}
                      onChange={(e) => setProfileFormData({ ...profileFormData, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="US"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State (Optional)</label>
                    <input
                      type="text"
                      value={profileFormData.state}
                      onChange={(e) => setProfileFormData({ ...profileFormData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="California"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone (Optional)</label>
                    <input
                      type="text"
                      value={profileFormData.timezone}
                      onChange={(e) => setProfileFormData({ ...profileFormData, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="America/Los_Angeles"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zip Code (Optional)</label>
                    <input
                      type="text"
                      value={profileFormData.zipcode}
                      onChange={(e) => setProfileFormData({ ...profileFormData, zipcode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="90001"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                  >
                    {isUpdatingProfile ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowProfileEdit(false); setProfileImageFile(null); setProfileImagePreview(null); }}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-500 dark:text-gray-400">
                      {user?.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3 flex-1">
                  {[
                    { label: "Name", value: user?.name },
                    { label: "Email", value: user?.email },
                    { label: "Phone", value: user?.phoneNumber },
                    { label: "Age", value: user?.age },
                    { label: "Country", value: user?.country },
                    { label: "State", value: user?.state },
                    { label: "Timezone", value: user?.timezone },
                    { label: "Zip Code", value: user?.zipcode },
                  ].map(({ label, value }) =>
                    value ? (
                      <div key={label} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Password
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {user?.hasPassword ? "Change your account password" : "Set a password for your account"}
                </p>
              </div>
              {!showPasswordEdit && (
                <button
                  onClick={() => {
                    setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setShowPasswordEdit(true);
                  }}
                  className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium"
                >
                  {user?.hasPassword ? "Change Password" : "Set Password"}
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg mb-6 border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            {/* Edit Form */}
            {showPasswordEdit && (
              <form onSubmit={handlePasswordSubmit} className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Change Password
                </h3>

                <div className="space-y-4 mb-4">
                  {user?.hasPassword && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordFormData.currentPassword}
                        onChange={(e) =>
                          setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your current password"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordFormData.newPassword}
                      onChange={(e) =>
                        setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter a new password (min 8 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={passwordFormData.confirmPassword}
                      onChange={(e) =>
                        setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Confirm your new password"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                  >
                    {isUpdatingPassword ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordEdit(false)}
                    className="px-6 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Account Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Account
            </h2>
            <Link
              href="/payment"
              className="inline-block px-6 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              Manage Plans & Billing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
