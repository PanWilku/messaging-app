"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <div className="flex items-center space-x-4">
              <div className="text-sm">
                Welcome,{" "}
                <strong>{session?.user?.name || session?.user?.email}</strong>
                <span className="ml-2 px-2 py-1 text-xs rounded bg-gray-200">
                  {session?.user?.type === "guest" ? "Guest" : "User"}
                </span>
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Out
              </button>

              <button
                onClick={() => router.push("/friendlist")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <span>Friends</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Friends Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Friends</h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Manage your friend connections
              </p>
              <button
                onClick={() => router.push("/friendlist")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer"
              >
                View Friends
              </button>
            </div>

            {/* Messages Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Send and receive messages</p>
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer"
                onClick={() => router.push("/chat")}
              >
                Coming Soon
              </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 mb-4">Manage your profile settings</p>
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Welcome to Your Dashboard!
              </h2>
              <p className="text-gray-600 mb-6">
                This page is protected by middleware. You can only see this if
                you&apos;re authenticated!
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-medium text-blue-900 mb-2">
                  Session Info:
                </h3>
                <pre className="text-sm text-blue-800 overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
