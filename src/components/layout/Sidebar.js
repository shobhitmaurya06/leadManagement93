import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Plug
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen }) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'bg-card border-r border-border transition-all duration-300 flex flex-col',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border px-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">L</span>
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-foreground font-semibold text-base leading-tight">LeadFlow</span>
              <span className="text-muted-foreground text-xs">Management</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isOpen && 'mr-3')} />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-border">
          <div className="bg-primary-light rounded-lg p-3">
            <p className="text-xs font-medium text-primary mb-1">Need Help?</p>
            <p className="text-xs text-muted-foreground">Check our documentation</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
