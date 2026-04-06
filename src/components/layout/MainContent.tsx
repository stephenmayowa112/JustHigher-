import { MainContentProps } from '@/lib/types';

export default function MainContent({ children, className = '' }: MainContentProps) {
  return (
    <div className={`flex-1 min-w-0 overflow-x-hidden lg:pl-88 ${className}`}>
      <main className="flex-1 relative focus:outline-none">
        <div className="py-6 sm:py-8 lg:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Content container with wider max-width for better readability */}
            <div className="w-full">
              <article className="prose-seth">
                {children}
              </article>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
