import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { IndianRupee, Plus, Trash2, Calendar, FileText, Tag } from 'lucide-react';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: 'SALARY',
    amount: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/expenses', formData);
      setShowModal(false);
      setFormData({ category: 'SALARY', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense');
    }
  };

  const categories = ['SALARY', 'EQUIPMENT', 'RENT', 'MARKETING', 'UTILITIES', 'OTHER'];

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black flex items-center gap-2">
          <IndianRupee className="text-[#6899B0]" /> Expense Management
        </h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-colors font-medium shadow-sm"
        >
          <Plus size={18} />
          Record Expense
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium animate-pulse">Loading expenses...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-5 bg-slate-50 border-b border-slate-200 p-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
            <div>Date</div>
            <div>Category</div>
            <div>Description</div>
            <div>Amount</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <div key={expense.id} className="grid grid-cols-5 p-4 items-center hover:bg-slate-50 transition-colors">
                <div className="font-medium text-black flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400"/>
                  {new Date(expense.expense_date).toLocaleDateString()}
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                    expense.category === 'SALARY' ? 'bg-indigo-100 text-indigo-700' :
                    expense.category === 'EQUIPMENT' ? 'bg-orange-100 text-orange-700' :
                    expense.category === 'RENT' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {expense.category}
                  </span>
                </div>
                <div className="text-sm text-slate-600 truncate max-w-[200px]" title={expense.description}>
                  {expense.description || '-'}
                </div>
                <div className="font-extrabold text-black">
                  ₹ {Number(expense.amount).toLocaleString()}
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => handleDelete(expense.id)} 
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-medium">No expenses recorded yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-black mb-4 border-b border-slate-100 pb-2">Record New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Tag size={14}/> Category</label>
                <select 
                  required 
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none font-medium text-black bg-slate-50"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><IndianRupee size={14}/> Amount</label>
                <input 
                  required 
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none font-medium text-black bg-slate-50"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Calendar size={14}/> Date</label>
                <input 
                  required 
                  type="date"
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none font-medium text-black bg-slate-50"
                  value={formData.expense_date}
                  onChange={e => setFormData({...formData, expense_date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><FileText size={14}/> Description</label>
                <textarea 
                  className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#6899B0] outline-none text-black bg-slate-50"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#6899B0] font-bold text-white rounded-lg hover:bg-[#5D8799] disabled:opacity-50 transition-colors shadow-sm">
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
