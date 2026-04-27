import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUserApi } from '../../services/authService';
import { toast } from 'react-toastify';
import './Auth.scss';

const Register = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("other");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!email || !username || !password || !fullName) {
            toast.error("Please fill in all required fields!");
            return;
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);
        try {
            let res = await registerUserApi(email, username, password, fullName, phone, gender);
            if (res && res.EC === 0) {
                toast.success("Registration successful! Please sign in.");
                navigate('/login');
            } else {
                toast.error(res.EM);
            }
        } catch (error) {
            toast.error(error.EM || "Server error occurred. Please try again.");
        }
        setIsLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-box">
                <h2>Create Account</h2>
                
                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label>Email (*)</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Username (*)</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Password (*)</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Full Name (*)</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                    <div className="input-group">
                        <label>Phone Number</label>
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Gender</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                        {isLoading ? "Processing..." : "Sign Up"}
                    </button>
                </form>

                <div className="switch-page">
                    Already have an account? <span onClick={() => navigate('/login')}>Sign In</span>
                </div>
            </div>
        </div>
    );
};

export default Register;