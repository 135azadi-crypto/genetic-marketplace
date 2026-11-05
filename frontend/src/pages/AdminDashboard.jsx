import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Package, ShoppingCart, Settings, LogOut, Shield, UserPlus, Trash2, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSupplier, setIsSupplier] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [usersRes, productsRes, ordersRes, logsRes] = await Promise.all([
        fetch('http://127.0.0.1:8001/admin/users', { headers }),
        fetch('http://127.0.0.1:8002/admin/products', { headers }),
        fetch('http://127.0.0.1:8003/admin/orders', { headers }),
        fetch('http://127.0.0.1:8002/admin/logs', { headers })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (err) {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchData();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormMessage('');
    try {
      const response = await fetch('http://127.0.0.1:8001/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: newEmail, password: newPassword, is_supplier: isSupplier })
      });
      if (response.ok) {
        setFormMessage('کاربر با موفقیت اضافه شد!');
        setNewEmail(''); setNewPassword(''); setIsSupplier(false);
        fetchData();
      } else {
        const data = await response.json();
        setFormMessage(`خطا: ${data.detail}`);
      }
    } catch (err) { setFormMessage('خطا در ارتباط با سرور.'); }
  };

  const handleUpdateRole = async (userId, newRole) => {
    let payload = {};
    if (newRole === 'supplier') payload = { is_supplier: true, is_admin: false };
    else if (newRole === 'admin') payload = { is_supplier: true, is_admin: true };
    else payload = { is_supplier: false, is_admin: false };

    try {
      const response = await fetch(`http://127.0.0.1:8001/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (response.ok) fetchData();
      else alert("خطا در تغییر نقش.");
    } catch (err) { alert("خطا در سرور."); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8001/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchData();
      else alert("امکان حذف این کاربر وجود ندارد.");
    } catch (err) { alert("خطا در سرور."); }
  };

  if (loading) return <div className="text-center mt-20 text-slate-600">در حال بارگذاری...</div>;
  if (error) return <div className="text-center mt-20 text-red-600 font-bold">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-100 font-sans" dir="rtl">
      <header className="bg-slate-800 text-white py-4 px-8 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Shield size={28} className="text-teal-400" />
          <h1 className="text-xl font-bold">پنل مدیریت سامانه</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/40 transition text-sm font-medium">
          <LogOut size={16} /> خروج
        </button>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-6">
        {/* سایدبار */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-24">
            <nav className="space-y-2">
              <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'users' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Users size={18} /> مدیریت کاربران
              </button>
              <button onClick={() => setActiveTab('add-user')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'add-user' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <UserPlus size={18} /> افزودن کاربر / نمایندگی
              </button>
              <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'products' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Package size={18} /> محصولات
              </button>
              <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <ShoppingCart size={18} /> سفارشات
              </button>
              <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'logs' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Activity size={18} /> لاگ‌های سیستم
              </button>
              <div className="pt-4 border-t border-slate-100 mt-4">
                <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  <Settings size={18} /> تنظیمات سایت
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* محتوا */}
        <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
          
          {/* تب مدیریت کاربران */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">لیست کاربران</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right text-slate-600">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 rounded-r-lg">شناسه</th>
                      <th className="px-4 py-3">ایمیل</th>
                      <th className="px-4 py-3">نقش فعلی</th>
                      <th className="px-4 py-3">تغییر نقش</th>
                      <th className="px-4 py-3 rounded-l-lg">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3">{u.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-800" dir="ltr">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${u.is_admin ? 'bg-purple-100 text-purple-700' : u.is_supplier ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.is_admin ? 'مدیر' : u.is_supplier ? 'فروشنده' : 'خریدار'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={u.is_admin ? 'admin' : u.is_supplier ? 'supplier' : 'buyer'}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="text-xs border border-slate-200 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value="buyer">خریدار</option>
                            <option value="supplier">فروشنده</option>
                            <option value="admin">مدیر</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 p-1" title="حذف کاربر">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* تب افزودن کاربر */}
          {activeTab === 'add-user' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">افزودن کاربر / نمایندگی جدید</h2>
              <form onSubmit={handleAddUser} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">رمز عبور</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" dir="ltr" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="checkbox" id="supplier-check" checked={isSupplier} onChange={(e) => setIsSupplier(e.target.checked)} className="w-4 h-4 text-teal-600 rounded" />
                  <label htmlFor="supplier-check" className="text-sm text-slate-700 cursor-pointer">این کاربر یک نمایندگی/فروشنده است</label>
                </div>
                <button type="submit" className="bg-teal-700 text-white px-6 py-2 rounded-lg hover:bg-teal-800 transition font-medium mt-4">ثبت کاربر</button>
              </form>
              {formMessage && <p className="mt-4 text-sm font-medium text-teal-600 bg-teal-50 p-3 rounded-lg">{formMessage}</p>}
            </div>
          )}

          {/* تب محصولات */}
          {activeTab === 'products' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">محصولات سامانه</h2>
              <div className="grid gap-3">
                {products.length === 0 ? <p className="text-slate-500 bg-slate-50 p-4 rounded-lg">محصولی وجود ندارد.</p> : products.map(p => (
                  <div key={p.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{p.title}</span>
                      <span className="text-xs text-slate-500">گونه: {p.species} | فروشنده: {p.supplier_email}</span>
                    </div>
                    <span className="text-teal-700 font-bold">{p.price} تومان</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تب سفارشات */}
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">سفارشات سامانه</h2>
              <div className="grid gap-3">
                {orders.length === 0 ? <p className="text-slate-500 bg-slate-50 p-4 rounded-lg">سفارشی ثبت نشده است.</p> : orders.map(o => (
                  <div key={o.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 block">{o.product_title}</span>
                      <span className="text-xs text-slate-500">خریدار: {o.buyer_email} | {o.created_at}</span>
                    </div>
                    <span className="text-teal-700 font-bold">{o.price} تومان</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* تب لاگ‌ها */}
          {activeTab === 'logs' && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">لاگ‌های سیستم</h2>
              <div className="grid gap-2">
                {logs.length === 0 ? <p className="text-slate-500 bg-slate-50 p-4 rounded-lg">لاگی ثبت نشده است.</p> : logs.map(l => (
                  <div key={l.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm flex justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{l.action}</span>
                      <span className="text-slate-600 mr-2">({l.user_email})</span>
                      <p className="text-xs text-slate-500 mt-1">{l.details}</p>
                    </div>
                    <span className="text-xs text-slate-400" dir="ltr">{l.created_at}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}