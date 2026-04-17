import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { doLoginSuccess } from '../../redux/actions/authAction';
import { loginUserApi } from '../../services/authService';
import { toast } from 'react-toastify';
import './Auth.scss';

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [valueLogin, setValueLogin] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!valueLogin || !password) {
            toast.error("Please enter your account and password!");
            return;
        }

        setIsLoading(true);
        try {
            let res = await loginUserApi(valueLogin, password);
            if (res && res.EC === 0) {
                dispatch(doLoginSuccess(res.DT));
                toast.success("Welcome back to Royal Restaurant!");
                navigate('/');
            } else {
                toast.error(res.EM);
            }
        } catch (error) {
            toast.error(error.EM || "Invalid credentials.");
        }
        setIsLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <h2>Welcome Back</h2>
                
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Email or Phone Number</label>
                        <input 
                            type="text" 
                            value={valueLogin} 
                            onChange={(e) => setValueLogin(e.target.value)} 
                            placeholder="Enter your email or phone"
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter your password"
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <div className="switch-page">
                    Don't have an account? <span onClick={() => navigate('/register')}>Sign Up</span>
                </div>
            </div>
        </div>
    );
};

export default Login;