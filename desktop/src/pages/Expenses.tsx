import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { IndianRupee, Plus, Trash2, Calendar, FileText, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Expenses: React.FC = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    category: 'SALARY',
    amount: '',
    description: '',
    recipient_name: '',
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
      setFormData({ category: 'SALARY', amount: '', description: '', recipient_name: '', expense_date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('expenses.deleteConfirm'))) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense');
    }
  };

  const categories = ['SALARY', 'EQUIPMENT', 'RENT', 'MARKETING', 'UTILITIES', 'EXTERNAL_DOCTOR', 'LAB_WORK', 'DAILY_EXPENSES', 'OTHER'];

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <IndianRupee className="text-[#6899B0]" size={28} /> {t('expenses.title')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('expenses.subtitle')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-all font-semibold shadow-sm"
        >
          <Plus size={18} />
          {t('expenses.recordExpenseBtn')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6899B0]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">{t('expenses.date')}</th>
                <th className="p-4 font-bold">{t('expenses.category')}</th>
                <th className="p-4 font-bold">Recipient / Vendor</th>
                <th className="p-4 font-bold">{t('expenses.description')}</th>
                <th className="p-4 font-bold">{t('expenses.amount')}</th>
                <th className="p-4 font-bold text-right">{t('expenses.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar size={16} className="text-[#6899B0]"/>
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border ${
                      expense.category === 'SALARY' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                      expense.category === 'EQUIPMENT' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      expense.category === 'RENT' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      expense.category === 'EXTERNAL_DOCTOR' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      expense.category === 'LAB_WORK' ? 'bg-cyan-50 text-cyan-700 border-cyan-200' :
                      expense.category === 'DAILY_EXPENSES' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {expense.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    {expense.recipient_name || '-'}
                  </td>
                  <td className="p-4 text-slate-600 truncate max-w-[200px]" title={expense.description}>
                    {expense.description || '-'}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    ₹ {Number(expense.amount).toLocaleString()}
                  </td>
                  <td className="p-4 flex justify-end gap-2">
                    <button 
                      onClick={() => handleDelete(expense.id)} 
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <IndianRupee size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{t('expenses.noExpenses')}</h3>
                    <p>{t('expenses.noExpensesSub')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">{t('expenses.newExpenseTitle')}</h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Tag size={16} className="text-[#6899B0]"/> {t('expenses.category')}</label>
                  <select 
                    required 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none font-medium text-slate-900 bg-white transition-all"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><IndianRupee size={16} className="text-[#6899B0]"/> {t('expenses.amount')}</label>
                  <input 
                    required 
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none font-medium text-slate-900 bg-white transition-all"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><Calendar size={16} className="text-[#6899B0]"/> {t('expenses.date')}</label>
                  <input 
                    required 
                    type="date"
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none font-medium text-slate-900 bg-white transition-all"
                    value={formData.expense_date}
                    onChange={e => setFormData({...formData, expense_date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">Paid To (Recipient / Vendor)</label>
                  <input 
                    type="text"
                    placeholder="e.g., Dr. Ramesh, City Lab, etc."
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none font-medium text-slate-900 bg-white transition-all"
                    value={formData.recipient_name}
                    onChange={e => setFormData({...formData, recipient_name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5"><FileText size={16} className="text-[#6899B0]"/> {t('expenses.description')}</label>
                  <textarea 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none font-medium text-slate-900 bg-white transition-all min-h-[100px]"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">{t('expenses.cancel')}</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-[#6899B0] font-bold text-white rounded-lg hover:bg-[#5D8799] disabled:opacity-50 transition-all shadow-sm">
                    {submitting ? t('expenses.saving') : t('expenses.saveExpense')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
