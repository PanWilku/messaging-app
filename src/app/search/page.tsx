"use client";

import { useRouter, usePathname } from "next/navigation"; // Fix import
import { useState, useEffect } from "react";
import { ReccomendationsData, SearchResult } from "@/lib/types";
import Image from "next/image";

export default function SearchPage() {
  const router = useRouter(); // Use useRouter from next/navigation
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState("");
  const [isReccomendationsLoading, setIsReccomendationsLoading] =
    useState(true);
  const [reccomendationsData, setReccomendationsData] = useState<
    ReccomendationsData[]
  >([]);

  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  function handleSearchUser() {
    if (searchQuery.trim() === "") return;

    setIsSearchLoading(true);

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
        setIsReccomendationsLoading(false); // Set to false on error too
      });
  }, []);

  return (
    <div className="container flex-col gap-2 w-full flex h-screen justify-center items-center bg-blue-300">
      <label className="text-lg font-semibold">Search</label>
      <input
        type="text"
        value={searchQuery} // Add value prop
        className="ml-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        placeholder="Search..."
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
      />
      <button
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={handleSearchUser}
      >
        Search
      </button>
      {/* Friends Search Results Section */}
      <div>
        {isSearchLoading ? (
          <p>Loading search results...</p>
        ) : (
          <ul>
            {searchResults.map((user) => (
              <li key={user.id}>
                <Image
                  src={user.avatar || "/next.svg"}
                  alt={user.name || "User Avatar"}
                  width={30}
                  height={30}
                  className="inline-block rounded-full"
                />
                <span className="ml-2">{user.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex w-full bg-amber-300">
        <p>People you might know:</p>
        {isReccomendationsLoading ? (
          <p>Loading recommendations...</p>
        ) : (
          <ul>
            {reccomendationsData.map(
              (
                user // Now user is an object!
              ) => (
                <li key={user.id}>
                  {" "}
                  {/* Use user.id, not index */}
                  {user.name}
                  {user.mutualFriendCount > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({user.mutualFriendCount} mutual friends)
                    </span>
                  )}
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
