import axios from "axios";
import React, { useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from 'react-spinners';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        userName,
        password
      });
      const token = response.data.token;
      localStorage.setItem("token", token);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col bg-[#0047AB] font-[Roboto]">
      {/* Main Content - Centered */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-b-3xl w-24 h-24 shadow-2xl flex justify-center items-center border-4 border-white/25">
              <Link to='/'>
                <span className="text-5xl font-bold text-[#f0f0f0]">FA</span>
              </Link>
            </div>
            <h1 className="text-white text-3xl font-bold tracking-wide mt-2">ADMIN LOGIN</h1>
            <p className="text-white/70 text-sm mt-2">Login to view your archive items.</p>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            {/* Username Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser size={20} className="text-white" />
              </div>
              <input
                type="text"
                placeholder="ENTER YOUR USERNAME"
                value={userName}
                autoComplete="username"
                onChange={(e) => setUserName(e.target.value)}
                className="w-full border-2 bg-transparent pl-12 pr-4 py-3 border-white/40 rounded text-white placeholder-white/70 focus:outline-none focus:border-white"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock size={20} className="text-white" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="ENTER YOUR PASSWORD"
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 bg-transparent pl-12 pr-4 py-3 border-white/40 rounded text-white placeholder-white/70 focus:outline-none focus:border-white"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`w-full bg-white py-3 rounded font-medium shadow-lg cursor-pointer mt-6 hover:bg-amber-200 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color={'#0047AB'} loading={loading} /> : 'LOGIN'}
            </button>
          </form>

          {/* Spacer to push footer to bottom */}
          <div className="h-12" />
        </div>
      </div>

      {/* Bottom Bar - same as main Footer */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <p className="text-[#F0F0F0] text-sm text-center">
            &copy; {currentYear} Folasade Adepoju. All rights reserved. | 
            <span className="ml-2 text-[#FFD700]">
              <a
                target="_blank"
                href="https://vishtechinnovation.com.ng/contact-us/"
                className="hover:underline"
              >
                Create yours here
              </a>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
