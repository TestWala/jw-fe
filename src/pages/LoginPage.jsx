import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import './LoginPage.css';
import { authApi } from '../api/authApi';

export default function LoginPage({ onLoginSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    user: '',
    password: ''
  });

  const jewelryImages = [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % jewelryImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const credentials = {
      user: formData.user,
      password: formData.password
    };

    const res = await authApi.loginuser(credentials);
    console.log(res);
    if (res.success) {
      onLoginSuccess(res.data);
    } else {
      alert(res.error || "Login failed");
    }
  };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-page">

      {/* Left sliding images */}
      <div className="login-left">
        <div className="slide-overlay"></div>

        {jewelryImages.map((img, index) => (
          <div
            key={index}
            className={`slide-image ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={img} alt="jewelry" />
          </div>
        ))}

        <div className="left-content">
          <div className="left-title">
            <Sparkles className="icon-gold" />
            <h1>Luxury Collection</h1>
          </div>
          <p>Discover timeless elegance with our exquisite jewelry pieces.</p>

          <div className="slide-dots">
            {jewelryImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Form */}
      <div className="login-right">
        <div className="login-card">

          <div className="login-header">
            <div className="logo-circle">
              <Sparkles className="logo-icon" />
            </div>
            <h2>Welcome Back</h2>
            <p>Sign in to access your account</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>

            {/* Username */}
            <div className="form-group">
              <label>Username or Email</label>
              <div className="input-box">
                <Mail className="input-icon" />
                <input
                  type="text"
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  required
                  placeholder="Enter username or email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <div className="input-box">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>


            {/* Login */}
            <button type="submit" className="login-btn">
              <Lock className="btn-icon" /> Sign In
            </button>
          </form>

          <p className="footer-text">© 2024 Luxury Jewelry. All rights reserved.</p>

        </div>
      </div>
    </div>
  );
}
