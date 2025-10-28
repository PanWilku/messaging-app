"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Lineicons } from "@lineiconshq/react-lineicons";
import {
  Search2Outlined,
  User4Outlined,
  Comment1TextOutlined,
  Hierarchy1Outlined,
} from "@lineiconshq/free-icons";

export default function Dashboard() {
  const pathname = usePathname();
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
    <div className="min-h-screen bg-gray-50 w-full flex flex-col">
      <header className="bg-white shadow">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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

              <Link
                href={{
                  pathname: "/friendlist",
                  query: { from: pathname },
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <span>Friends</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {/* Friends Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Friends</h3>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lineicons
                    icon={Hierarchy1Outlined}
                    className="w-6 h-6 text-blue-600"
                  />
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Manage your friend connections
              </p>
              <Link
                href={{
                  pathname: "/friendlist",
                  query: { from: pathname },
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-center block"
              >
                View Friends
              </Link>
            </div>

            {/* Messages Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Chat</h3>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lineicons
                    icon={Comment1TextOutlined}
                    className="w-6 h-6 text-green-600"
                  />
                </div>
              </div>
              <p className="text-gray-600 mb-4">Send and receive messages</p>
              <Link
                href={{
                  pathname: "/chat",
                  query: { from: pathname },
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-center block"
              >
                Coming Soon
              </Link>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lineicons
                    icon={User4Outlined}
                    className="w-6 h-6 text-purple-600"
                  />
                </div>
              </div>
              <p className="text-gray-600 mb-4">Manage your profile settings</p>
              <Link
                href={{
                  pathname: "/profile",
                  query: { from: pathname },
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-center block"
              >
                View Profile
              </Link>
            </div>
            {/* search for people */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Search for People
                </h3>
                <div className="p-2 bg-amber-200 rounded-lg">
                  <Lineicons
                    icon={Search2Outlined}
                    className="w-6 h-6 text-amber-400"
                  />
                </div>
              </div>
              <p className="text-gray-600 mb-4">Manage your profile settings</p>
              <Link
                href={{
                  pathname: "/search",
                  query: { from: pathname },
                }}
                className="w-full bg-amber-400 hover:bg-amber-500 text-white py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer text-center block"
              >
                Coming Soon
              </Link>
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
