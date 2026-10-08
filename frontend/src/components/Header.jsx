function Header() {
  return (
    <header className="border-b border-[#e2e8e1] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-10">
        <a
          className="flex items-center gap-3 text-inherit no-underline"
          href="/"
          aria-label="Wayline Trip Planner home"
        >
          <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#244b37] text-white">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-[19px]"
            >
              <path
                d="M5 18.5 9.1 5.7a1 1 0 0 1 1.9.1l2.1 6.6a1 1 0 0 0 1.8.2L19 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="5" cy="18.5" r="1.5" fill="currentColor" />
              <circle cx="19" cy="6" r="1.5" fill="currentColor" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-[0.01em] text-[#26352b]">
            Wayline
          </span>
          <span className="hidden h-5 border-l border-[#e2e8e1] sm:block" />
          <span className="hidden text-sm text-[#738076] sm:block">
            Trip Planner
          </span>
        </a>
      </div>
    </header>
  );
}

export default Header;
