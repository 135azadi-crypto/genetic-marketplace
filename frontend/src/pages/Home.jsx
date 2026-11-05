import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dna, Search, ArrowLeft, ShieldCheck, Activity } from 'lucide-react';
import Layout from '../components/Layout';
import { PRODUCT_API } from '../api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${PRODUCT_API}/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.slice(0, 3)); // فقط ۳ محصول آخر را در صفحه اصلی نشان بده
        }
      } catch (error) {
        console.error("خطا در دریافت محصولات:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Layout>
      {/* بخش Hero */}
      <div className="relative bg-white overflow-hidden border-b border-slate-200">
        <div className="max-w-6xl mx-auto py-20 px-8 text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-6 border border-teal-100">
            مرجع تخصصی داده‌ها و محصولات ژنتیکی کشور
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            بازار هوشمند <span className="text-teal-700">محصولات و داده‌های ژنتیکی</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            بستری امن و علمی برای جستجو، تحلیل، حاشیه‌نویسی و تأمین سویه‌ها، پلاسمیدها و خدمات ژنتیکی.
          </p>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const term = e.target.search.value;
              window.location.href = `/products?search=${encodeURIComponent(term)}`;
            }}
            className="max-w-2xl mx-auto flex bg-white rounded-xl shadow-lg p-2 border border-slate-200 focus-within:ring-2 focus-within:ring-teal-500 transition-all"
          >
            <input type="text" name="search" placeholder="جستجوی گونه، سویه، توالی یا نام محصول..." 
              className="flex-1 px-4 py-3 outline-none text-slate-700 bg-transparent" />
            <button type="submit" className="bg-teal-700 text-white px-6 py-3 rounded-lg hover:bg-teal-800 transition flex items-center gap-2">
              <Search size={20} />
              <span>جستجو</span>
            </button>
          </form>
        </div>
      </div>

      {/* بخش ویژگی‌ها */}
      <div className="py-16 px-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition text-center">
          <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} className="text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">امنیت و اصالت</h3>
          <p className="text-slate-600 leading-relaxed text-sm">تضمین اصالت مواد ژنتیکی، رهگیری منشأ و رعایت استانداردهای امنیت زیستی.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition text-center">
          <div className="bg-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Activity size={32} className="text-teal-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">حاشیه‌نویسی علمی</h3>
          <p className="text-slate-600 leading-relaxed text-sm">امکان ثبت یادداشت‌های علمی و تحلیل‌های محققان روی هر محصول.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition text-center">
          <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Dna size={32} className="text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3">تنوع محصولات</h3>
          <p className="text-slate-600 leading-relaxed text-sm">دسترسی به هزاران سویه، پلاسمید و خدمات توالی‌یابی از معتبرترین مراکز.</p>
        </div>
      </div>

      {/* بخش آخرین محصولات */}
      <div className="py-16 px-8 max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 mb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">آخرین محصولات ثبت‌شده</h2>
            <p className="text-slate-500 text-sm">جدیدترین محصولات ژنتیکی اضافه‌شده به پلتفرم</p>
          </div>
          <Link to="/products" className="text-teal-700 font-medium hover:underline flex items-center gap-1 text-sm">
            مشاهده همه <ArrowLeft size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-10">در حال بارگذاری محصولات...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500">هنوز محصولی ثبت نشده است.</p>
            <Link to="/register" className="inline-block mt-4 bg-teal-700 text-white px-6 py-2 rounded-lg">ثبت‌نام فروشنده</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-teal-50 p-3 rounded-xl"><Dna size={24} className="text-teal-700" /></div>
                  <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{product.species}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1">{product.title}</h3>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10">{product.description}</p>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-teal-700 font-bold">{product.price} تومان</span>
                  <Link to={`/product/${product.id}`} className="text-sm text-blue-600 hover:underline">جزئیات</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}