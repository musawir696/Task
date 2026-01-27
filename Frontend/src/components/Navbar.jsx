import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, PlusCircle, LogOut, Send } from 'lucide-react';

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <Send size={24} />
                    <span>Social Scheduler</span>
                </Link>

                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/posts" className={`nav-link ${isActive('/posts') ? 'active' : ''}`}>
                        <FileText size={18} />
                        <span>All Posts</span>
                    </Link>
                    <Link to="/posts/new" className="btn btn-primary btn-sm">
                        <PlusCircle size={18} />
                        <span>New Post</span>
                    </Link>
                    <button onClick={handleLogout} className="nav-link btn-logout">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <style>{`
                .navbar {
                    background: var(--bg-card);
                    border-bottom: 1px solid var(--border);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    padding: 0.75rem 0;
                }
                .nav-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                    color: var(--primary);
                    font-weight: 700;
                    font-size: 1.25rem;
                }
                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }
                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    color: var(--text-muted);
                    font-weight: 500;
                    font-size: 0.95rem;
                    transition: color 0.2s;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem 0;
                    min-height: 44px;
                }
                .nav-link:hover, .nav-link.active {
                    color: var(--primary);
                }
                .nav-link.active {
                    border-bottom: 2px solid var(--primary);
                }
                .btn-sm {
                    padding: 0.5rem 1rem;
                    font-size: 0.9rem;
                }
                .btn-logout:hover {
                    color: var(--danger);
                }
                
                /* Tablet */
                @media (max-width: 768px) {
                    .nav-container {
                        padding: 0 1rem;
                    }
                    .nav-logo {
                        font-size: 1.1rem;
                    }
                    .nav-links {
                        gap: 1rem;
                    }
                    .nav-link {
                        font-size: 0.9rem;
                    }
                }
                
                /* Mobile */
                @media (max-width: 480px) {
                    .navbar {
                        padding: 0.5rem 0;
                    }
                    .nav-container {
                        padding: 0 0.75rem;
                    }
                    .nav-logo {
                        font-size: 1rem;
                        gap: 0.5rem;
                    }
                    .nav-logo span {
                        display: none;
                    }
                    .nav-links {
                        gap: 0.5rem;
                    }
                    .nav-link span {
                        display: none;
                    }
                    .nav-link {
                        padding: 0.5rem;
                        min-width: 44px;
                        justify-content: center;
                    }
                    .btn-sm {
                        padding: 0.5rem;
                        min-width: 44px;
                    }
                }
                
                /* Small Mobile */
                @media (max-width: 360px) {
                    .nav-links {
                        gap: 0.25rem;
                    }
                    .nav-link, .btn-sm {
                        padding: 0.4rem;
                        min-width: 40px;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
