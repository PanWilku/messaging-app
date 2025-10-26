// Example loading.tsx variations

// 1. Simple Spinner
export function SimpleLoading() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// 2. Skeleton Layout
export function SkeletonLoading() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>

        {/* List skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Progressive Loading
export function ProgressiveLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Loading Friends
        </h2>
        <p className="text-gray-500">Getting your friend list ready...</p>

        {/* Progress bar */}
        <div className="mt-6 w-64 mx-auto">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full animate-pulse"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Branded Loading
export function BrandedLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            MessagingApp
          </h1>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>

        <p className="mt-6 text-gray-600 animate-pulse">
          Loading your experience...
        </p>
      </div>
    </div>
  );
}
