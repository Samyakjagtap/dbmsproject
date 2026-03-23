import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { SoftCard } from '../components/soft-card';
import { SoftInput } from '../components/soft-input';
import { SoftButton } from '../components/soft-button';
import { authApi } from '../services/api';
import { toast } from 'sonner';

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authApi.register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/app');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SoftCard>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Create Account</h2>
        <p className="text-muted-foreground">Sign up to get started with ExpenseTracker</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="relative">
          <UserIcon className="absolute left-4 top-[50px] w-5 h-5 text-muted-foreground transform -translate-y-1/2" />
          <SoftInput
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-12"
            required
          />
        </div>

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

        <div className="relative">
          <Lock className="absolute left-4 top-[50px] w-5 h-5 text-muted-foreground transform -translate-y-1/2" />
          <SoftInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-12"
            required
          />
        </div>

        <label className="flex items-start gap-2 cursor-pointer text-sm">
          <input type="checkbox" className="w-4 h-4 mt-1 rounded accent-primary" required />
          <span className="text-muted-foreground">
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </span>
        </label>

        <SoftButton type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </SoftButton>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/" className="text-primary hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </form>
    </SoftCard>
  );
}
