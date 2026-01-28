import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { 
    Search, Filter, Edit3, Trash2, 
    ChevronLeft, ChevronRight, Twitter, Facebook, Instagram, RefreshCw 
} from 'lucide-react';
import '../styles/Posts.css';


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


        </div>
    );
};

export default Posts;
