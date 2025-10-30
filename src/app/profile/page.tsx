"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type ProfileData = {
  id: number;
  email?: string;
  name: string | null;
  avatar: string | null;
  description: string | null;
  createdAt: string;
  updatedAt?: string;
};

type EditSection =
  | "name"
  | "email"
  | "avatar"
  | "description"
  | "password"
  | null;

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const user = session?.user;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<EditSection>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    description: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setFormData({
          name: data.profile.name || "",
          email: data.profile.email || "",
          avatar: data.profile.avatar || "",
          description: data.profile.description || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section: EditSection) => {
    setEditingSection(section);
    setMessage(null);
  };

  const handleCancel = () => {
    setEditingSection(null);
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        avatar: profile.avatar || "",
        description: profile.description || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const handleSave = async () => {
    if (editingSection === "password") {
      await handlePasswordChange();
      return;
    }

    if (!editingSection) return;

    try {
      setSaving(true);
      setMessage(null);

      const updateData: Record<string, string> = {};
      if (editingSection === "name") updateData.name = formData.name;
      if (editingSection === "email") updateData.email = formData.email;
      if (editingSection === "avatar") updateData.avatar = formData.avatar;
      if (editingSection === "description")
        updateData.description = formData.description;

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.profile);
        setEditingSection(null);
        setMessage({ type: "success", text: "Profile updated successfully!" });

        // Update session if name or email changed
        if (editingSection === "name" || editingSection === "email") {
          await update();
        }
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update profile",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEditingSection(null);
        setFormData({
          ...formData,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setMessage({ type: "success", text: "Password changed successfully!" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to change password",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-green-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-green-50">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-amber-50 to-green-50 py-8 px-4">
      <div className="flex w-full flex-col max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex w-full items-center justify-between">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="flex w-full  flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="flex w-full bg-gradient-to-r from-blue-500 to-green-500 h-32"></div>

          <div className="flex w-full flex-col px-6 pb-6">
            <div className="relative -mt-16 mb-4">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name || "User"}
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white text-3xl font-bold">
                  {getInitials(profile.name)}
                </div>
              )}
              <button
                onClick={() => handleEdit("avatar")}
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors cursor-pointer"
                title="Change avatar"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>

            {/* Name and Type Badge */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.name || "Unnamed User"}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.type === "user"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {user.type === "user" ? "Account" : "Guest"}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Member since {formatDate(profile.createdAt)}
              </p>
            </div>

            {/* Profile Sections */}
            <div className="space-y-4">
              {/* Name Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  {editingSection !== "name" && user.type === "user" && (
                    <button
                      onClick={() => handleEdit("name")}
                      className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingSection === "name" ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="Enter your name"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-900">{profile.name || "Not set"}</p>
                )}
              </div>

              {/* Email Section (Users Only) */}
              {user.type === "user" && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    {editingSection !== "email" && (
                      <button
                        onClick={() => handleEdit("email")}
                        className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  {editingSection === "email" ? (
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter your email"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {profile.email || "Not set"}
                    </p>
                  )}
                </div>
              )}

              {/* Description Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    About Me
                  </label>
                  {editingSection !== "description" && (
                    <button
                      onClick={() => handleEdit("description")}
                      className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingSection === "description" ? (
                  <div className="space-y-3">
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {profile.description || "No description yet"}
                  </p>
                )}
              </div>

              {/* Avatar URL Section */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Avatar URL
                  </label>
                  {editingSection !== "avatar" && (
                    <button
                      onClick={() => handleEdit("avatar")}
                      className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {editingSection === "avatar" ? (
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) =>
                        setFormData({ ...formData, avatar: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    {formData.avatar && (
                      <div className="flex items-center gap-3">
                        <Image
                          src={formData.avatar}
                          alt="Preview"
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="text-sm text-gray-500">Preview</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-900 break-all">
                    {profile.avatar || "No avatar URL set"}
                  </p>
                )}
              </div>

              {/* Password Section (Users Only) */}
              {user.type === "user" && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    {editingSection !== "password" && (
                      <button
                        onClick={() => handleEdit("password")}
                        className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  {editingSection === "password" ? (
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Current password"
                      />
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="New password (min 6 characters)"
                      />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Confirm new password"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                          {saving ? "Changing..." : "Change Password"}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900">••••••••</p>
                  )}
                </div>
              )}
            </div>

            {/* Account Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Account Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Account Type</p>
                  <p className="font-medium text-gray-900">
                    {user.type === "user" ? "Registered User" : "Guest User"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Account ID</p>
                  <p className="font-medium text-gray-900">#{profile.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Joined</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(profile.createdAt)}
                  </p>
                </div>
                {profile.updatedAt && (
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(profile.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
