import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="container main-content fade-in">
                <Outlet />
            </main>

            <style>{`
                .app-layout {
                    min-height: 100vh;
                    background-color: var(--bg-main);
                }
                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem 1.5rem;
                }
                .main-content {
                    min-height: calc(100vh - 70px);
                }
            `}</style>
        </div>
    );
};

export default Layout;
