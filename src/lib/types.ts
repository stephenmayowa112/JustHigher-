// Database types for the minimalist blog platform

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  tags: string[];
  meta_description?: string;
  reading_time?: number;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  active: boolean;
  source: string;
}

// Component prop types
export interface PostCardProps {
  post: Post;
  showDivider?: boolean;
}

export interface NewsletterFormProps {
  onSubscribe: (email: string) => Promise<void>;
}

export interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export interface SidebarProps {
  className?: string;
}

export interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

// API response types
export interface NewsletterResponse {
  success: boolean;
  message: string;
}

export interface SearchResponse {
  posts: Post[];
  total: number;
}