import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base-100 px-6">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>

        <h2 className="mt-4 text-3xl font-bold text-gray-900">
          Lost Your Way?
        </h2>

        <p className="mt-3 text-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-lg bg-primary hover:bg-primary/90 px-6 py-3 text-sm font-semibold text-primary-content transition-colors hover:bg-primary/90"
        >
          ← Go Back Home
        </Link>
      </div>
    </main>
  );
}