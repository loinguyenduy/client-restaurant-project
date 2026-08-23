import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUserApi } from "../../services/authService";
import "./Auth.scss";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    gender: "other",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const email = form.email.trim();
    const username = form.username.trim();
    const fullName = form.fullName.trim();
    const phone = form.phone.trim();

    if (!email || !username || !form.password || !fullName) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Password confirmation does not match.");
      return;
    }
    if (phone && !/^\d+$/.test(phone)) {
      toast.error("Phone number must contain only digits.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUserApi(
        email,
        username,
        form.password,
        fullName,
        phone,
        form.gender,
      );
      if (res?.EC === 0) {
        toast.success("Registration successful. Please sign in.");
        navigate("/login");
      } else {
        toast.error(res?.EM || "Registration failed.");
      }
    } catch (error) {
      toast.error(error?.EM || "Unable to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <p className="auth-eyebrow">Customer Account</p>
        <h2>Create Account</h2>
        <p className="auth-description">Create your Royal Restaurant customer profile.</p>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label htmlFor="register-email">Email *</label>
            <input id="register-email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
          </div>
          <div className="input-group">
            <label htmlFor="register-username">Username *</label>
            <input id="register-username" name="username" type="text" value={form.username} onChange={handleChange} autoComplete="username" required />
          </div>
          <div className="input-group">
            <label htmlFor="register-full-name">Full Name *</label>
            <input id="register-full-name" name="fullName" type="text" value={form.fullName} onChange={handleChange} autoComplete="name" required />
          </div>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="register-password">Password *</label>
              <input id="register-password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
            </div>
            <div className="input-group">
              <label htmlFor="register-confirm-password">Confirm Password *</label>
              <input id="register-confirm-password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="register-phone">Phone Number</label>
              <input id="register-phone" name="phone" type="tel" inputMode="numeric" value={form.phone} onChange={handleChange} autoComplete="tel" />
            </div>
            <div className="input-group">
              <label htmlFor="register-gender">Gender</label>
              <select id="register-gender" name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="switch-page">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
