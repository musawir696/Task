import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/Layout.css';


const Layout = () => {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="container main-content fade-in">
                <Outlet />
            </main>


        </div>
    );
};

export default Layout;
