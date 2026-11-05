import { Link, useNavigate } from 'react-router-dom';
import { Dna, User, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SETTINGS_API, AUTH_API } from '../api';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [siteSettings, setSiteSettings] = useState({ company_name: 'پلتفرم جامع ژنتیک', logo_url: '', about_us: '', contact_us: '' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // دریافت تنظیمات سایت
    fetch(`${SETTINGS_API}/settings`)
      .then(res => res.json())
      .then(data => setSiteSettings(data))
      .catch(err => console.error(err));

    // بررسی وضعیت لاگین
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans" dir="rtl">
      {/* هدر سراسری */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <Link to="/" className="flex items-center gap-3 text-teal-700 hover:opacity-80 transition">
          <div className="bg-teal-100 p-2 rounded-lg">
            {siteSettings.logo_url ? (
              <img src={siteSettings.logo_url} alt="Logo" className="h-7 w-7 object-contain" />
            ) : (
              <Dna size={28} className="text-teal-700" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">{siteSettings.company_name}</h1>
            <span className="text-xs text-slate-500 font-medium">ستاد توسعه زیست‌فناوری</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-slate-600 hover:text-teal-700 font-medium transition">صفحه اصلی</Link>
          <Link to="/products" className="text-slate-600 hover:text-teal-700 font-medium transition">محصولات</Link>
          <Link to="/about" className="text-slate-600 hover:text-teal-700 font-medium transition">درباره ما</Link>
          <Link to="/contact" className="text-slate-600 hover:text-teal-700 font-medium transition">ارتباط با ما</Link>
        </nav>

        <div className="flex gap-3">
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="px-4 py-2 text-teal-700 font-medium hover:bg-teal-50 rounded-lg transition flex items-center gap-2">
                <User size={18} /> پنل کاربری
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition flex items-center gap-2">
                <LogOut size={18} /> خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-5 py-2 text-teal-700 font-medium hover:bg-teal-50 rounded-lg transition">ورود</Link>
              <Link to="/register" className="px-5 py-2 bg-teal-700 text-white font-medium rounded-lg hover:bg-teal-800 transition shadow-sm">ثبت‌نام</Link>
            </>
          )}
        </div>
      </header>

      {/* محتوای اصلی */}
      <main className="flex-1">
        {children}
      </main>

      {/* فوتر سراسری */}
      <footer className="bg-slate-800 text-slate-300 py-12 mt-10">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2"><Dna size={20} /> {siteSettings.company_name}</h3>
            <p className="leading-relaxed text-sm text-slate-400">بستری امن و علمی برای جستجو، تحلیل، حاشیه‌نویسی و تأمین محصولات ژنتیکی.</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">درباره ما</h3>
            <p className="leading-relaxed text-sm text-slate-400">{siteSettings.about_us || 'متنی ثبت نشده است.'}</p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">ارتباط با ما</h3>
            <p className="leading-relaxed text-sm text-slate-400">{siteSettings.contact_us || 'متنی ثبت نشده است.'}</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-8 mt-8 pt-8 border-t border-slate-700 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} {siteSettings.company_name} - تمامی حقوق محفوظ است.
        </div>
      </footer>
    </div>
  );
}