import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-indigo-950 to-brand-dark" />
        <div className="relative flex flex-col items-center justify-center px-6 py-20 md:py-32">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-brand-teal rounded-full animate-pulse" />
            Now serving South Florida
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-center leading-tight">
            <span className="text-brand-orange">Stop Overpaying</span>
            <br />
            for Car Repairs
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8 text-center max-w-xl">
            Post what your car needs. Local mechanics compete to give you the best price. You pick the winner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="bg-brand-orange px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/browse"
              className="border border-gray-600 px-8 py-3 rounded-lg font-semibold text-lg hover:border-gray-400 text-center"
            >
              Browse Mechanics
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white text-gray-900 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-500 text-center mb-12 max-w-lg mx-auto">
            Three simple steps to get your car fixed at the best price
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-100 text-brand-orange rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-bold text-lg mb-2">Post Your Job</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Tell us what your car needs — select your vehicle, pick a category, describe the problem. Takes under 2 minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-teal-100 text-brand-teal rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-bold text-lg mb-2">Get Competitive Bids</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Local mechanics see your job and submit sealed bids with full price breakdowns — parts, labor, and fees. No surprises.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-bold text-lg mb-2">Pick & Fix</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Compare bids side by side. Check ratings, reviews, and certifications. Message mechanics with questions. Accept the best offer.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* For Car Owners vs Mechanics */}
      <div className="bg-gray-50 text-gray-900 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Built for Both Sides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border p-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl mb-4">🚗</div>
              <h3 className="text-xl font-bold mb-3">For Car Owners</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-brand-orange font-bold">&#10003;</span> Post a job in under 2 minutes</li>
                <li className="flex gap-2"><span className="text-brand-orange font-bold">&#10003;</span> Get multiple competitive bids</li>
                <li className="flex gap-2"><span className="text-brand-orange font-bold">&#10003;</span> See full price breakdowns — no hidden fees</li>
                <li className="flex gap-2"><span className="text-brand-orange font-bold">&#10003;</span> Choose mobile mechanics or shops</li>
                <li className="flex gap-2"><span className="text-brand-orange font-bold">&#10003;</span> Read reviews from real customers</li>
                <li className="flex gap-2"><span className="text-brand-orange font-bold">&#10003;</span> Message mechanics before deciding</li>
                <li className="flex gap-2"><span className="text-brand-orange font-bold">&#10003;</span> Always 100% free</li>
              </ul>
              <Link href="/register" className="block mt-6 bg-brand-orange text-white text-center py-3 rounded-lg font-semibold hover:opacity-90">
                Post a Job Free
              </Link>
            </div>
            <div className="bg-white rounded-2xl border p-8">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-xl mb-4">🔧</div>
              <h3 className="text-xl font-bold mb-3">For Mechanics</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2"><span className="text-brand-teal font-bold">&#10003;</span> Find local jobs matching your skills</li>
                <li className="flex gap-2"><span className="text-brand-teal font-bold">&#10003;</span> Bid on jobs with detailed quotes</li>
                <li className="flex gap-2"><span className="text-brand-teal font-bold">&#10003;</span> Build your profile and reputation</li>
                <li className="flex gap-2"><span className="text-brand-teal font-bold">&#10003;</span> Get verified for more trust</li>
                <li className="flex gap-2"><span className="text-brand-teal font-bold">&#10003;</span> Grow your customer base</li>
                <li className="flex gap-2"><span className="text-brand-teal font-bold">&#10003;</span> Message car owners directly</li>
                <li className="flex gap-2"><span className="text-brand-teal font-bold">&#10003;</span> Free to get started</li>
              </ul>
              <Link href="/register" className="block mt-6 bg-brand-teal text-white text-center py-3 rounded-lg font-semibold hover:opacity-90">
                Join as a Mechanic
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why WrenchHub */}
      <div className="bg-white text-gray-900 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why WrenchHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-5 rounded-xl bg-gray-50">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="font-bold mb-1">Save Money</h3>
                <p className="text-sm text-gray-500">Mechanics compete for your business. That means better prices for you.</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl bg-gray-50">
              <div className="text-2xl">🔍</div>
              <div>
                <h3 className="font-bold mb-1">Total Transparency</h3>
                <p className="text-sm text-gray-500">Every bid includes itemized parts, labor hours, and fees. No surprises.</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl bg-gray-50">
              <div className="text-2xl">⭐</div>
              <div>
                <h3 className="font-bold mb-1">Trusted Mechanics</h3>
                <p className="text-sm text-gray-500">Verified profiles, real reviews, and certifications you can trust.</p>
              </div>
            </div>
            <div className="flex gap-4 p-5 rounded-xl bg-gray-50">
              <div className="text-2xl">🏠</div>
              <div>
                <h3 className="font-bold mb-1">Mobile or Shop</h3>
                <p className="text-sm text-gray-500">Choose a mobile mechanic who comes to you, or bring your car to a shop.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-orange to-orange-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-white/80 mb-8">Join WrenchHub today. It&apos;s free for car owners — always.</p>
          <Link href="/register" className="inline-block bg-white text-brand-orange px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-brand-dark py-8 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="text-xl font-extrabold mb-2">
            <span className="text-brand-orange">Wrench</span>
            <span className="text-brand-teal">Hub</span>
          </div>
          <p className="text-gray-500 text-sm">The smarter way to get your car fixed.</p>
          <p className="text-gray-600 text-xs mt-4">Serving Miami-Dade, Broward, and West Palm Beach</p>
        </div>
      </div>
    </div>
  );
}
