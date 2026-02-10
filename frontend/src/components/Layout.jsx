import React from 'react';
// This replaces the imports
import { LayoutDashboard, Users, Home, ClipboardList, Calculator } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon: Icon, label }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`nav-item ${isActive ? 'active' : ''}`}
        >
            <Icon size={20} />
            <span>{label}</span>
        </Link>
    );
};

export default function Layout({ children }) {
    return (
        <div className="app-container">
            {/* Main Content */}
            <main className="main-content" style={{ marginLeft: 0, width: '100%' }}>
                {children}
            </main>
        </div>
    );
}
