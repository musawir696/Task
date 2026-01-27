import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Mail, Lock, UserPlus, LogIn, Send, User } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password || (!isLogin && !username)) {
            return toast.error('Please fill in all fields');
        }
        
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
                toast.success('Welcome back!');
            } else {
                await register(username, email, password);
                toast.success('Account created successfully!');
            }
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="auth-card card">
                <div className="auth-header">
                    <div className="logo-icon">
                        <Send size={32} color="white" />
                    </div>
                    <h1>Social Scheduler</h1>
                    <p>{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Username</label>
                            <div className="input-with-icon">
                                <User size={18} className="icon" />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="yourname"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="icon" />
                            <input
                                type="email"
                                className="form-control"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="icon" />
                            <input
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? <><LogIn size={18} /> Login</> : <><UserPlus size={18} /> Register</>)}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button className="btn-link" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Register now' : 'Sign in here'}
                        </button>
                    </p>
                </div>
            </div>

            <style>{`
                .auth-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
                    padding: 1rem;
                }
                .auth-card {
                    width: 100%;
                    max-width: 420px;
                    padding: 2.5rem;
                }
                .auth-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .logo-icon {
                    background: var(--primary);
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
                }
                .auth-header h1 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                    color: #1e293b;
                }
                .auth-header p {
                    color: var(--text-muted);
                }
                .input-with-icon {
                    position: relative;
                }
                .input-with-icon .icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }
                .input-with-icon input {
                    padding-left: 40px;
                }
                .w-full { width: 100%; }
                .auth-footer {
                    margin-top: 1.5rem;
                    text-align: center;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                }
                
                /* Mobile */
                @media (max-width: 480px) {
                    .auth-container {
                        padding: 0.75rem;
                    }
                    .auth-card {
                        padding: 2rem 1.5rem;
                    }
                    .auth-header h1 {
                        font-size: 1.5rem;
                    }
                    .logo-icon {
                        width: 56px;
                        height: 56px;
                        margin-bottom: 1rem;
                    }
                    .auth-header {
                        margin-bottom: 1.5rem;
                    }
                }
                
                /* Small Mobile */
                @media (max-width: 360px) {
                    .auth-card {
                        padding: 1.5rem 1rem;
                    }
                    .auth-header h1 {
                        font-size: 1.35rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Auth;
