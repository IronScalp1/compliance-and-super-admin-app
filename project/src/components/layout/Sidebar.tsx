import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Home, Users, FileText, BookTemplate as Template, BarChart3, Settings, CreditCard, Shield, Database, Activity, Building2, Crown } from 'lucide-react';

const agencyNavItems = [
  { icon: Home, label: 'Dashboard', href: '/app' },
  { icon: Users, label: 'Carers', href: '/app/carers' },
  { icon: FileText, label: 'Documents', href: '/app/documents' },
  { icon: Template, label: 'Templates', href: '/app/templates' },
  { icon: BarChart3, label: 'Reports', href: '/app/reports' },
  { icon: Settings, label: 'Settings', href: '/app/settings' },
  { icon: CreditCard, label: 'Billing', href: '/app/billing' },
];

const superAdminNavItems = [
  { icon: Building2, label: 'Agencies', href: '/super/agencies' },
  { icon: CreditCard, label: 'Subscriptions', href: '/super/subscriptions' },
  { icon: Template, label: 'Templates', href: '/super/templates' },
  { icon: Shield, label: 'Audit Logs', href: '/super/audit' },
  { icon: Activity, label: 'Health', href: '/super/health' },
];

export function Sidebar() {
  const { user, impersonation } = useAuth();
  const location = useLocation();
  
  const isSuperAdmin = user?.is_super_admin && !impersonation.is_impersonating;
  const navItems = isSuperAdmin ? superAdminNavItems : agencyNavItems;
  const basePath = isSuperAdmin ? '/super' : '/app';

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <img 
            src="/Black and White.png" 
            alt="Fellow Carer" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="font-bold text-lg text-[#0A0A0A]">Fellow Carer</h1>
            {isSuperAdmin && (
              <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                <Crown className="w-3 h-3" />
                HQ Control Panel
              </p>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
              (item.href === basePath && location.pathname === basePath);

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}