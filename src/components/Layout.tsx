import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileImage, Settings, Bell, Headphones, Calendar, Users, GraduationCap } from 'lucide-react';
import clsx from 'clsx';
import { LiveSupport } from './LiveSupport';

// Placeholder for permission checking. In a real app, this would come from user context or an auth service.
const hasPermission = (permission: string) => {
    // For demonstration, let's say all permissions are granted.
    // In a real application, you would check the user's roles/permissions.
    return true;
};

const sidebarNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard:view' },
    { path: '/assets', icon: FileImage, label: 'Assets', permission: 'files:view-all' },
    { path: '/reviews', icon: Calendar, label: 'Reviews', permission: 'reviews:view' },
    { path: '/users', icon: Users, label: 'Users', permission: 'users:manage-roles' },
    { path: '/settings', icon: Settings, label: 'Settings', permission: 'settings:view' },
];

const SidebarItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-surface hover:text-text"
            )
        }
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </NavLink>
);

const Layout = () => {
    const [isLiveSupportOpen, setIsLiveSupportOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-text overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-surface/50 backdrop-blur-xl flex flex-col">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg" />
                        <span className="text-xl font-bold tracking-tight">PreFlight<span className="text-primary">Pro</span></span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <SidebarItem to="/assets" icon={FileImage} label="Assets" />
                    <SidebarItem to="/reviews" icon={Calendar} label="Reviews" />
                    <SidebarItem to="/training" icon={GraduationCap} label="Training Center" />
                    <SidebarItem to="/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface/50">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Admin User</p>
                            <p className="text-xs text-muted truncate">admin@print.co</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-background/80 backdrop-blur-sm z-10">
                    <h2 className="text-lg font-semibold">Overview</h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsLiveSupportOpen(true)}
                            className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Headphones size={18} />
                            Request Live Help
                        </button>
                        <div className="w-px h-6 bg-border" />
                        <button className="p-2 text-muted hover:text-text rounded-full hover:bg-surface transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-8">
                    <Outlet />
                </div>
            </main>

            {/* Live Support Modal */}
            {isLiveSupportOpen && (
                <LiveSupport onClose={() => setIsLiveSupportOpen(false)} userName="Admin User" />
            )}
        </div>
    );
};

export default Layout;
