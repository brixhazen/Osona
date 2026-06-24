export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#83C0DF" />
      <rect x="11" y="11" width="18" height="18" rx="5" fill="#83C0DF" fillOpacity="0.55" />
    </svg>
  );
}

export function LogoLockup() {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display font-semibold tracking-tight text-[15px]">Haven OS</span>
    </div>
  );
}