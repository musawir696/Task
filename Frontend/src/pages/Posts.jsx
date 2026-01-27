import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
    Search, Filter, Edit3, Trash2, 
    ChevronLeft, ChevronRight, Twitter, Facebook, Instagram, RefreshCw 
} from 'lucide-react';

const Posts = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    
    const page = parseInt(searchParams.get('page')) || 1;
    const filter = searchParams.get('status') || 'all';
    const searchQuery = searchParams.get('search') || '';
    const platformParam = searchParams.get('platforms') || '';
    const startDateParam = searchParams.get('startDate') || '';
    const endDateParam = searchParams.get('endDate') || '';

    const [searchInput, setSearchInput] = useState(searchQuery);
    const [selectedPlatforms, setSelectedPlatforms] = useState(platformParam ? platformParam.split(',') : []);
    const [startDate, setStartDate] = useState(startDateParam);
    const [endDate, setEndDate] = useState(endDateParam);
    const [showFilters, setShowFilters] = useState(false);

    const PLATFORMS = ['Twitter', 'Facebook', 'Instagram', 'LinkedIn'];

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/posts', {
                params: {
                    status: filter === 'all' ? undefined : filter,
                    page,
                    search: searchQuery || undefined,
                    platforms: platformParam || undefined,
                    startDate: startDateParam || undefined,
                    endDate: endDateParam || undefined
                }
            });
            setPosts(res.data.data || []);
            setTotalPages(res.data.pagination?.pages || 1);
        } catch {
            toast.error('Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    }, [filter, page, searchQuery, platformParam, startDateParam, endDateParam]);

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const togglePlatform = (platform) => {
        if (selectedPlatforms.includes(platform)) {
            setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
        } else {
            setSelectedPlatforms([...selectedPlatforms, platform]);
        }
    };

    const applyFilters = () => {
        setSearchParams({ 
            page: 1, 
            status: filter, 
            search: searchInput,
            platforms: selectedPlatforms.length > 0 ? selectedPlatforms.join(',') : '',
            startDate: startDate || '',
            endDate: endDate || ''
        });
    };

    const clearFilters = () => {
        setSearchInput('');
        setSelectedPlatforms([]);
        setStartDate('');
        setEndDate('');
        setSearchParams({ page: 1, status: filter });
    };

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        
        try {
            await api.delete(`/posts/${id}`);
            toast.success('Post deleted');
            fetchPosts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete post');
        }
    };

    const handleFilterChange = (newStatus) => {
        setSearchParams({ page: 1, status: newStatus });
    };

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage, status: filter });
    };

    const getStatusBadge = (status) => {
        return <span className={`badge badge-${status}`}>{status}</span>;
    };

    const getPlatformIcons = (platforms) => {
        return (
            <div className="platform-icons">
                {platforms.includes('Twitter') && <Twitter size={14} className="text-twitter" />}
                {platforms.includes('Facebook') && <Facebook size={14} className="text-facebook" />}
                {platforms.includes('Instagram') && <Instagram size={14} className="text-instagram" />}
            </div>
        );
    };

    return (
        <div className="posts-page">
            <header className="page-header header-with-spacing">
                <div>
                    <h1>Scheduled Posts</h1>
                    <p>Manage and track your social content</p>
                </div>
                <div className="header-actions">
                    <button onClick={fetchPosts} className="btn btn-outline" disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                    <Link to="/posts/new" className="btn btn-primary">New Post</Link>
                </div>
            </header>

            <div className="filter-bar card">
                <div className="filter-group">
                    <Filter size={18} className="text-muted" />
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('all')}
                    >All</button>
                    <button 
                        className={`filter-btn ${filter === 'scheduled' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('scheduled')}
                    >Scheduled</button>
                    <button 
                        className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('published')}
                    >Published</button>
                    <button 
                        className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
                        onClick={() => handleFilterChange('failed')}
                    >Failed</button>
                    
                    <button 
                        className={`filter-btn ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                        title="Advanced Filters"
                    >
                        <Filter size={16} /> Filters
                    </button>
                </div>
                <form onSubmit={handleSearch} className="search-box">
                    <Search size={18} className="text-muted" />
                    <input 
                        type="text" 
                        placeholder="Search content..." 
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </form>
            </div>

            {showFilters && (
                <div className="advanced-filters card fade-in">
                    <div className="filter-row">
                        <div className="filter-column">
                            <label>Platforms</label>
                            <div className="platform-toggles">
                                {PLATFORMS.map(platform => (
                                    <button
                                        key={platform}
                                        className={`platform-toggle ${selectedPlatforms.includes(platform) ? 'selected' : ''}`}
                                        onClick={() => togglePlatform(platform)}
                                    >
                                        {platform}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="filter-column">
                            <label>Date Range</label>
                            <div className="date-inputs">
                                <input 
                                    type="date" 
                                    className="date-input" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)} 
                                    placeholder="Start Date" 
                                />
                                <span className="text-muted">-</span>
                                <input 
                                    type="date" 
                                    className="date-input" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)} 
                                    placeholder="End Date" 
                                />
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button className="btn btn-outline btn-sm" onClick={clearFilters}>Clear</button>
                            <button className="btn btn-primary btn-sm" onClick={applyFilters}>Apply</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="posts-table-container card">
                {loading ? (
                    <div className="table-loading">Loading posts...</div>
                ) : posts.length > 0 ? (
                    <>
                        <table className="posts-table">
                            <thead>
                                <tr>
                                    <th>Content</th>
                                    <th>Platforms</th>
                                    <th>Schedule Date</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map(post => (
                                    <tr key={post._id} className="fade-in">
                                        <td className="content-cell">
                                            <p>{post.content.substring(0, 80)}...</p>
                                        </td>
                                        <td>{getPlatformIcons(post.platforms)}</td>
                                        <td className="date-cell">
                                            {new Date(post.scheduleDate).toLocaleDateString()}
                                            <span>{new Date(post.scheduleDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </td>
                                        <td>{getStatusBadge(post.status)}</td>
                                        <td className="actions-cell">
                                            <div className="actions-wrapper">
                                                {post.status !== 'published' && (
                                                    <Link to={`/posts/edit/${post._id}`} className="action-btn text-blue" title="Edit">
                                                        <Edit3 size={18} />
                                                    </Link>
                                                )}
                                                <button onClick={() => handleDelete(post._id)} className="action-btn text-danger" title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Mobile Card View */}
                        {posts.map(post => (
                            <div key={`card-${post._id}`} className="post-card fade-in">
                                <div className="post-card-content">
                                    <p>{post.content.substring(0, 100)}...</p>
                                </div>
                                <div className="post-card-meta">
                                    <div>{getPlatformIcons(post.platforms)}</div>
                                    <div className="date-cell">
                                        {new Date(post.scheduleDate).toLocaleDateString()}
                                        <span>{new Date(post.scheduleDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div>{getStatusBadge(post.status)}</div>
                                </div>
                                <div className="post-card-actions">
                                    {post.status !== 'published' && (
                                        <Link to={`/posts/edit/${post._id}`} className="action-btn text-blue" title="Edit">
                                            <Edit3 size={18} />
                                        </Link>
                                    )}
                                    <button onClick={() => handleDelete(post._id)} className="action-btn text-danger" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="pagination">
                            <button 
                                disabled={page === 1} 
                                onClick={() => handlePageChange(page - 1)}
                                className="page-btn"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="page-info">Page {page} of {totalPages}</span>
                            <button 
                                disabled={page === totalPages} 
                                onClick={() => handlePageChange(page + 1)}
                                className="page-btn"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="empty-table">
                        <p>No posts found for this filter.</p>
                        <Link to="/posts/new" className="btn-link">Create your first post</Link>
                    </div>
                )}
            </div>

            <style>{`
                .page-header { display: flex; justify-content: space-between; align-items: flex-end; }
                .header-actions { display: flex; gap: 0.75rem; margin-bottom: 5px; }
                .btn-outline { background: white; border: 1px solid var(--border); padding: 0.5rem; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
                
                .filter-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding: 0.75rem 1.5rem;
                }
                .filter-group { display: flex; align-items: center; gap: 0.5rem; }
                .filter-btn {
                    padding: 0.4rem 0.8rem;
                    border-radius: 6px;
                    border: none;
                    background: none;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .filter-btn:hover { background: #f1f5f9; }
                .filter-btn.active { background: var(--primary); color: white; }
                
                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: var(--bg-main);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    border: 1px solid var(--border);
                    max-width: 300px;
                }
                .search-box input { background: none; border: none; outline: none; font-size: 0.9rem; width: 100%; }
                
                .posts-table-container { padding: 0; overflow: hidden; }
                .posts-table { width: 100%; border-collapse: collapse; }
                .posts-table th {
                    text-align: left;
                    padding: 1rem 1.5rem;
                    background: #f8fafc;
                    border-bottom: 1px solid var(--border);
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .posts-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); }
                .content-cell p { font-size: 0.95rem; line-height: 1.4; color: #334155; }
                .platform-icons { display: flex; gap: 0.5rem; color: var(--text-muted); }
                .date-cell { font-size: 0.9rem; font-weight: 500; }
                .date-cell span { display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 400; }
                .text-right { text-align: right; }
                .actions-cell { text-align: right; }
                .actions-wrapper { display: flex; justify-content: flex-end; gap: 0.75rem; }
                .header-with-spacing { margin-bottom: 2rem; }
                .action-btn { 
                    background: none; 
                    border: none; 
                    cursor: pointer; 
                    padding: 0.4rem; 
                    border-radius: 6px; 
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .text-blue { color: #3b82f6; }
                .text-blue:hover { background: #eff6ff; }
                .text-danger { color: #ef4444; }
                .text-danger:hover { background: #fef2f2; }
                
                .pagination {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    padding: 1.5rem;
                }
                .page-btn {
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 0.4rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    transition: all 0.2s;
                }
                .page-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
                .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .page-info { font-size: 0.9rem; font-weight: 500; color: var(--text-muted); }
                
                .table-loading, .empty-table { padding: 4rem; text-align: center; color: var(--text-muted); }
                
                .advanced-filters {
                    margin-bottom: 1.5rem;
                    padding: 1.5rem;
                    background: #f8fafc;
                    border: 1px solid var(--border);
                }
                .filter-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2rem;
                    align-items: flex-end;
                }
                .filter-column {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .filter-column label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .platform-toggles {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                .platform-toggle {
                    padding: 0.35rem 0.75rem;
                    border: 1px solid var(--border);
                    background: white;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .platform-toggle:hover { border-color: var(--primary); }
                .platform-toggle.selected {
                    background: var(--primary);
                    color: white;
                    border-color: var(--primary);
                }
                .date-inputs {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .date-input {
                    padding: 0.4rem 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    font-size: 0.9rem;
                    outline: none;
                }
                .date-input:focus { border-color: var(--primary); }
                .filter-actions {
                    margin-left: auto;
                    display: flex;
                    gap: 0.5rem;
                }
                .btn-sm { font-size: 0.85rem; padding: 0.4rem 0.8rem; }
                
                /* Mobile Card Layout */
                .post-card {
                    display: none;
                    padding: 1rem;
                    border-bottom: 1px solid var(--border);
                }
                .post-card-content {
                    margin-bottom: 0.75rem;
                }
                .post-card-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }
                .post-card-actions {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: flex-end;
                }
                
                /* Tablet */
                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    .filter-bar {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 1rem;
                        padding: 1rem;
                    }
                    .search-box {
                        max-width: none;
                    }
                    .filter-row {
                        gap: 1rem;
                    }
                    .filter-actions {
                        margin-left: 0;
                        width: 100%;
                    }
                    .posts-table th:nth-child(2),
                    .posts-table td:nth-child(2) {
                        display: none;
                    }
                }
                
                /* Mobile */
                @media (max-width: 480px) {
                    .header-with-spacing {
                        margin-bottom: 1.5rem;
                    }
                    .header-actions {
                        width: 100%;
                        justify-content: space-between;
                    }
                    .filter-bar {
                        padding: 0.75rem;
                    }
                    .filter-group {
                        flex-wrap: wrap;
                        gap: 0.35rem;
                    }
                    .filter-btn {
                        padding: 0.35rem 0.65rem;
                        font-size: 0.85rem;
                    }
                    .search-box {
                        padding: 0.6rem 0.85rem;
                    }
                    .advanced-filters {
                        padding: 1rem;
                    }
                    .filter-row {
                        flex-direction: column;
                    }
                    .date-inputs {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .date-input {
                        width: 100%;
                    }
                    
                    /* Hide table, show cards */
                    .posts-table {
                        display: none;
                    }
                    .post-card {
                        display: block;
                    }
                    .pagination {
                        padding: 1rem;
                        gap: 1rem;
                    }
                    .page-btn {
                        min-width: 44px;
                        min-height: 44px;
                        justify-content: center;
                    }
                    .table-loading, .empty-table {
                        padding: 2rem 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Posts;
