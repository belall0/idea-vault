import { Link } from "@tanstack/react-router";

function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700">Page not found</h2>
        <p className="max-w-sm text-gray-500">
          Sorry, we couldn't find the page you're looking for. It might have
          been moved or deleted.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
      >
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;
