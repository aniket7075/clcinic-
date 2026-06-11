import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, AlertTriangle, Plus, Truck } from 'lucide-react';

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'suppliers'>('items');
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [itemFormData, setItemFormData] = useState({
    item_name: '', category: '', quantity: 0, unit: 'pcs', unit_price: 0, low_stock_threshold: 10, expiry_date: ''
  });

  const [supplierFormData, setSupplierFormData] = useState({
    supplier_name: '', contact_person: '', phone: '', email: '', address: ''
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory');
      setItems(res.data.inventory || res.data);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/inventory/suppliers');
      setSuppliers(res.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'items') {
      fetchItems();
    } else {
      fetchSuppliers();
    }
  }, [activeTab]);

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...itemFormData };
      if (!payload.expiry_date) {
        delete (payload as any).expiry_date;
      }
      await api.post('/inventory', payload);
      setShowItemModal(false);
      setItemFormData({ item_name: '', category: '', quantity: 0, unit: 'pcs', unit_price: 0, low_stock_threshold: 10, expiry_date: '' });
      fetchItems();
    } catch (err) {
      console.error('Error adding item:', err);
      alert('Failed to add inventory item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/inventory/suppliers', supplierFormData);
      setShowSupplierModal(false);
      setSupplierFormData({ supplier_name: '', contact_person: '', phone: '', email: '', address: '' });
      fetchSuppliers();
    } catch (err) {
      console.error('Error adding supplier:', err);
      alert('Failed to add supplier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Inventory Management</h1>
        <button 
          onClick={() => activeTab === 'items' ? setShowItemModal(true) : setShowSupplierModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-colors"
        >
          <Plus size={18} />
          {activeTab === 'items' ? 'Add Item' : 'Add Supplier'}
        </button>
      </div>

      <div className="flex space-x-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 px-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'items' ? 'border-b-2 border-[#6899B0] text-[#5D8799]' : 'text-black hover:text-black'
          }`}
        >
          <Package size={18} />
          Inventory Items
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'suppliers' ? 'border-b-2 border-[#6899B0] text-[#5D8799]' : 'text-black hover:text-black'
          }`}
        >
          <Truck size={18} />
          Suppliers
        </button>
      </div>

      {loading ? (
        <p className="text-black">Loading data...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === 'items' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-black text-sm">
                  <th className="p-4">Item Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Unit Price</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isLowStock = item.quantity <= (item.low_stock_threshold || 0);
                  return (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="p-4 font-medium text-black">{item.item_name}</td>
                      <td className="p-4 text-black">{item.category}</td>
                      <td className="p-4 font-semibold text-black">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-4 text-black">₹{item.unit_price}</td>
                      <td className="p-4 text-black">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4">
                        {isLowStock ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full w-max">
                            <AlertTriangle size={14} /> Low Stock
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full w-max inline-block text-center">
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-black">No items found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'suppliers' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-black text-sm">
                  <th className="p-4">Supplier Name</th>
                  <th className="p-4">Contact Person</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Rating</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-4 font-medium text-black">{sup.supplier_name}</td>
                    <td className="p-4 text-black">{sup.contact_person}</td>
                    <td className="p-4 text-black">{sup.email}</td>
                    <td className="p-4 text-black">{sup.phone}</td>
                    <td className="p-4 text-black">{sup.rating || 'N/A'}/5</td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-black">No suppliers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Add New Item</h2>
            <form onSubmit={handleItemSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Name</label>
                  <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={itemFormData.item_name} onChange={e => setItemFormData({...itemFormData, item_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={itemFormData.category} onChange={e => setItemFormData({...itemFormData, category: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input required type="number" min="0" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={itemFormData.quantity} onChange={e => setItemFormData({...itemFormData, quantity: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input required type="text" placeholder="e.g. pcs, boxes" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={itemFormData.unit} onChange={e => setItemFormData({...itemFormData, unit: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price (₹)</label>
                  <input required type="number" min="0" step="0.01" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={itemFormData.unit_price} onChange={e => setItemFormData({...itemFormData, unit_price: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
                  <input required type="number" min="0" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={itemFormData.low_stock_threshold} onChange={e => setItemFormData({...itemFormData, low_stock_threshold: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
                  <input type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={itemFormData.expiry_date} onChange={e => setItemFormData({...itemFormData, expiry_date: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowItemModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Add New Supplier</h2>
            <form onSubmit={handleSupplierSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier/Company Name</label>
                <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={supplierFormData.supplier_name} onChange={e => setSupplierFormData({...supplierFormData, supplier_name: e.target.value})} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person</label>
                  <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={supplierFormData.contact_person} onChange={e => setSupplierFormData({...supplierFormData, contact_person: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={supplierFormData.phone} onChange={e => setSupplierFormData({...supplierFormData, phone: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={supplierFormData.email} onChange={e => setSupplierFormData({...supplierFormData, email: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <textarea className="w-full border p-2 rounded focus:ring-2 focus:ring-[#6899B0] outline-none" value={supplierFormData.address} onChange={e => setSupplierFormData({...supplierFormData, address: e.target.value})} />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowSupplierModal(false)} className="px-4 py-2 text-black hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
