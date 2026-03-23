import { useState, useRef, useEffect } from 'react';
import { SoftCard } from '../components/soft-card';
import { SoftInput } from '../components/soft-input';
import { SoftButton } from '../components/soft-button';
import { useTheme } from '../contexts/theme-context';
import { useProfile } from '../contexts/profile-context';
import { useTransactions, Transaction } from '../contexts/transaction-context';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Lock,
  Palette,
  Download,
  Upload,
  Camera,
  X,
  Eye,
  EyeOff,
  FileJson,
  FileSpreadsheet,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export function Profile() {
  const { theme, toggleTheme } = useTheme();
  const { profileImage, setProfileImage, userName, setUserName } = useProfile();
  const { transactions, getBalance, getTotalIncome, getTotalExpense, importTransactions, exportTransactions } = useTransactions();
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Mumbai, India');
  const [notifications, setNotifications] = useState(true);
  const [lowBalanceAlert, setLowBalanceAlert] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(true);

  // Profile image state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Export dropdown state
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const handleSaveProfile = () => {
    setUserName(name);
    toast.success('Profile updated successfully!');
  };

  // Profile image handling
  const handleImageClick = () => {
    setShowImageOptions(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileImage(result);
        toast.success('Profile image updated!');
      };
      reader.readAsDataURL(file);
    }
    setShowImageOptions(false);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Create video element for camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Create a modal for camera preview
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;';

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      video.width = 640;
      video.height = 480;

      modal.appendChild(video);

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = 'display:flex;gap:16px;margin-top:20px;';

      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capture';
      captureBtn.style.cssText = 'padding:12px 24px;background:#10b981;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;';

      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.cssText = 'padding:12px 24px;background:#ef4444;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px;';

      buttonContainer.appendChild(captureBtn);
      buttonContainer.appendChild(cancelBtn);
      modal.appendChild(buttonContainer);
      document.body.appendChild(modal);

      captureBtn.onclick = () => {
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setProfileImage(imageData);
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
        toast.success('Photo captured!');
      };

      cancelBtn.onclick = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };

    } catch {
      toast.error('Camera access denied or not available');
    }
    setShowImageOptions(false);
  };

  // Change password handling
  const handleChangePassword = () => {
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // In production, this would call the API
    // authApi.changePassword(currentPassword, newPassword)
    toast.success('Password changed successfully!');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Export functionality
  const handleExportJSON = () => {
    const data = exportTransactions();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${data.length} transactions as JSON`);
  };

  const handleExportCSV = () => {
    const data = exportTransactions();

    const headers = ['ID', 'Title', 'Amount', 'Type', 'Category', 'Date', 'Payment Method', 'Notes'];
    const csvRows = [
      headers.join(','),
      ...data.map(t => [
        t.id,
        `"${t.title.replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        `"${t.category.replace(/"/g, '""')}"`,
        t.date,
        `"${t.paymentMethod.replace(/"/g, '""')}"`,
        `"${(t.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-tracker-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${data.length} transactions as CSV`);
  };

  // Import functionality
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        if (file.name.endsWith('.json')) {
          const data = JSON.parse(content) as Transaction[];
          if (!Array.isArray(data)) {
            throw new Error('Invalid JSON format');
          }
          importTransactions(data);
          toast.success(`Imported ${data.length} transactions`);
        } else if (file.name.endsWith('.csv')) {
          const lines = content.split('\n');
          const headers = lines[0].split(',');

          const transactions: Transaction[] = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Simple CSV parsing (handles basic quoted fields)
            const values: string[] = [];
            let current = '';
            let inQuotes = false;

            for (const char of line) {
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());

            if (values.length >= 6) {
              transactions.push({
                id: values[0] || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title: values[1],
                amount: parseFloat(values[2]) || 0,
                type: (values[3] as 'income' | 'expense') || 'expense',
                category: values[4],
                date: values[5],
                paymentMethod: values[6] || 'Cash',
                notes: values[7] || ''
              });
            }
          }

          importTransactions(transactions);
          toast.success(`Imported ${transactions.length} transactions`);
        } else {
          throw new Error('Unsupported file format');
        }
      } catch (error) {
        toast.error(`Import failed: ${error instanceof Error ? error.message : 'Invalid file format'}`);
      }
    };

    reader.readAsText(file);
    setShowImportModal(false);
    if (importFileRef.current) {
      importFileRef.current.value = '';
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <SoftCard className="text-center">
            <div className="relative inline-block mb-4">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover shadow-[var(--soft-shadow-lg)]"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary shadow-[var(--soft-shadow-lg)] flex items-center justify-center text-white text-4xl font-bold">
                  {getInitials()}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleImageClick}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-card shadow-[var(--soft-shadow-md)] flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <Camera className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Image Options Popup */}
            <AnimatePresence>
              {showImageOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-xl shadow-[var(--soft-shadow-lg)] p-4 z-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-foreground">Update Photo</h3>
                    <button onClick={() => setShowImageOptions(false)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={handleCameraCapture}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors"
                    >
                      <Camera className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Take Photo</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors"
                    >
                      <ImageIcon className="w-5 h-5 text-primary" />
                      <span className="text-foreground">Choose from Gallery</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            <h2 className="text-xl font-semibold text-foreground mb-1">{name}</h2>
            <p className="text-sm text-muted-foreground mb-6">{email}</p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-background shadow-[var(--soft-shadow-sm)]">
                <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                <p className="text-2xl font-bold text-foreground">₹{getBalance().toLocaleString('en-IN')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-background shadow-[var(--soft-shadow-sm)]">
                  <p className="text-xs text-muted-foreground mb-1">Income</p>
                  <p className="text-lg font-semibold text-success">₹{getTotalIncome().toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 rounded-xl bg-background shadow-[var(--soft-shadow-sm)]">
                  <p className="text-xs text-muted-foreground mb-1">Expense</p>
                  <p className="text-lg font-semibold text-destructive">₹{getTotalExpense().toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </SoftCard>
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <SoftCard>
            <h3 className="text-xl font-semibold text-foreground mb-6">Personal Information</h3>
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-[50px] w-5 h-5 text-muted-foreground transform -translate-y-1/2" />
                <SoftInput
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-[50px] w-5 h-5 text-muted-foreground transform -translate-y-1/2" />
                <SoftInput
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-[50px] w-5 h-5 text-muted-foreground transform -translate-y-1/2" />
                <SoftInput
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-12"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-[50px] w-5 h-5 text-muted-foreground transform -translate-y-1/2" />
                <SoftInput
                  label="Location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
            <div className="mt-6">
              <SoftButton onClick={handleSaveProfile} variant="primary">
                Save Changes
              </SoftButton>
            </div>
          </SoftCard>

          {/* Preferences */}
          <SoftCard>
            <h3 className="text-xl font-semibold text-foreground mb-6">Preferences</h3>
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background shadow-[var(--soft-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-[var(--soft-shadow-sm)] flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleTheme}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <motion.div
                    animate={{ x: theme === 'dark' ? 24 : 2 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </motion.button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background shadow-[var(--soft-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-[var(--soft-shadow-sm)] flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Notifications</p>
                    <p className="text-sm text-muted-foreground">Enable push notifications</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setNotifications(!notifications)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifications ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <motion.div
                    animate={{ x: notifications ? 24 : 2 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </motion.button>
              </div>

              {/* Low Balance Alert */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background shadow-[var(--soft-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-[var(--soft-shadow-sm)] flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Low Balance Alert</p>
                    <p className="text-sm text-muted-foreground">Alert when balance is low</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLowBalanceAlert(!lowBalanceAlert)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    lowBalanceAlert ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <motion.div
                    animate={{ x: lowBalanceAlert ? 24 : 2 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </motion.button>
              </div>

              {/* Monthly Report */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background shadow-[var(--soft-shadow-sm)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 shadow-[var(--soft-shadow-sm)] flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Monthly Report</p>
                    <p className="text-sm text-muted-foreground">Receive monthly email reports</p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMonthlyReport(!monthlyReport)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    monthlyReport ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <motion.div
                    animate={{ x: monthlyReport ? 24 : 2 }}
                    className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </motion.button>
              </div>
            </div>
          </SoftCard>

          {/* Data & Security */}
          <SoftCard>
            <h3 className="text-xl font-semibold text-foreground mb-6">Data & Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowExportDropdown(true)}
                onMouseLeave={() => setShowExportDropdown(false)}
              >
                <SoftButton variant="primary" icon={Download} className="w-full">
                  Export Data
                </SoftButton>
                <AnimatePresence>
                  {showExportDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-[var(--soft-shadow-lg)] z-10"
                    >
                      <button
                        onClick={handleExportJSON}
                        className="w-full flex items-center gap-3 p-3 hover:bg-background rounded-t-xl transition-colors"
                      >
                        <FileJson className="w-5 h-5 text-primary" />
                        <span className="text-foreground">Export as JSON</span>
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="w-full flex items-center gap-3 p-3 hover:bg-background rounded-b-xl transition-colors"
                      >
                        <FileSpreadsheet className="w-5 h-5 text-green-500" />
                        <span className="text-foreground">Export as CSV</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <SoftButton
                variant="secondary"
                icon={Upload}
                onClick={() => setShowImportModal(true)}
              >
                Import Data
              </SoftButton>

              <SoftButton
                variant="ghost"
                icon={Lock}
                className="md:col-span-2"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </SoftButton>
            </div>
          </SoftCard>
        </div>
      </div>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-[var(--soft-shadow-lg)] p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <SoftInput
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-[50px] transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <SoftInput
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-[50px] transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <SoftInput
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-[50px] transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-destructive text-sm">{passwordError}</p>
                )}

                <div className="flex gap-3 pt-4">
                  <SoftButton
                    variant="primary"
                    onClick={handleChangePassword}
                    className="flex-1"
                  >
                    Update Password
                  </SoftButton>
                  <SoftButton
                    variant="ghost"
                    onClick={() => setShowPasswordModal(false)}
                  >
                    Cancel
                  </SoftButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl shadow-[var(--soft-shadow-lg)] p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Import Data</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Import transactions from a JSON or CSV file. The file should contain transaction data with fields: title, amount, type, category, date, paymentMethod, notes.
                </p>

                <input
                  type="file"
                  ref={importFileRef}
                  onChange={handleImportFile}
                  accept=".json,.csv"
                  className="hidden"
                />

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => importFileRef.current?.click()}
                    className="w-full p-8 border-2 border-dashed border-muted rounded-xl hover:border-primary hover:bg-background/50 transition-colors flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-foreground font-medium">Click to select file</span>
                    <span className="text-sm text-muted-foreground">Supports JSON and CSV</span>
                  </button>
                </div>

                <SoftButton
                  variant="ghost"
                  onClick={() => setShowImportModal(false)}
                  className="w-full"
                >
                  Cancel
                </SoftButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
