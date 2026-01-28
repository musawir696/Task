import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, PlusCircle, LogOut, Send } from 'lucide-react';
import '../styles/Navbar.css';


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
                    <Link to="/posts/new" className="btn btn-primary btn-sm-nav">

                        <PlusCircle size={18} />
                        <span>New Post</span>
                    </Link>
                    <button onClick={handleLogout} className="nav-link btn-logout">
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>


        </nav>
    );
};

export default Navbar;
