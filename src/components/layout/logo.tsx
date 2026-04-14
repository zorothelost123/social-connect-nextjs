type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SocialConnect logo"
    >
      <defs>
        <linearGradient id="social-gradient" x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path
        d="M18 20C18 15.6 21.6 12 26 12H38C42.4 12 46 15.6 46 20C46 24.4 42.4 28 38 28H26C21.6 28 18 31.6 18 36C18 40.4 21.6 44 26 44H38C42.4 44 46 40.4 46 36"
        stroke="url(#social-gradient)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="18" cy="20" r="4" fill="#6366f1" />
      <circle cx="46" cy="36" r="4" fill="#22d3ee" />
    </svg>
  );
}
