'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = async () => {
      const id = searchParams.get('id');

      if (!id) {
        setStatus('error');
        setMessage('Invalid unsubscribe link');
        return;
      }

      try {
        const response = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Successfully unsubscribed from Daily AI News');
        } else {
          setStatus('error');
          setMessage('Failed to unsubscribe. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred. Please try again.');
      }
    };

    unsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Unsubscribing...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Unsubscribed
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">
              You will no longer receive daily AI news emails.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-gray-600">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Unsubscribe() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
