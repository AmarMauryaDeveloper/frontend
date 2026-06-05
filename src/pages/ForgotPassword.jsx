import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Copy } from 'lucide-react';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [tokenReceived, setTokenReceived] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: data.email });
      if (response.data.success) {
        setTokenReceived(response.data.resetToken);
        setEmailSubmitted(data.email);
        toast.success('Mock reset token generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenReceived);
    toast.success('Token copied to clipboard!');
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-6">
        Recover Password
      </h3>

      {!tokenReceived ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-center">
            Enter your email address to receive a mock password reset token.
          </p>

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
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Generating Token...</span>
              </>
            ) : (
              <span>Get Reset Token</span>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-xs leading-relaxed">
            <p className="font-bold mb-1">Success! Mock token generated.</p>
            <p>Normally, this link/token is emailed. For testing, please copy the token below to complete the password change process.</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Mock Reset Token:</span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={tokenReceived}
                className="flex-1 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-colors"
                title="Copy token"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Link
            to={`/reset-password?email=${encodeURIComponent(emailSubmitted)}&token=${tokenReceived}`}
            className="flex items-center justify-center w-full bg-brand-500 hover:bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Proceed to Password Reset
          </Link>
        </div>
      )}

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

export default ForgotPassword;
