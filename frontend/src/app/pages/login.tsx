import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock } from 'lucide-react';
import { SoftCard } from '../components/soft-card';
import { SoftInput } from '../components/soft-input';
import { SoftButton } from '../components/soft-button';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - navigate to dashboard
    navigate('/app');
  };

  return (
    <SoftCard>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome Back</h2>
        <p className="text-muted-foreground">Sign in to continue to your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-[50px] w-5 h-5 text-muted-foreground transform -translate-y-1/2" />
          <SoftInput
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-[50px] w-5 h-5 text-muted-foreground transform -translate-y-1/2" />
          <SoftInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-12"
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          <a href="#" className="text-primary hover:underline">
            Forgot Password?
          </a>
        </div>

        <SoftButton type="submit" variant="primary" className="w-full">
          Sign In
        </SoftButton>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign Up
          </Link>
        </div>
      </form>
    </SoftCard>
  );
}
