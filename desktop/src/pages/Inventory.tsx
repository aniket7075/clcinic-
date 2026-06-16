import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, AlertTriangle, Plus, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Inventory: React.FC = () => {
  const { t } = useTranslation();
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('inventory.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">{t('inventory.subtitle')}</p>
        </div>
        <button 
          onClick={() => activeTab === 'items' ? setShowItemModal(true) : setShowSupplierModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6899B0] text-white rounded-lg hover:bg-[#5D8799] transition-all font-semibold shadow-sm"
        >
          <Plus size={18} />
          {activeTab === 'items' ? t('inventory.addItemBtn') : t('inventory.addSupplierBtn')}
        </button>
      </div>

      <div className="flex space-x-6 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'items' ? 'border-b-2 border-[#6899B0] text-[#6899B0]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package size={18} />
          {t('inventory.itemsTab')}
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'suppliers' ? 'border-b-2 border-[#6899B0] text-[#6899B0]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck size={18} />
          {t('inventory.suppliersTab')}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6899B0]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {activeTab === 'items' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">{t('inventory.itemName')}</th>
                  <th className="p-4 font-bold">{t('inventory.category')}</th>
                  <th className="p-4 font-bold">{t('inventory.quantity')}</th>
                  <th className="p-4 font-bold">{t('inventory.unitPrice')}</th>
                  <th className="p-4 font-bold">{t('inventory.expiryDate')}</th>
                  <th className="p-4 font-bold">{t('inventory.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const isLowStock = item.quantity <= (item.low_stock_threshold || 0);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-900">{item.item_name}</td>
                      <td className="p-4 text-slate-600">{item.category}</td>
                      <td className="p-4 font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-4 text-slate-600">₹{item.unit_price}</td>
                      <td className="p-4 text-slate-600">{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4">
                        {isLowStock ? (
                          <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-md w-max uppercase tracking-wider">
                            <AlertTriangle size={14} strokeWidth={2.5} /> {t('inventory.lowStock')}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-md w-max inline-block text-center uppercase tracking-wider">
                            {t('inventory.inStock')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      <Package size={48} className="mx-auto text-slate-300 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{t('inventory.noItems')}</h3>
                      <p>{t('inventory.noItemsSub')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'suppliers' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold">{t('inventory.supplierName')}</th>
                  <th className="p-4 font-bold">{t('inventory.contactPerson')}</th>
                  <th className="p-4 font-bold">{t('inventory.email')}</th>
                  <th className="p-4 font-bold">{t('inventory.phone')}</th>
                  <th className="p-4 font-bold">{t('inventory.rating')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">{sup.supplier_name}</td>
                    <td className="p-4 text-slate-700 font-medium">{sup.contact_person}</td>
                    <td className="p-4 text-slate-600">{sup.email}</td>
                    <td className="p-4 text-slate-600">{sup.phone}</td>
                    <td className="p-4 text-slate-600 font-medium">{sup.rating || 'N/A'}/5</td>
                  </tr>
                ))}
                {suppliers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                      <Truck size={48} className="mx-auto text-slate-300 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{t('inventory.noSuppliers')}</h3>
                      <p>{t('inventory.noSuppliersSub')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">{t('inventory.newItemTitle')}</h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleItemSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.itemName')}</label>
                    <input required list="inventory-items" type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={itemFormData.item_name} onChange={e => setItemFormData({...itemFormData, item_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.category')}</label>
                    <input required list="inventory-categories" type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={itemFormData.category} onChange={e => setItemFormData({...itemFormData, category: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.quantity')}</label>
                    <input required type="number" min="0" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={itemFormData.quantity} onChange={e => setItemFormData({...itemFormData, quantity: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.unit')}</label>
                    <input required list="inventory-units" type="text" placeholder="e.g. pcs, boxes" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={itemFormData.unit} onChange={e => setItemFormData({...itemFormData, unit: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.price')}</label>
                    <input required type="number" min="0" step="0.01" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={itemFormData.unit_price} onChange={e => setItemFormData({...itemFormData, unit_price: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.lowStockAlert')}</label>
                    <input required type="number" min="0" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={itemFormData.low_stock_threshold} onChange={e => setItemFormData({...itemFormData, low_stock_threshold: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.expiryOpt')}</label>
                    <input type="date" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={itemFormData.expiry_date} onChange={e => setItemFormData({...itemFormData, expiry_date: e.target.value})} />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowItemModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">{t('inventory.cancel')}</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-[#6899B0] text-white font-bold rounded-lg hover:bg-[#5D8799] disabled:opacity-50 transition-all shadow-sm">
                    {submitting ? t('inventory.adding') : t('inventory.addItemBtn')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-900">{t('inventory.newSupplierTitle')}</h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSupplierSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.companyName')}</label>
                  <input required type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={supplierFormData.supplier_name} onChange={e => setSupplierFormData({...supplierFormData, supplier_name: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.contactPerson')}</label>
                    <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={supplierFormData.contact_person} onChange={e => setSupplierFormData({...supplierFormData, contact_person: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.phone')}</label>
                    <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={supplierFormData.phone} onChange={e => setSupplierFormData({...supplierFormData, phone: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.email')}</label>
                  <input type="email" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900" value={supplierFormData.email} onChange={e => setSupplierFormData({...supplierFormData, email: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('inventory.address')}</label>
                  <textarea className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-4 focus:ring-[#6899B0]/20 focus:border-[#6899B0] outline-none transition-all font-medium text-slate-900 min-h-[100px]" value={supplierFormData.address} onChange={e => setSupplierFormData({...supplierFormData, address: e.target.value})} />
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowSupplierModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">{t('inventory.cancel')}</button>
                  <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-[#6899B0] text-white font-bold rounded-lg hover:bg-[#5D8799] disabled:opacity-50 transition-all shadow-sm">
                    {submitting ? t('inventory.adding') : t('inventory.addSupplierBtn')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <datalist id="inventory-categories">
        <option value="Consumables" />
        <option value="Instruments" />
        <option value="Restorative Materials" />
        <option value="Endodontics" />
        <option value="Orthodontics" />
        <option value="Prosthodontics" />
        <option value="Impression Materials" />
        <option value="Infection Control" />
        <option value="Medicines / Pharmaceuticals" />
        <option value="Surgical Supplies" />
        <option value="Disposables" />
        <option value="Equipment Spares" />
      </datalist>

      <datalist id="inventory-items">
        <option value="Alginate Impression Material" />
        <option value="Composite Resin (A2/A3)" />
        <option value="Glass Ionomer Cement (GIC)" />
        <option value="Local Anesthesia Lignocaine" />
        <option value="Sodium Hypochlorite (NaOCl)" />
        <option value="Gutta Percha (GP) Points" />
        <option value="Paper Points" />
        <option value="K-Files (15-40)" />
        <option value="H-Files" />
        <option value="Rotary Files (NiTi)" />
        <option value="Etchant Gel (Phosphoric Acid)" />
        <option value="Bonding Agent" />
        <option value="Zinc Oxide Eugenol (ZOE)" />
        <option value="Calcium Hydroxide" />
        <option value="Formocresol" />
        <option value="Surgical Gloves (Box)" />
        <option value="Examination Gloves (Box)" />
        <option value="Face Masks (3-Ply)" />
        <option value="Patient Drapes" />
        <option value="Suction Tips" />
        <option value="Cotton Rolls" />
        <option value="Gauze Pieces" />
        <option value="Syringes & Needles" />
        <option value="Endo Motor Blades" />
        <option value="Ultrasonic Scaler Tips" />
        <option value="Polishing Paste" />
        <option value="Articulating Paper" />
        <option value="X-Ray Films (IOPA)" />
        <option value="Burs (Diamond/Carbide)" />
      </datalist>

      <datalist id="inventory-units">
        <option value="pcs" />
        <option value="boxes" />
        <option value="bottles" />
        <option value="packets" />
        <option value="kits" />
        <option value="tubes" />
        <option value="rolls" />
        <option value="liters" />
      </datalist>
    </div>
  );
};

export default Inventory;
