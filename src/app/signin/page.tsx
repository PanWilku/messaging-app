"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

type AuthMode = "credentials" | "guest";

export default function SignInPage() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get("callbackUrl") || "/dashboard";

  const [mode, setMode] = useState<AuthMode>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await signIn(mode, {
      redirect: false,
      ...(mode === "credentials" ? { email, password } : { name }),
      callbackUrl,
    });

    setSubmitting(false);

    if (!res) {
      setError("Unexpected error");
      return;
    }

    if (res.error) {
      setError(
        mode === "credentials"
          ? "Invalid email or password"
          : "Failed to sign in as guest"
      );
      return;
    }

    router.push(res.url ?? callbackUrl);
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-green-50">
        <div className="w-full max-w-sm rounded-2xl shadow-lg p-6 bg-white space-y-6">
          <h1 className="text-2xl font-semibold text-center">Sign In</h1>

          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode("credentials")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                mode === "credentials"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => setMode("guest")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                mode === "guest"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Guest
            </button>
          </div>

          {error && (
            <div className="text-sm rounded-lg p-3 bg-red-100 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === "credentials" ? (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Email
                  </span>
                  <input
                    type="email"
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="Enter your email"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Password
                  </span>
                  <input
                    type="password"
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                  />
                </label>
              </>
            ) : (
              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Your Name
                </span>
                <input
                  type="text"
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  autoComplete="name"
                />
              </label>
            )}

            <button
              type="submit"
              disabled={
                submitting ||
                (mode === "credentials" ? !email || !password : !name.trim())
              }
              className={`w-full rounded-lg px-4 py-2.5 font-medium text-white disabled:opacity-60 transition-colors cursor-pointer ${
                mode === "credentials"
                  ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600"
                  : "bg-green-600 hover:bg-green-700 disabled:bg-green-600"
              }`}
            >
              {submitting
                ? "Signing in..."
                : mode === "credentials"
                ? "Sign In"
                : "Continue as Guest"}
            </button>
          </form>
          <div>
            <p>
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-blue-500 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
