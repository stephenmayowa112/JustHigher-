'use client';

import { useState } from 'react';
import { NewsletterFormProps } from '@/lib/types';
import { validateEmail } from '@/lib/validation';

export default function NewsletterForm({ onSubscribe }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    // Client-side validation
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setStatus('error');
      setMessage(validation.error || 'Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      // Call the secure API endpoint
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          source: 'website',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Successfully subscribed! Thank you for joining.');
        setEmail('');
        
        // Call the callback if provided (for analytics)
        if (onSubscribe) {
          await onSubscribe(email);
        }
      } else {
        setStatus('error');
        
        // Handle specific error codes
        switch (data.code) {
          case 'ALREADY_SUBSCRIBED':
            setMessage('This email is already subscribed to our newsletter.');
            break;
          case 'RATE_LIMIT_EXCEEDED':
            setMessage('Too many attempts. Please try again later.');
            break;
          case 'VALIDATION_ERROR':
            setMessage(data.details?.[0]?.message || 'Please enter a valid email address.');
            break;
          case 'EMAIL_BLOCKED':
            setMessage('This email address is not allowed.');
            break;
          default:
            setMessage(data.error || 'Failed to subscribe. Please try again.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
      console.error('Newsletter subscription error:', error);
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setMessage('');
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === 'error') resetStatus();
          }}
          placeholder="Enter your email"
          className={`w-full px-3 py-2 border rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            status === 'error' 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
          }`}
          disabled={status === 'loading' || status === 'success'}
          aria-label="Email address for newsletter"
          aria-describedby={message ? 'newsletter-message' : undefined}
        />
        
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className={`w-full px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
            status === 'success'
              ? 'bg-green-600 text-white cursor-default'
              : status === 'loading'
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500'
          }`}
        >
          {status === 'loading' && (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </span>
          )}
          {status === 'success' && (
            <span className="inline-flex items-center">
              <svg className="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Subscribed!
            </span>
          )}
          {status !== 'loading' && status !== 'success' && 'Subscribe'}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <div 
          id="newsletter-message"
          className={`text-sm ${
            status === 'success' 
              ? 'text-green-600' 
              : status === 'error' 
              ? 'text-red-600' 
              : 'text-gray-600'
          }`}
          role={status === 'error' ? 'alert' : undefined}
          aria-live="polite"
        >
          {message}
        </div>
      )}

      {/* Reset button for success state */}
      {status === 'success' && (
        <button
          onClick={() => {
            setStatus('idle');
            setMessage('');
          }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Subscribe another email
        </button>
      )}
    </div>
  );
}