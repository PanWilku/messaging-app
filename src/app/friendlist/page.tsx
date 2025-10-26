"use client";

import { useEffect, useState } from "react";

interface Friend {
  id: string;
  name: string;
}

export default function FriendListPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await fetch("/api/friendlist");

        if (!res.ok) {
          const errorData = await res
            .json()
            .catch(() => ({ error: "Unknown error" }));
          setError(errorData.error || `HTTP ${res.status}`);
          return;
        }

        const data = await res.json();
        setFriends(data.friends);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch friends"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchFriends();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading friends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Friends</h1>
      {friends.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No friends yet. Start adding some!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {friend.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
