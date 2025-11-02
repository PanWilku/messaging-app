"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ReccomendationsData, SearchResult } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState("");
  const [isReccomendationsLoading, setIsReccomendationsLoading] =
    useState(true);
  const [reccomendationsData, setReccomendationsData] = useState<
    ReccomendationsData[]
  >([]);

  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const isGuest = session?.user?.type === "guest";

  function handleSearchUser() {
    if (searchQuery.trim() === "") return;

    setIsSearchLoading(true);
    setHasSearched(true);

    fetch("/api/search?query=" + encodeURIComponent(searchQuery.trim()))
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setSearchResults(data);
        setIsSearchLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching search results:", error);
        setIsSearchLoading(false);
      });
  }

  useEffect(() => {
    fetch("/api/search/reccommendations")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setIsReccomendationsLoading(false);
        setReccomendationsData(data);
      })
      .catch((error) => {
        console.error("Error fetching recommendations:", error);
        setIsReccomendationsLoading(false);
      });
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
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
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Find People</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Search Users
              </h2>
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Search by name..."
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                />
                <button
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSearchUser}
                  disabled={isSearchLoading || !searchQuery.trim()}
                >
                  {isSearchLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Searching...
                    </span>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>

              {/* Search Results - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                {searchResults.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Search Results ({searchResults.length})
                    </h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          {user.avatar ? (
                            <Image
                              src={user.avatar}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-semibold text-sm">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {user.name || "Unknown User"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/profile/${user.id}`}
                              className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              View Profile
                            </Link>
                            {isGuest ? (
                              <Link
                                href="/signin"
                                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors whitespace-nowrap"
                              >
                                Sign in to add friends
                              </Link>
                            ) : (
                              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                                Add Friend
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isSearchLoading &&
                  hasSearched &&
                  searchQuery &&
                  searchResults.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        No users found matching &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  )}

                {!hasSearched && (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <p className="text-gray-500">
                      Search for users by name to get started
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations Section - Fixed on the right, takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                People You Might Know
              </h2>

              {isReccomendationsLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-4"></div>
                  <p className="text-gray-500">Loading recommendations...</p>
                </div>
              ) : reccomendationsData.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No recommendations available</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {reccomendationsData.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt={user.name || "User"}
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center text-white font-semibold">
                            {getInitials(user.name)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {user.name || "Unknown User"}
                          </p>
                          {user.mutualFriendCount > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <svg
                                className="w-4 h-4 text-blue-600 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <span className="text-sm text-blue-600 font-medium truncate">
                                {user.mutualFriendCount} mutual
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/profile/${user.id}`}
                          className="w-full px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
                        >
                          View Profile
                        </Link>
                        {isGuest ? (
                          <Link
                            href="/signin"
                            className="w-full px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors font-medium text-center"
                          >
                            Sign in to add friends
                          </Link>
                        ) : (
                          <button className="w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium">
                            Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
