interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-6 text-white z-30 relative bg-primary-800">
      <div className="flex items-center gap-3">
        <img src="/logo.svg" alt="TimeSpace Logo" className="w-8 h-8" />
        <h1 className="text-3xl font-bold tracking-wider">TIME SPACE</h1>
      </div>
    </header>
  );
}
