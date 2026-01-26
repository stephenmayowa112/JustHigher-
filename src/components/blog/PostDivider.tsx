interface PostDividerProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'bold';
}

export default function PostDivider({ className = '', variant = 'default' }: PostDividerProps) {
  const baseClasses = 'relative my-12';
  const variantClasses = {
    default: 'border-t border-gray-200',
    subtle: 'border-t border-gray-100',
    bold: 'border-t-2 border-gray-300'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {/* Seth Godin-style asterisk divider */}
      <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-white px-4">
        <span className="text-gray-400 text-sm font-light tracking-widest">
          ***
        </span>
      </div>
    </div>
  );
}