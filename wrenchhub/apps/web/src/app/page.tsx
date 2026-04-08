import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <div className="flex flex-col items-center justify-center px-6 py-24">
        <h1 className="text-5xl font-extrabold mb-4 text-center">
          <span className="text-brand-orange">Stop Overpaying</span>
          <br />
          for Car Repairs
        </h1>
        <p className="text-xl text-gray-400 mb-8 text-center max-w-lg">
          Post what you need. Get competitive bids from local mechanics.
          Pick the best price, rating, and fit.
        </p>
        <div className="flex gap-4">
          <Link
            href="/register"
            className="bg-brand-orange px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="border border-gray-600 px-8 py-3 rounded-lg font-semibold text-lg hover:border-gray-400"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="text-center">
            <div className="text-3xl mb-3">1</div>
            <h3 className="font-bold text-lg mb-2">Post Your Job</h3>
            <p className="text-gray-400 text-sm">
              Describe the issue, upload photos. AI helps structure your post.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">2</div>
            <h3 className="font-bold text-lg mb-2">Get Bids</h3>
            <p className="text-gray-400 text-sm">
              Local mechanics compete with sealed bids and full price breakdowns.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">3</div>
            <h3 className="font-bold text-lg mb-2">Pick & Fix</h3>
            <p className="text-gray-400 text-sm">
              Compare price, ratings, and distance. Choose the best mechanic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
