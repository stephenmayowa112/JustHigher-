import { MainContentProps } from '@/lib/types';

export default function MainContent({ children, className = '' }: MainContentProps) {
  return (
    <div className={`flex-1 w-full overflow-hidden ${className}`}>
      <main className="flex-1 relative overflow-y-auto focus:outline-none">
        <div className="py-6 sm:py-8 lg:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Content container with Seth Godin-inspired constraints */}
            <div className="max-w-prose mx-auto">
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