import { useState, useEffect } from 'react';
import { SoftCard } from '../components/soft-card';
import { SoftInput } from '../components/soft-input';
import { SoftButton } from '../components/soft-button';
import {
  Plus,
  Trash2,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Utensils,
  Plane,
  Heart,
  GraduationCap,
  Film,
  Smartphone,
  Briefcase,
  Laptop,
  Zap,
  Tag,
  LucideIcon,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categoriesApi, Category } from '../services/api';
import { toast } from 'sonner';

const iconMap: Record<string, LucideIcon> = {
  'utensils': Utensils,
  'shopping-bag': ShoppingBag,
  'car': Car,
  'home': Home,
  'film': Film,
  'heart': Heart,
  'graduation-cap': GraduationCap,
  'plane': Plane,
  'coffee': Coffee,
  'smartphone': Smartphone,
  'briefcase': Briefcase,
  'laptop': Laptop,
  'zap': Zap,
  'tag': Tag,
};

const iconOptions = [
  { icon: Utensils, name: 'utensils', label: 'Food' },
  { icon: ShoppingBag, name: 'shopping-bag', label: 'Shopping' },
  { icon: Car, name: 'car', label: 'Transport' },
  { icon: Home, name: 'home', label: 'Home' },
  { icon: Film, name: 'film', label: 'Entertainment' },
  { icon: Heart, name: 'heart', label: 'Health' },
  { icon: GraduationCap, name: 'graduation-cap', label: 'Education' },
  { icon: Plane, name: 'plane', label: 'Travel' },
  { icon: Coffee, name: 'coffee', label: 'Coffee' },
  { icon: Briefcase, name: 'briefcase', label: 'Work' },
  { icon: Laptop, name: 'laptop', label: 'Freelance' },
  { icon: Zap, name: 'zap', label: 'Utilities' },
];

const colorOptions = [
  { gradient: 'from-orange-500 to-red-500', hex: '#f59e0b' },
  { gradient: 'from-pink-500 to-purple-500', hex: '#ec4899' },
  { gradient: 'from-blue-500 to-cyan-500', hex: '#3b82f6' },
  { gradient: 'from-green-500 to-teal-500', hex: '#10b981' },
  { gradient: 'from-yellow-500 to-orange-500', hex: '#eab308' },
  { gradient: 'from-red-500 to-pink-500', hex: '#ef4444' },
  { gradient: 'from-indigo-500 to-purple-500', hex: '#6366f1' },
  { gradient: 'from-cyan-500 to-blue-500', hex: '#14b8a6' },
];

function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName] || Tag;
}

function getColorGradient(hexColor: string): string {
  const match = colorOptions.find(c => c.hex === hexColor);
  return match?.gradient || 'from-gray-500 to-gray-600';
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'income' | 'expense'>('expense');
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setSaving(true);
    try {
      await categoriesApi.add({
        name: newCategoryName,
        type: newCategoryType,
        icon: iconOptions[selectedIcon].name,
        color: colorOptions[selectedColor].hex,
      });
      toast.success('Category added successfully!');
      setNewCategoryName('');
      setShowAddModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoriesApi.delete(id.toString());
      toast.success('Category deleted');
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      toast.error('Failed to delete category');
    }
  };

  const renderCategoryCard = (category: Category) => {
    const Icon = getIconComponent(category.icon);
    const gradient = getColorGradient(category.color);

    return (
      <SoftCard key={category.id} hover className="group">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} shadow-[var(--soft-shadow-sm)] flex items-center justify-center`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDeleteCategory(category.id)}
            className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
        <h3 className="font-semibold text-foreground">{category.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
          category.type === 'income'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {category.type}
        </span>
      </SoftCard>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Categories</h1>
          <p className="text-muted-foreground">Manage your expense and income categories</p>
        </div>
        <SoftButton onClick={() => setShowAddModal(true)} icon={Plus} variant="primary">
          Add Category
        </SoftButton>
      </div>

      {/* Expense Categories */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-red-500" />
          <h2 className="text-xl font-semibold text-foreground">Expense Categories</h2>
          <span className="text-sm text-muted-foreground">({expenseCategories.length})</span>
        </div>
        {expenseCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {expenseCategories.map(renderCategoryCard)}
          </div>
        ) : (
          <p className="text-muted-foreground">No expense categories yet</p>
        )}
      </div>

      {/* Income Categories */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-semibold text-foreground">Income Categories</h2>
          <span className="text-sm text-muted-foreground">({incomeCategories.length})</span>
        </div>
        {incomeCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {incomeCategories.map(renderCategoryCard)}
          </div>
        ) : (
          <p className="text-muted-foreground">No income categories yet</p>
        )}
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <SoftCard>
                <h2 className="text-2xl font-semibold text-foreground mb-6">Add New Category</h2>

                <div className="space-y-6">
                  <SoftInput
                    label="Category Name"
                    type="text"
                    placeholder="e.g., Groceries"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />

                  {/* Type Selection */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Category Type</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setNewCategoryType('expense')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          newCategoryType === 'expense'
                            ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-[var(--soft-shadow-md)]'
                            : 'bg-background text-foreground shadow-[var(--soft-shadow-sm)]'
                        }`}
                      >
                        <TrendingDown className="w-4 h-4" />
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCategoryType('income')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          newCategoryType === 'income'
                            ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-[var(--soft-shadow-md)]'
                            : 'bg-background text-foreground shadow-[var(--soft-shadow-sm)]'
                        }`}
                      >
                        <TrendingUp className="w-4 h-4" />
                        Income
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Select Icon</label>
                    <div className="grid grid-cols-6 gap-2">
                      {iconOptions.map((option, index) => {
                        const IconComponent = option.icon;
                        return (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setSelectedIcon(index)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                              selectedIcon === index
                                ? 'bg-primary text-white shadow-[var(--soft-shadow-md)]'
                                : 'bg-background shadow-[var(--soft-shadow-sm)] text-foreground hover:shadow-[var(--soft-shadow-md)]'
                            }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Select Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorOptions.map((color, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setSelectedColor(index)}
                          className={`h-10 rounded-lg bg-gradient-to-br ${color.gradient} transition-all ${
                            selectedColor === index
                              ? 'ring-4 ring-primary ring-offset-2 ring-offset-card'
                              : 'shadow-[var(--soft-shadow-sm)] hover:shadow-[var(--soft-shadow-md)]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <SoftButton
                      onClick={handleAddCategory}
                      variant="primary"
                      className="flex-1"
                      disabled={saving}
                    >
                      {saving ? 'Adding...' : 'Add Category'}
                    </SoftButton>
                    <SoftButton
                      onClick={() => setShowAddModal(false)}
                      variant="ghost"
                      className="flex-1"
                    >
                      Cancel
                    </SoftButton>
                  </div>
                </div>
              </SoftCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
