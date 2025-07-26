interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-6 bg-gray-900 text-white z-30 relative">
      <h1 className="text-2xl font-bold tracking-wider">TIME SPACE</h1>
    </header>
  );
}
