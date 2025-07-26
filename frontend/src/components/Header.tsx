interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-6 text-white z-30 relative" style={{ backgroundColor: 'oklch(0.278 0.033 256.848)' }}>
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="TimeSpace Logo" className="w-8 h-8" />
        <h1 className="text-2xl font-bold tracking-wider">TIME SPACE</h1>
      </div>
    </header>
  );
}
