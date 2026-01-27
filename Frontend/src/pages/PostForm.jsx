import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { Save, X, Calendar, Type, Globe, Twitter, Facebook, Instagram, Image as ImageIcon } from 'lucide-react';

const PostForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);

    const [formData, setFormData] = useState({
        content: '',
        platforms: [],
        scheduleDate: '',
        imageUrl: ''
    });

    useEffect(() => {
        if (id) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        try {
            const res = await api.get(`/posts/${id}`);
            const post = res.data.data;
            // Format date for datetime-local input
            const date = new Date(post.scheduleDate);
            const formattedDate = date.toISOString().slice(0, 16);
            
            setFormData({
                content: post.content,
                platforms: post.platforms,
                scheduleDate: formattedDate,
                imageUrl: post.imageUrl || ''
            });
        } catch (err) {
            toast.error('Failed to load post');
            navigate('/posts');
        } finally {
            setFetching(false);
        }
    };

    const handlePlatformToggle = (platform) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platform)
                ? prev.platforms.filter(p => p !== platform)
                : [...prev.platforms, platform]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.content) return toast.error('Content is required');
        if (formData.content.length > 500) return toast.error('Content exceeds 500 chars');
        if (formData.platforms.length === 0) return toast.error('Select at least one platform');
        if (!formData.scheduleDate) return toast.error('Schedule date is required');
        
        const scheduleDate = new Date(formData.scheduleDate);
        if (scheduleDate <= new Date()) {
            return toast.error('Schedule date must be in the future');
        }

        setLoading(true);
        try {
            if (id) {
                await api.put(`/posts/${id}`, formData);
                toast.success('Post updated!');
            } else {
                await api.post('/posts', formData);
                toast.success('Post scheduled!');
            }
            navigate('/posts');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save post');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="loading-screen">Loading post details...</div>;

    const platforms = [
        { name: 'Twitter', icon: <Twitter size={18} />, color: '#1da1f2' },
        { name: 'Facebook', icon: <Facebook size={18} />, color: '#4267b2' },
        { name: 'Instagram', icon: <Instagram size={18} />, color: '#e1306c' }
    ];

    return (
        <div className="post-form-page fade-in">
            <header className="page-header">
                <div>
                    <h1>{id ? 'Edit Post' : 'Schedule New Post'}</h1>
                    <p>{id ? 'Update your existing post' : 'Create content for your social media'}</p>
                </div>
            </header>

            <div className="form-container card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><Type size={16} /> Content (max 500 characters)</label>
                        <textarea
                            className="form-control text-area"
                            rows="5"
                            placeholder="What's on your mind?..."
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                        ></textarea>
                        <div className="char-count">
                            {formData.content.length}/500
                        </div>
                    </div>

                    <div className="form-group">
                        <label><Globe size={16} /> Select Platforms</label>
                        <div className="platform-grid">
                            {platforms.map(p => (
                                <button
                                    key={p.name}
                                    type="button"
                                    className={`platform-btn ${formData.platforms.includes(p.name) ? 'active' : ''}`}
                                    onClick={() => handlePlatformToggle(p.name)}
                                >
                                    <span className="icon" style={{color: formData.platforms.includes(p.name) ? 'white' : p.color}}>
                                        {p.icon}
                                    </span>
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label><Calendar size={16} /> Schedule Date & Time</label>
                            <input
                                type="datetime-local"
                                className="form-control"
                                value={formData.scheduleDate}
                                onChange={(e) => setFormData({...formData, scheduleDate: e.target.value})}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>

                        <div className="form-group">
                            <label><ImageIcon size={16} /> Image URL (Optional)</label>
                            <input
                                type="url"
                                className="form-control"
                                placeholder="https://example.com/image.jpg"
                                value={formData.imageUrl}
                                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            />
                        </div>
                    </div>

                    {formData.imageUrl && (
                        <div className="image-preview card">
                            <img src={formData.imageUrl} alt="Preview" onError={(e) => e.target.style.display='none'} />
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/posts')} className="btn btn-outline" disabled={loading}>
                            <X size={18} /> Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : <><Save size={18} /> {id ? 'Update Post' : 'Schedule Post'}</>}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                .form-container { max-width: 800px; margin: 0 auto; padding: 2.5rem; }
                .text-area { resize: vertical; padding: 1rem; }
                .char-count { text-align: right; font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }
                
                .platform-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
                .platform-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .platform-btn:hover { border-color: var(--primary); background: #f8fafc; }
                .platform-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
                .platform-btn.active .icon { color: white !important; }
                
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem; }
                .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
                
                .image-preview { margin-top: 1rem; padding: 0.5rem; max-height: 200px; display: flex; justify-content: center; overflow: hidden; }
                .image-preview img { max-width: 100%; object-fit: cover; border-radius: 4px; }
                
                label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600 !important; color: #334155 !important; }

                @media (max-width: 768px) {
                    .form-row { grid-template-columns: 1fr; }
                    .platform-grid { grid-template-columns: 1fr; }
                    .form-container { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default PostForm;
