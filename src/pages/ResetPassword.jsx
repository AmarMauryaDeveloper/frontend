import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Lock, Mail, Key, ArrowLeft, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    if (email) setValue('email', email);
    if (token) setValue('resetToken', token);
  }, [searchParams, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', data);
      if (response.data.success) {
        toast.success('Password reset successfully! Log in with your new password.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-6">
        Set New Password
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="email"
              placeholder="name@company.com"
              {...register('email', { required: 'Email is required' })}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Reset Token Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            Reset Token
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Key className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Enter reset token"
              {...register('resetToken', { required: 'Token is required' })}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm font-mono"
            />
          </div>
          {errors.resetToken && (
            <p className="text-[10px] text-red-500 mt-1">{errors.resetToken.message}</p>
          )}
        </div>

        {/* New Password Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password', {
                required: 'New Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
            />
          </div>
          {errors.password && (
            <p className="text-[10px] text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <span>Reset Password</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
