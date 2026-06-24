import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import Input from '../components/Input';

export const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Invalid email address';
    if (!password) tempErrors.password = 'Password is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to BillFlow AI!', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      addToast(
        err.response?.data?.message || 'Invalid email or password. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Welcome Back</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Sign in to your client invoicing portal</p>
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
        >
          Sign In
        </Button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Register your company
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
