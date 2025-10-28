"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";

export default function ProfilePage() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";
  const { data, status } = useSession();
  const user = data?.user;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div className="container flex flex-col items-center min-h-screen bg-blue-200">
      {/* Header */}
      <header className="flex w-full items bg-rose-200 h-24">
        <div className="flex h-full items-center w-full">
          <h1 className="text-4xl p-4">Back</h1>
        </div>
      </header>

      {/* main */}
      <main className="flex w-full h-full  bg-amber-200">
        <div className="grid grid-cols-1 md:grid-cols-4 justify-between w-full">
          <div className="md:col-span-3 bg-gray-200 justify-between p-4 flex w-full">
            <div className="flex w-full bg-amber-300">
              <h1>Profile</h1>
              <p>Name: {user?.name}</p>
            </div>
          </div>
          <div className="md:col-span-1 bg-gray-200 justify-between p-4 flex w-full">
            <div className="flex w-full bg-amber-300">
              <h1>Settings</h1>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
