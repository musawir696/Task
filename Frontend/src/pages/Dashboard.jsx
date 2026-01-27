import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
    Users, FileCheck, Calendar, BarChart3, 
    ArrowRight, Twitter, Facebook, Instagram 
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, upcomingRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/upcoming')
                ]);
                setStats(statsRes.data.data);
                setUpcoming(upcomingRes.data.data);
            } catch (err) {
                console.error(err);
                toast.error('Failed to load dashboard data'); // Reverted to original message as 'Failed to load post' is out of context for dashboard data
                // navigate('/posts'); // 'navigate' is not defined in this component, so it's removed.
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="loading-screen">Loading dashboard...</div>;

    const chartData = {
        labels: ['Twitter', 'Facebook', 'Instagram'],
        datasets: [
            {
                label: 'Posts per Platform',
                data: [
                    stats.platformStats.Twitter,
                    stats.platformStats.Facebook,
                    stats.platformStats.Instagram
                ],
                backgroundColor: [
                    'rgba(29, 161, 242, 0.7)',
                    'rgba(66, 103, 178, 0.7)',
                    'rgba(225, 48, 108, 0.7)'
                ],
                borderRadius: 8,
            },
        ],
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'Twitter': return <Twitter size={16} className="text-twitter" />;
            case 'Facebook': return <Facebook size={16} className="text-facebook" />;
            case 'Instagram': return <Instagram size={16} className="text-instagram" />;
            default: return null;
        }
    };

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <div className="page-header-text">
                    <h1>Dashboard</h1>
                    <p>Good to see you again!</p>
                </div>
                <Link to="/posts/new" className="btn btn-primary">
                    <PlusCircle size={20} /> New Post
                </Link>
            </header>

            <div className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-icon bg-blue"><FileCheck size={24} /></div>
                    <div className="stat-info">
                        <h3>Total Posts</h3>
                        <p className="stat-value">{stats.totalPosts}</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon bg-amber"><Calendar size={24} /></div>
                    <div className="stat-info">
                        <h3>Scheduled</h3>
                        <p className="stat-value">{stats.scheduledPosts}</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon bg-green"><BarChart3 size={24} /></div>
                    <div className="stat-info">
                        <h3>Published</h3>
                        <p className="stat-value">{stats.publishedPosts}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="chart-section card">
                    <h3>Platform Distribution</h3>
                    <div className="chart-container">
                        <Bar 
                            data={chartData} 
                            options={{ 
                                responsive: true, 
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } }
                            }} 
                        />
                    </div>
                </div>

                <div className="upcoming-section card">
                    <div className="card-header">
                        <h3>Upcoming Posts</h3>
                        <Link to="/posts" className="btn-link">View all <ArrowRight size={16} /></Link>
                    </div>
                    <div className="upcoming-list">
                        {upcoming.length > 0 ? upcoming.map(post => (
                            <div key={post._id} className="upcoming-item">
                                <div className="post-time">
                                    {new Date(post.scheduleDate).toLocaleDateString()}
                                    <span>{new Date(post.scheduleDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div className="post-content-preview">
                                    <p>{post.content.substring(0, 50)}...</p>
                                    <div className="post-platforms">
                                        {post.platforms.map(p => (
                                            <span key={p} title={p}>{getPlatformIcon(p)}</span>
                                        ))}
                                    </div>
                                </div>
                                <ArrowRight className="item-arrow" size={16} />
                            </div>
                        )) : (
                            <div className="empty-state">
                                <p>No upcoming posts scheduled.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .dashboard-page {
                    width: 100%;
                    max-width: 100%;
                    overflow-x: hidden;
                }
                
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    width: 100%;
                }
                .page-header-text {
                    flex: 1;
                    min-width: 0;
                }
                .page-header h1 { 
                    font-size: 2rem;
                    margin: 0;
                    overflow-wrap: break-word;
                }
                .page-header p { 
                    color: var(--text-muted);
                    margin: 0;
                }
                
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                    width: 100%;
                }
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    min-width: 0;
                }
                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .stat-info {
                    min-width: 0;
                    flex: 1;
                }
                .bg-blue { background: #eff6ff; color: #2563eb; }
                .bg-amber { background: #fffbeb; color: #d97706; }
                .bg-green { background: #f0fdf4; color: #166534; }
                .stat-info h3 { 
                    font-size: 0.9rem; 
                    color: var(--text-muted); 
                    margin-bottom: 0.25rem;
                    overflow-wrap: break-word;
                }
                .stat-value { 
                    font-size: 1.5rem; 
                    font-weight: 700;
                    overflow-wrap: break-word;
                }
                
                .dashboard-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    width: 100%;
                }
                .chart-section {
                    width: 100%;
                    max-width: 100%;
                    overflow: hidden;
                }
                .chart-container { 
                    height: 300px; 
                    margin-top: 1rem;
                    width: 100%;
                    max-width: 100%;
                    position: relative;
                }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                
                .upcoming-list { display: flex; flex-direction: column; gap: 1rem; }
                .upcoming-item {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1rem;
                    border-radius: 8px;
                    background: var(--bg-main);
                    transition: transform 0.2s;
                    cursor: pointer;
                }
                .upcoming-item:hover { transform: translateX(5px); }
                .post-time {
                    font-size: 0.85rem;
                    font-weight: 600;
                    min-width: 80px;
                    display: flex;
                    flex-direction: column;
                }
                .post-time span { color: var(--text-muted); font-weight: 400; font-size: 0.75rem; }
                .post-content-preview { flex: 1; min-width: 0; }
                .post-content-preview p { 
                    font-size: 0.9rem; 
                    margin-bottom: 0.25rem; 
                    color: #334155;
                    overflow-wrap: break-word;
                }
                .post-platforms { display: flex; gap: 0.5rem; }
                .text-twitter { color: #1da1f2; }
                .text-facebook { color: #4267b2; }
                .text-instagram { color: #e1306c; }
                .item-arrow { color: var(--border); flex-shrink: 0; }
                .empty-state { text-align: center; color: var(--text-muted); padding: 2rem 0; }

                /* Tablet */
                @media (max-width: 992px) {
                    .dashboard-content { grid-template-columns: 1fr; }
                }
                
                /* Mobile */
                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    .page-header h1 {
                        font-size: 1.5rem;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                    .stat-card {
                        gap: 1rem;
                    }
                    .stat-icon {
                        width: 48px;
                        height: 48px;
                    }
                    .chart-container {
                        height: 250px;
                    }
                }
                
                @media (max-width: 480px) {
                    .page-header {
                        margin-bottom: 1.5rem;
                    }
                    .page-header h1 {
                        font-size: 1.35rem;
                    }
                    .page-header p {
                        font-size: 0.9rem;
                    }
                    .stats-grid {
                        margin-bottom: 1.5rem;
                        grid-template-columns: 1fr;
                    }
                    .stat-card {
                        width: 100%;
                        max-width: 100%;
                    }
                    .stat-icon {
                        width: 44px;
                        height: 44px;
                    }
                    .stat-info h3 {
                        font-size: 0.8rem;
                    }
                    .stat-value {
                        font-size: 1.25rem;
                    }
                    .dashboard-content {
                        gap: 1rem;
                    }
                    .chart-section {
                        display: none;
                    }
                    .upcoming-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.75rem;
                        padding: 0.75rem;
                    }
                    .post-time {
                        min-width: auto;
                    }
                    .item-arrow {
                        display: none;
                    }
                }
                
                /* Very Small Mobile */
                @media (max-width: 360px) {
                    .page-header h1 {
                        font-size: 1.25rem;
                    }
                    .stat-value {
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </div>
    );
};

const PlusCircle = ({ size, ...props }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
);

export default Dashboard;
