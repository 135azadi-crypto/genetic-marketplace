import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AUTH_API } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('در حال ورود...');

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      // استفاده از AUTH_API به جای آدرس هاردکد شده
      const response = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        setMessage('ورود موفقیت‌آمیز بود! 🎉 در حال انتقال...');
        
        setTimeout(async () => {
          const token = localStorage.getItem('token');
          // استفاده از AUTH_API برای دریافت اطلاعات کاربر
          const res = await fetch(`${AUTH_API}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const user = await res.json();
          if (user.is_admin) navigate('/admin');
          else navigate('/dashboard');
        }, 1500);

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
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">ورود به سامانه</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
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
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
            ورود
          </button>
        </form>

        {message && <div className={`mt-4 text-center text-sm ${message.includes('موفقیت') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
        
        <div className="mt-6 text-center text-sm text-gray-600">
          حساب کاربری ندارید؟ <Link to="/register" className="text-blue-600 hover:underline">ثبت‌نام کنید</Link>
        </div>
      </div>
    </div>
  );
}