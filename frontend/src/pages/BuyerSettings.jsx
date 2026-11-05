import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Save, User } from 'lucide-react';
import Layout from '../components/Layout';
import { AUTH_API } from '../api';

export default function SellerSettings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ company_name: '', phone: '', address: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetch(`${AUTH_API}/Users/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setFormData({ company_name: data.company_name || '', phone: data.phone || '', address: data.address || '' }));
  }, [navigate, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${AUTH_API}/Users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (response.ok) setMessage('اطلاعات فروشندگی با موفقیت ذخیره شد.');
      else setMessage('خطا در ذخیره اطلاعات.');
    } catch (err) { setMessage('خطا در ارتباط با سرور.'); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <User className="text-teal-700" /> تنظیمات پروفایل فروشندگی
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">نام شرکت / فروشگاه</label>
              <input type="text" value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">شماره تماس</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">آدرس</label>
              <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none resize-none"></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition">
              {loading ? 'در حال ذخیره...' : <><Save size={18} /> ذخیره اطلاعات</>}
            </button>
          </form>
          {message && <p className="mt-4 text-center text-sm font-medium text-teal-600 bg-teal-50 p-3 rounded-lg">{message}</p>}
        </div>
      </div>
    </Layout>
  );
}