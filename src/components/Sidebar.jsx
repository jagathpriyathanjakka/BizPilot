import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Receipt,
  Users,
  Truck,
  TrendingDown,
  UserCheck,
  BarChart3,
  Bot,
  ShieldCheck,
  Settings,
  Flame,
  Calendar,
  Wrench,
  Copy,
  Armchair,
  Shirt,
  Plane,
  HeartPulse,
  Sprout,
  Footprints,
  Sparkles,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../categories';

export const Sidebar = ({ currentBusiness, className = '' }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const categoryKey = currentBusiness?.category || 'grocery';
  const categoryDef = BUSINESS_CATEGORIES[categoryKey] || BUSINESS_CATEGORIES.grocery;

  // Business-specific specialized nav item
  let specializedNavItem = null;

  switch (categoryKey) {
    case 'food':
      specializedNavItem = { label: 'Live KOTs & Tables', href: '/specialized', icon: Flame, highlight: true };
      break;
    case 'salon':
      specializedNavItem = { label: 'Appointments & Stylists', href: '/specialized', icon: Calendar, highlight: true };
      break;
    case 'electronics':
      specializedNavItem = { label: 'Repair & Care Tickets', href: '/specialized', icon: Wrench, highlight: true };
      break;
    case 'stationery':
      specializedNavItem = { label: 'Print & Bind Jobs', href: '/specialized', icon: Copy, highlight: true };
      break;
    case 'furniture':
      specializedNavItem = { label: 'Custom Orders & Workshop', href: '/specialized', icon: Armchair, highlight: true };
      break;
    case 'laundry':
      specializedNavItem = { label: '7-Stage Laundry Queue', href: '/specialized', icon: Sparkles, highlight: true };
      break;
    case 'travel':
      specializedNavItem = { label: 'Tour Bookings & Itineraries', href: '/specialized', icon: Plane, highlight: true };
      break;
    case 'clothing':
      specializedNavItem = { label: 'Size & Color Matrix', href: '/specialized', icon: Shirt, highlight: true };
      break;
    case 'medical':
      specializedNavItem = { label: 'Rx & Batch Expiry Log', href: '/specialized', icon: HeartPulse, highlight: true };
      break;
    case 'agriculture':
      specializedNavItem = { label: 'Farmer Ledger & Batches', href: '/specialized', icon: Sprout, highlight: true };
      break;
    case 'hardware':
      specializedNavItem = { label: 'Contractor Quotations', href: '/specialized', icon: Wrench, highlight: true };
      break;
    case 'footwear':
      specializedNavItem = { label: 'Shoe Size Breakdown', href: '/specialized', icon: Footprints, highlight: true };
      break;
  }

  const navLinks = [
    { label: 'Overview Dashboard', href: '/', icon: LayoutDashboard },
    {
      label: categoryDef?.productTerminology?.plural || 'Products & Inventory',
      href: '/products',
      icon: Package,
    },
    ...(specializedNavItem ? [specializedNavItem] : []),
    { label: 'Sales & POS Billing', href: '/sales', icon: Receipt },
    { label: 'Customers & CRM', href: '/customers', icon: Users },
    { label: 'Suppliers & Vendors', href: '/suppliers', icon: Truck },
    { label: 'Operating Expenses', href: '/expenses', icon: TrendingDown },
    { label: 'Staff & Roles', href: '/staff', icon: UserCheck },
    { label: 'Analytics & Reports', href: '/reports', icon: BarChart3 },
    { label: 'AI Command Center', href: '/ai', icon: Bot, highlight: true },
    { label: 'Approvals & Audit', href: '/approvals', icon: ShieldCheck },
    { label: 'Settings & 13 Industries', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`w-64 border-r border-slate-800/80 bg-[#070B14]/80 backdrop-blur-md flex flex-col shrink-0 min-h-[calc(100vh-4rem)] ${className}`}
    >
      {/* Category banner badge */}
      <div className="p-3 mx-3 mt-3 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-950/40 to-slate-900/40">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 truncate">
            {categoryDef?.name || 'Workspace'}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{categoryDef?.tagline}</p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/30 to-indigo-600/20 text-white border border-violet-500/40 shadow-glow'
                  : item.highlight
                  ? 'text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-violet-400' : item.highlight ? 'text-cyan-400' : 'text-slate-500'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Tag */}
      <div className="p-4 border-t border-slate-900 text-center">
        <p className="text-[10px] font-mono text-slate-500">BizPilot AI v1.0 • Express + SQLite</p>
      </div>
    </aside>
  );
};

export default Sidebar;
