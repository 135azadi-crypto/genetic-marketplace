import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Dna, FileText, Plus, ShoppingCart } from 'lucide-react';
import Layout from '../components/Layout';
import { PRODUCT_API, ANNOTATION_API, ORDER_API } from '../api';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [noteLoading, setNoteLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await fetch(`${PRODUCT_API}/products/${id}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProduct(productData);
        } else {
          setError('محصول مورد نظر یافت نشد.');
        }

        const annotationsResponse = await fetch(`${ANNOTATION_API}/annotations/${id}`);
        if (annotationsResponse.ok) {
          const annotationsData = await annotationsResponse.json();
          setAnnotations(annotationsData);
        }
      } catch (err) {
        setError('خطا در ارتباط با سرور');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert("برای ثبت حاشیه‌نویسی ابتدا باید وارد شوید.");
      return;
    }

    setNoteLoading(true);
    try {
      const response = await fetch(`${ANNOTATION_API}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ product_id: id, content: newNote })
      });

      if (response.ok) {
        const addedNote = await response.json();
        setAnnotations([addedNote, ...annotations]);
        setNewNote('');
      } else {
        alert("خطا در ثبت یادداشت. لطفاً دوباره وارد شوید.");
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور");
    } finally {
      setNoteLoading(false);
    }
  };

  const handleBuy = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("برای خرید ابتدا باید وارد شوید.");
      return;
    }

    try {
      const response = await fetch(`${ORDER_API}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          product_id: parseInt(id),
          product_title: product.title,
          price: product.price
        })
      });

      if (response.ok) {
        alert("سفارش شما با موفقیت ثبت شد! 🎉");
        window.location.href = '/dashboard';
      } else {
        const data = await response.json();
        alert(`خطا: ${data.detail || 'مشکلی پیش آمد'}`);
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور");
    }
  };

  if (loading) return <Layout><div className="text-center mt-20 text-slate-600">در حال بارگذاری اطلاعات محصول...</div></Layout>;
  if (error) return <Layout><div className="text-center mt-20 text-red-600 font-medium">{error}</div></Layout>;
  if (!product) return null;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-10 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ستون سمت راست: اطلاعات محصول */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
              <div className="bg-teal-50 p-4 rounded-xl">
                <Dna size={40} className="text-teal-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">{product.title}</h2>
                <p className="text-slate-500 text-sm">شناسه محصول: {product.id} | تأمین‌کننده: {product.supplier_email}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-4">مشخصات فنی و علمی</h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="bg-slate-50 p-3 rounded-lg"><span className="text-slate-500 block mb-1">گونه (Species):</span> <span className="font-semibold text-slate-800">{product.species}</span></div>
              <div className="bg-slate-50 p-3 rounded-lg"><span className="text-slate-500 block mb-1">قیمت:</span> <span className="font-semibold text-slate-800">{product.price} تومان</span></div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">توضیحات محصول</h3>
            <p className="text-slate-600 leading-relaxed mb-6 bg-slate-50 p-4 rounded-lg">{product.description}</p>

            <h3 className="text-lg font-bold text-slate-800 mb-4">مدارک و ضمائم</h3>
            <div className="flex gap-4 mb-6">
              {product.coa_filename ? (
                <a href={`${PRODUCT_API}/uploads/${product.coa_filename}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-sm font-medium text-teal-700 transition">
                  <FileText size={18} /> دانلود برگه آنالیز (COA)
                </a>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed"><FileText size={18} /> COA ثبت نشده</span>
              )}

              {product.fasta_filename ? (
                <a href={`${PRODUCT_API}/uploads/${product.fasta_filename}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg text-sm font-medium text-teal-700 transition">
                  <FileText size={18} /> دانلود توالی FASTA
                </a>
              ) : (
                <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed"><FileText size={18} /> توالی ثبت نشده</span>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button onClick={handleBuy} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium text-lg shadow-sm">
                <ShoppingCart size={20} />
                ثبت سفارش و خرید
              </button>
            </div>
          </div>
        </div>

        {/* ستون سمت چپ: حاشیه‌نویسی‌ها */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-24">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-700 p-1.5 rounded-lg">📝</span>
            حاشیه‌نویسی و یادداشت‌های علمی
          </h3>
          
          <form onSubmit={handleAddNote} className="mb-6">
            <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="یادداشت، تحلیل یا سوال علمی خود را بنویسید..." className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none text-sm bg-slate-50 focus:bg-white transition" rows="3"></textarea>
            <button type="submit" disabled={noteLoading} className="mt-2 w-full flex items-center justify-center gap-2 bg-teal-700 text-white py-2 rounded-lg hover:bg-teal-800 transition text-sm font-medium disabled:opacity-50">
              <Plus size={16} /> {noteLoading ? 'در حال ثبت...' : 'ثبت حاشیه‌نویسی'}
            </button>
          </form>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {annotations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">هنوز یادداشتی برای این محصول ثبت نشده است.</p>
            ) : (
              annotations.map((note) => (
                <div key={note.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800 text-xs" dir="ltr">{note.user_email}</span>
                    <span className="text-xs text-slate-400">{note.created_at}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-sm">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </Layout>
  );
}