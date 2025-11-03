'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Successfully subscribed! Check your email for confirmation.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Daily AI News
            </h1>
            <p className="text-xl text-purple-100">
              Get the latest AI news delivered to your inbox every morning
            </p>
          </div>

          {/* Subscription Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Subscribe for Free
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of AI enthusiasts getting daily updates on the latest developments in artificial intelligence.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
              </button>
            </form>

            {message && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  status === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 text-white">
            <div className="text-center">
              <div className="text-4xl mb-2">📰</div>
              <h3 className="font-semibold mb-2">Curated Content</h3>
              <p className="text-purple-100 text-sm">
                Top AI news from trusted sources
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🤖</div>
              <h3 className="font-semibold mb-2">AI Summaries</h3>
              <p className="text-purple-100 text-sm">
                Gemini-powered article summaries
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📧</div>
              <h3 className="font-semibold mb-2">Daily Delivery</h3>
              <p className="text-purple-100 text-sm">
                Fresh news every morning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
