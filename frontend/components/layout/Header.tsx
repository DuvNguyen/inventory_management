'use client';

import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname.startsWith('/products/new')) return 'ADD PRODUCT';
    if (pathname.includes('/edit')) return 'EDIT PRODUCT';
    if (pathname.startsWith('/products/upload')) return 'IMPORT CSV';
    return 'PRODUCT INVENTORY';
  };

  return (
    <header className="h-16 border-b border-secondary/20 bg-surface flex items-center justify-between px-8 sticky top-0 z-10">
      <h1 className="font-serif text-lg tracking-wider text-primary">
        {getTitle()}
      </h1>
      
      <div className="flex items-center gap-4">
        <span className="text-[10px] text-secondary tracking-widest uppercase font-semibold">
          SYSTEM ONLINE
        </span>
        <div className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse"></div>
      </div>
    </header>
  );
}
