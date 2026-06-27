'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Package, LayoutDashboard, ShoppingBag, Users } from 'lucide-react';

export default function Sidebar() {
  const { user, clearAuth } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '#dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      show: true,
    },
    {
      name: 'Orders',
      href: '#orders',
      icon: ShoppingBag,
      show: true,
    },
    {
      name: 'Customers',
      href: '#customers',
      icon: Users,
      show: true,
    },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-secondary/20 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-secondary/20">
        <Link href="/products" className="font-serif text-xl tracking-wider text-tertiary">
          INVENIO
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (item.href.startsWith('#')) {
                    e.preventDefault();
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-tertiary bg-neutral/50 border-l border-tertiary'
                    : 'text-secondary hover:text-primary hover:bg-neutral/30'
                }`}
                style={{ borderRadius: '2px' }}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-secondary/20 bg-neutral/20 space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 flex items-center justify-center border border-secondary/40 bg-surface text-tertiary font-serif text-xs font-semibold" style={{ borderRadius: '2px' }}>
              {((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-primary truncate tracking-wide">
                {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
              </p>
              <p className="text-[10px] text-secondary truncate font-mono mt-0.5">{user.email}</p>
              <div className="mt-1.5">
                <span 
                  className={`inline-block text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 border ${
                    user.role === 'ADMIN' 
                      ? 'border-tertiary/40 bg-tertiary/10 text-tertiary' 
                      : 'border-secondary/30 bg-neutral/40 text-secondary'
                  }`} 
                  style={{ borderRadius: '1px' }}
                >
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-secondary hover:text-tertiary transition-colors cursor-pointer border border-secondary/10 hover:border-tertiary/30 bg-surface/50"
          style={{ borderRadius: '2px' }}
        >
          <LogOut className="w-4 h-4 text-secondary hover:text-tertiary" />
          <span className="tracking-wider">SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
}
