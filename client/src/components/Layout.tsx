import React from 'react';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
    showHeader?: boolean;
    className?: string;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    showHeader = true,
    className = ''
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}></div>
            </div>

            {showHeader && <Header />}
            <main className={`relative z-10 ${showHeader ? 'pt-0' : ''} ${className}`}>
                {children}
            </main>
        </div>
    );
}; export default Layout;
