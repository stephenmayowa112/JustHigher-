'use client';

import { usePathname } from 'next/navigation';
import { MainContentProps } from '@/lib/types';

export default function MainContent({ children, className = '' }: MainContentProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // On admin pages, don't add sidebar padding and use full width
  if (isAdminPage) {
    return (
      <div className={`flex-1 w-full ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`flex-1 w-full overflow-hidden lg:pl-88 ${className}`}>
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
