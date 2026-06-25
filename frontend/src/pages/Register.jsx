import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import Input from '../components/Input';

export const Register = () => {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('OWNER');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!name) tempErrors.name = 'Full name is required';
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Invalid email address';
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters';
    if (!companyName) tempErrors.companyName = 'Company name is required';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const responseMessage = await register(name, email, password, companyName, role);
      if (responseMessage.includes('Email already exists') || responseMessage.includes('exists')) {
        addToast(responseMessage, 'error');
      } else {
        addToast('Company registered successfully! Please sign in.', 'success');
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Get Started</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Create a new company space</p>
        </div>

        <Input
          label="Full Name"
          type="text"
          placeholder="Riya Prajapati"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="Company Name"
          type="text"
          placeholder="Acme Billing Corp"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          error={errors.companyName}
          required
        />

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

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Registration Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="OWNER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Business Owner (Full control)</option>
            <option value="ACCOUNTANT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Accountant (Manage clients/invoices, record payments)</option>
            <option value="EMPLOYEE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Company Employee (Read-only access)</option>
            <option value="CLIENT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Client / Buyer (Simplified Customer Portal)</option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          loading={loading}
        >
          Create Account
        </Button>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Sign in here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;
