import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Save, Image as ImageIcon, Shield } from 'lucide-react';
import Layout from '../components/Layout';
import { SETTINGS_API, AUTH_API } from '../api';

export default function Settings() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    company_name: '',
    about_us: '',
    contact_us: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // بررسی دسترسی ادمین
    fetch(`${AUTH_API}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.is_admin) {
          alert("شما دسترسی به تنظیمات کل سامانه را ندارید.");
          navigate('/dashboard');
        } else {
          setIsAuthorized(true);
          // دریافت تنظیمات فعلی
          fetch(`${SETTINGS_API}/settings`)
            .then(res => res.json())
            .then(data => {
              setFormData({
                company_name: data.company_name || '',
                about_us: data.about_us || '',
                contact_us: data.contact_us || '',
              });
              setCurrentLogo(data.logo_url);
            });
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('company_name', formData.company_name);
    data.append('about_us', formData.about_us);
    data.append('contact_us', formData.contact_us);
    if (logoFile) data.append('logo_file', logoFile);

    try {
      const response = await fetch(`${SETTINGS_API}/settings`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      if (response.ok) {
        const updatedData = await response.json();
        setCurrentLogo(updatedData.logo_url);
        setMessage('تنظیمات با موفقیت ذخیره شد! 🎉');
      } else {
        setMessage('خطا در ذخیره تنظیمات.');
      }
    } catch (err) {
      setMessage('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) return <Layout><div className="text-center mt-20 text-slate-600">در حال بررسی دسترسی...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
            <div className="bg-slate-800 p-3 rounded-xl">
              <Shield size={32} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">تنظیمات کل سامانه</h2>
              <p className="text-sm text-slate-500">این بخش فقط برای مدیر سامانه قابل دسترسی است.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* لوگو */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">لوگوی شرکت</label>
              <div className="flex items-center gap-4 mb-2">
                {currentLogo ? (
                  <img src={currentLogo} alt="Logo" className="h-16 w-16 object-contain border rounded-lg p-1 bg-slate-50" />
                ) : (
                  <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><ImageIcon size={24} /></div>
                )}
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
              </div>
            </div>

            {/* نام شرکت */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">نام شرکت</label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" required />
            </div>

            {/* درباره ما */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">متن درباره ما</label>
              <textarea name="about_us" value={formData.about_us} onChange={handleChange} rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition resize-none" required></textarea>
            </div>

            {/* ارتباط با ما */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">متن ارتباط با ما</label>
              <textarea name="contact_us" value={formData.contact_us} onChange={handleChange} rows="4"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition resize-none" required></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-900 transition font-medium text-lg disabled:opacity-50">
              {loading ? 'در حال ذخیره...' : <><Save size={20} /> ذخیره تغییرات</>}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center font-medium ${message.includes('موفقیت') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}