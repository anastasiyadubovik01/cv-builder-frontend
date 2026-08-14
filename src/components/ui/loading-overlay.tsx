export function LoadingOverlay() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/60"
      role="status"
      aria-label="Loading"
    >
      <svg
        className="size-24 animate-spin"
        width="96"
        height="96"
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          opacity="0.3"
          d="M48 84C67.8823 84 84 67.8823 84 48C84 28.1177 67.8823 12 48 12C28.1177 12 12 28.1177 12 48C12 67.8823 28.1177 84 48 84Z"
          stroke="#F5F5F7"
          strokeWidth="8"
        />

        <path
          d="M48 12C57.5478 12 66.7045 15.7928 73.4558 22.5442C80.2072 29.2955 84 38.4522 84 48"
          stroke="#C63031"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
