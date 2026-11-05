import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Building2, ShoppingCart, Package, 
  Edit, Trash2, Plus, ClipboardList, Settings, Shield 
} from 'lucide-react';
import Layout from '../components/Layout';
import { AUTH_API, PRODUCT_API, ORDER_API } from '../api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // ۱. دریافت اطلاعات کاربر
        const userRes = await fetch(`${AUTH_API}/users/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!userRes.ok) throw new Error('Unauthorized');
        const userData = await userRes.json();
        setUser(userData);

        // ۲. دریافت سفارشات خریدار
        const myOrdersRes = await fetch(`${ORDER_API}/orders/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (myOrdersRes.ok) setMyOrders(await myOrdersRes.json());

        // ۳. اگر فروشنده بود
        if (userData.is_supplier) {
          const myProductsRes = await fetch(`${PRODUCT_API}/products/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (myProductsRes.ok) setMyProducts(await myProductsRes.json());

          const supplierOrdersRes = await fetch(`${ORDER_API}/orders/supplier`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (supplierOrdersRes.ok) setSupplierOrders(await supplierOrdersRes.json());
        }
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate, token]);

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    try {
      const response = await fetch(`${PRODUCT_API}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMyProducts(myProducts.filter(p => p.id !== productId));
        alert("محصول با موفقیت حذف شد.");
      } else {
        alert("خطا در حذف محصول.");
      }
    } catch (err) {
      alert("خطا در ارتباط با سرور.");
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${ORDER_API}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setSupplierOrders(supplierOrders.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
        alert('وضعیت سفارش با موفقیت تغییر کرد.');
      } else {
        alert('خطا در تغییر وضعیت سفارش.');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور.');
    }
  };

  if (error) return <Layout><div className="text-center mt-20 text-red-600 font-medium">{error}</div></Layout>;
  if (!user) return <Layout><div className="text-center mt-20 text-slate-600 font-medium">در حال بارگذاری پنل...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-6">
        
        {/* سایدبار منو */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sticky top-24">
            <div className="mb-6 p-4 bg-slate-50 rounded-xl flex items-center gap-3">
              <div className="bg-teal-100 p-2 rounded-lg">
                {user.is_supplier ? <Building2 size={20} className="text-teal-700" /> : <User size={20} className="text-teal-700" />}
              </div>
              <div>
                <span className="text-xs text-slate-500 block">نوع حساب</span>
                <span className="font-bold text-slate-800 text-sm">{user.is_supplier ? 'فروشنده' : 'خریدار'}</span>
              </div>
            </div>

            <nav className="space-y-2">
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'profile' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <User size={18} /> اطلاعات حساب
              </button>
              
              <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <ShoppingCart size={18} /> سفارشات من
              </button>

              {user.is_supplier && (
                <>
                  <div className="pt-4 pb-1"><span className="text-xs font-bold text-slate-400 px-4">بخش فروشندگی</span></div>
                  <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'products' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <Package size={18} /> محصولات من
                  </button>
                  <button onClick={() => setActiveTab('supplierOrders')} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${activeTab === 'supplierOrders' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                    <ClipboardList size={18} /> سفارشات دریافتی
                  </button>
                  <Link to="/add-product" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 transition mt-2">
                    <Plus size={18} /> افزودن محصول
                  </Link>
                </>
              )}

              {/* دکمه پنل مدیریت (فقط برای ادمین) */}
              {user.is_admin && (
                <div className="pt-4 mt-2 border-t border-slate-100">
                  <Link to="/admin" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition">
                    <Shield size={18} /> ورود به پنل مدیریت
                  </Link>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 mt-4">
                <Link to="/settings" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                  <Settings size={18} /> تنظیمات سایت
                </Link>
              </div>
            </nav>
          </div>
        </aside>

        {/* محتوای اصلی */}
        <div className="flex-1">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
            
            {/* تب اطلاعات حساب */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">اطلاعات حساب شما</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-sm text-slate-500 block mb-1">ایمیل سازمانی</span>
                    <span className="font-semibold text-slate-800" dir="ltr">{user.email}</span>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-sm text-slate-500 block mb-1">نوع حساب</span>
                    <span className="font-semibold text-slate-800">
                      {user.is_admin ? 'مدیر سامانه' : user.is_supplier ? 'تأمین‌کننده / فروشنده' : 'خریدار / محقق'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* تب سفارشات من */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">سفارشات من</h2>
                {myOrders.length === 0 ? (
                  <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-lg">هنوز سفارشی ثبت نکرده‌اید.</p>
                ) : (
                  <div className="space-y-3">
                    {myOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <span className="font-bold text-slate-800 block">{order.product_title}</span>
                          <span className="text-xs text-slate-500">{order.created_at} | شناسه سفارش: {order.id}</span>
                        </div>
                        <div className="text-left">
                          <span className="text-teal-700 font-bold block">{order.price} تومان</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'در انتظار پرداخت' ? 'bg-yellow-100 text-yellow-700' : 
                            order.status === 'پرداخت شده' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'ارسال شده' ? 'bg-teal-100 text-teal-700' : 
                            'bg-green-100 text-green-700'
                          }`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* تب محصولات من (فقط فروشنده) */}
            {activeTab === 'products' && user.is_supplier && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">محصولات من</h2>
                {myProducts.length === 0 ? (
                  <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-lg">هنوز محصولی ثبت نکرده‌اید.</p>
                ) : (
                  <div className="space-y-3">
                    {myProducts.map((product) => (
                      <div key={product.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <span className="font-bold text-slate-800 block">{product.title}</span>
                          <span className="text-xs text-slate-500">گونه: {product.species} | {product.price} تومان</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => alert('ویرایش در نسخه بعدی')} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="ویرایش">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="حذف">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* تب سفارشات دریافتی (فقط فروشنده) */}
            {activeTab === 'supplierOrders' && user.is_supplier && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">سفارشات دریافتی</h2>
                {supplierOrders.length === 0 ? (
                  <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-lg">هنوز سفارشی برای محصولات شما ثبت نشده است.</p>
                ) : (
                  <div className="space-y-3">
                    {supplierOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <span className="font-bold text-slate-800 block">{order.product_title}</span>
                          <span className="text-xs text-slate-500">خریدار: {order.buyer_email} | {order.created_at}</span>
                        </div>
                        <div className="text-left flex flex-col items-end gap-2">
                          <span className="text-teal-700 font-bold block">{order.price} تومان</span>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            className="text-xs bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value="در انتظار پرداخت">در انتظار پرداخت</option>
                            <option value="پرداخت شده">پرداخت شده</option>
                            <option value="ارسال شده">ارسال شده</option>
                            <option value="تحویل داده شده">تحویل داده شده</option>
                            <option value="لغو شده">لغو شده</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </Layout>
  );
}