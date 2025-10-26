"use client";

import { useState } from "react";

// Example 1: Button Loading State
export function AddFriendButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAddFriend() {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/friendlist", {
        method: "POST",
        body: JSON.stringify({ name: "New Friend" }),
      });
      // Handle response
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      onClick={handleAddFriend}
      disabled={isSubmitting}
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    >
      {isSubmitting ? (
        <>
          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          Adding...
        </>
      ) : (
        "Add Friend"
      )}
    </button>
  );
}

// Example 2: Multiple Loading States
export function FriendManager() {
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteFriend(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/friends/${id}`, { method: "DELETE" });
      setFriends(friends.filter((f) => f.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {loadingFriends ? (
        <div>Loading friends...</div>
      ) : (
        friends.map((friend) => (
          <div key={friend.id}>
            {friend.name}
            <button
              onClick={() => deleteFriend(friend.id)}
              disabled={deletingId === friend.id}
            >
              {deletingId === friend.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

// Example 3: Skeleton Loading
export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
