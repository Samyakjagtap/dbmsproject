import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { SoftCard } from '../components/soft-card';
import { SoftInput } from '../components/soft-input';
import { SoftButton } from '../components/soft-button';

export function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock signup - navigate to dashboard
    navigate('/app');
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

        <SoftButton type="submit" variant="primary" className="w-full">
          Create Account
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
