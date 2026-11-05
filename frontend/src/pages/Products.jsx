import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Dna, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { PRODUCT_API } from '../api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (query = '') => {
    setLoading(true);
    try {
      const url = query ? `${PRODUCT_API}/products?search=${encodeURIComponent(query)}` : `${PRODUCT_API}/products`;
      const response = await fetch(url);
      if (response.ok) setProducts(await response.json());
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchTerm(query);
    fetchProducts(query);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchTerm });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">همه محصولات ژنتیکی</h2>
            <p className="text-slate-500 text-sm">جستجو در میان محصولات ثبت‌شده</p>
          </div>
          <form onSubmit={handleSearch} className="flex w-full md:w-96 bg-white rounded-lg shadow-sm border border-slate-200 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="نام محصول یا گونه..." className="flex-1 px-4 py-2 outline-none rounded-r-lg text-slate-700 bg-transparent" />
            <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded-l-lg hover:bg-teal-800 transition"><Search size={20} /></button>
          </form>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-10">در حال جستجو...</div>
        ) : products.length === 0 ? (
          <div className="text-center bg-white border border-slate-200 rounded-2xl py-16 px-4">
            <Search size={40} className="text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700 mb-2">محصولی یافت نشد</h3>
            <button onClick={() => { setSearchTerm(''); setSearchParams({}); }} className="mt-4 text-teal-700 hover:underline">نمایش همه محصولات</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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