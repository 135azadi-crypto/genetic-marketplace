import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_API } from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSupplier, setIsSupplier] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('در حال ثبت‌نام...');

    try {
      // تغییر اصلی اینجاست: استفاده از بک‌تیک به جای کوتیشن
      const response = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, is_supplier: isSupplier }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('ثبت‌نام با موفقیت انجام شد! در حال انتقال به صفحه ورود...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(`خطا: ${data.detail || 'مشکلی پیش آمد'}`);
      }
    } catch (error) {
      setMessage('خطا در ارتباط با سرور');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ثبت‌نام در سامانه</h2>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="example@email.com" required dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••" required dir="ltr" />
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="supplier" checked={isSupplier} onChange={(e) => setIsSupplier(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
            <label htmlFor="supplier" className="text-sm text-gray-700 cursor-pointer">
              من یک تأمین‌کننده / فروشنده هستم
            </label>
          </div>

          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-medium mt-4">
            ثبت‌نام
          </button>
        </form>

        {message && <div className={`mt-4 text-center text-sm ${message.includes('موفقیت') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
        
        <div className="mt-6 text-center text-sm text-gray-600">
          قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login" className="text-blue-600 hover:underline">وارد شوید</Link>
        </div>
      </div>
    </div>
  );
}