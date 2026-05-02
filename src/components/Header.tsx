import { Link } from "@tanstack/react-router";

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2 text-gray-800">
          <Link to="/" className="flex items-center space-x-2 text-gray-800">
            <h1 className="text-2xl font-bold">IdeaDrop</h1>
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          <Link
            to="/ideas"
            className="px-3 py-2 leading-none font-medium text-gray-600 transition hover:text-gray-900"
          >
            Ideas
          </Link>
          <Link
            to="/ideas/new"
            className="rounded-md bg-blue-600 px-4 py-2 leading-none font-medium text-white transition hover:bg-blue-700"
          >
            + New Idea
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
