import Link from 'next/link';

export function FooterBranding() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8 mt-auto w-full text-muted-foreground">
      <p className="text-sm">Built and owned by <span className="font-semibold text-foreground">Fundz Technology</span></p>
      
      <div className="flex items-center space-x-6">
        {/* TikTok */}
        <Link href="https://tiktok.com/@fundztechnology" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="TikTok">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
          </svg>
        </Link>
        
        {/* X (Twitter) */}
        <Link href="https://x.com/fundztechnology" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="X (Twitter)">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
          </svg>
        </Link>
        
        {/* Instagram */}
        <Link href="https://instagram.com/fundztechnology" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="Instagram">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
