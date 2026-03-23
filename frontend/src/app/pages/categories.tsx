import { useState } from 'react';
import { SoftCard } from '../components/soft-card';
import { SoftInput } from '../components/soft-input';
import { SoftButton } from '../components/soft-button';
import { 
  Plus, 
  Edit2, 
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
  LucideIcon
} from 'lucide-react';
import { motion } from 'motion/react';

interface Category {
  id: number;
  name: string;
  icon: LucideIcon;
  color: string;
  count: number;
  totalAmount: number;
}

const initialCategories: Category[] = [
  { id: 1, name: 'Food & Dining', icon: Utensils, color: 'from-orange-500 to-red-500', count: 45, totalAmount: 12000 },
  { id: 2, name: 'Shopping', icon: ShoppingBag, color: 'from-pink-500 to-purple-500', count: 28, totalAmount: 15000 },
  { id: 3, name: 'Transport', icon: Car, color: 'from-blue-500 to-cyan-500', count: 32, totalAmount: 8000 },
  { id: 4, name: 'Bills & Utilities', icon: Home, color: 'from-green-500 to-teal-500', count: 12, totalAmount: 10500 },
  { id: 5, name: 'Entertainment', icon: Film, color: 'from-yellow-500 to-orange-500', count: 18, totalAmount: 5500 },
  { id: 6, name: 'Healthcare', icon: Heart, color: 'from-red-500 to-pink-500', count: 8, totalAmount: 4200 },
  { id: 7, name: 'Education', icon: GraduationCap, color: 'from-indigo-500 to-purple-500', count: 5, totalAmount: 8500 },
  { id: 8, name: 'Travel', icon: Plane, color: 'from-cyan-500 to-blue-500', count: 6, totalAmount: 12000 },
];

const iconOptions = [
  { icon: Utensils, name: 'Utensils' },
  { icon: ShoppingBag, name: 'Shopping Bag' },
  { icon: Car, name: 'Car' },
  { icon: Home, name: 'Home' },
  { icon: Film, name: 'Film' },
  { icon: Heart, name: 'Heart' },
  { icon: GraduationCap, name: 'Education' },
  { icon: Plane, name: 'Plane' },
  { icon: Coffee, name: 'Coffee' },
  { icon: Smartphone, name: 'Smartphone' },
];

const colorOptions = [
  'from-orange-500 to-red-500',
  'from-pink-500 to-purple-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-teal-500',
  'from-yellow-500 to-orange-500',
  'from-red-500 to-pink-500',
  'from-indigo-500 to-purple-500',
  'from-cyan-500 to-blue-500',
];

export function Categories() {
  const [categories, setCategories] = useState(initialCategories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: categories.length + 1,
        name: newCategoryName,
        icon: iconOptions[selectedIcon].icon,
        color: colorOptions[selectedColor],
        count: 0,
        totalAmount: 0,
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setShowAddModal(false);
    }
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <SoftCard key={category.id} hover className="group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} shadow-[var(--soft-shadow-sm)] flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-lg bg-info/10 text-info hover:bg-info/20 flex items-center justify-center transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteCategory(category.id)}
                    className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transactions</span>
                  <span className="font-medium text-foreground">{category.count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium text-foreground">₹{category.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </SoftCard>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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

                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Select Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.map((option, index) => {
                      const IconComponent = option.icon;
                      return (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setSelectedIcon(index)}
                          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
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
                        className={`h-12 rounded-lg bg-gradient-to-br ${color} transition-all ${
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
                  >
                    Add Category
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
        </div>
      )}
    </div>
  );
}
