import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-center space-y-8 py-16">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Post Not Found
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          The blog post you're looking for doesn't exist or may have been moved.
        </p>
      </div>
      
      <div className="space-y-4">
        <Link 
          href="/"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          ← Back to Home
        </Link>
        
        <div className="text-sm text-gray-500">
          <p>Or try searching for what you're looking for in the sidebar.</p>
        </div>
      </div>
    </div>
  );
}