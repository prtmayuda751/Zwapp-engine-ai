import React, { useState } from 'react';
import { signIn, signUp } from '../services/supabase';
import { Button } from './ui/Button';

interface AuthFormProps {
  onAuthSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        await signIn(email, password);
        onAuthSuccess();
      } else {
        await signUp(email, password);
        setMessage("Registration successful! Check your email to confirm (if enabled), or login now.");
        setIsLogin(true); // Switch back to login
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border border-zinc-700 bg-zinc-900 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-600"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-orange-500"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-orange-500"></div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-widest leading-none">
          {isLogin ? 'Access Control' : 'New Identity'}
        </h2>
        <div className="text-xs text-orange-500 font-mono mt-2 tracking-wider">SECURE GATEWAY v.2.4</div>
      </div>

      {error && (
        <div className="mb-4 p-3 border border-red-900 bg-red-900/20 text-red-400 text-xs font-mono">
          [ERROR]: {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 border border-green-900 bg-green-900/20 text-green-400 text-xs font-mono">
          [SUCCESS]: {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
            Identity / Email
          </label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-zinc-700 p-3 text-white focus:border-orange-500 focus:outline-none transition-all font-mono text-sm placeholder-zinc-800"
            placeholder="user@kie.ai"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-2 font-mono uppercase tracking-widest">
            Passcode
          </label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-700 p-3 text-white focus:border-orange-500 focus:outline-none transition-all font-mono text-sm placeholder-zinc-800"
            placeholder="••••••••"
          />
        </div>

        <Button type="submit" className="w-full" isLoading={loading}>
          {isLogin ? 'INITIALIZE SESSION' : 'REGISTER IDENTITY'}
        </Button>
      </form>

      <div className="mt-6 text-center pt-4 border-t border-zinc-800">
        <button 
          type="button"
          onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
          }}
          className="text-xs text-zinc-500 hover:text-orange-500 font-mono uppercase tracking-wider transition-colors"
        >
          {isLogin ? '[ Create New Account ]' : '[ Return to Login ]'}
        </button>
      </div>
    </div>
  );
};