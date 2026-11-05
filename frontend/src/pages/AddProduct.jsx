import { useState } from 'react';
import { PRODUCT_API } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Dna, CheckCircle } from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    species: '',
    description: '',
    price: ''
  });
  const [coaFile, setCoaFile] = useState(null);
  const [fastaFile, setFastaFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('لطفاً ابتدا وارد شوید.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('species', formData.species);
    data.append('description', formData.description);
    data.append('price', formData.price);
    if (coaFile) data.append('coa_file', coaFile);
    if (fastaFile) data.append('fasta_file', fastaFile);

    try {
      // استفاده از بک‌تیک برای آدرس API
      const response = await fetch(`${PRODUCT_API}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (response.ok) {
        setMessage('محصول با موفقیت ثبت شد! 🎉');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        const errorData = await response.json();
        setMessage(`خطا: ${errorData.detail || 'مشکلی پیش آمد'}`);
      }
    } catch (error) {
      setMessage('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      <header className="bg-white border-b border-slate-200 py-4 px-8 flex items-center gap-4 sticky top-0 z-50">
        <Link to="/dashboard" className="text-slate-500 hover:text-teal-700 transition">
          <ArrowRight size={24} />
        </Link>
        <h1 className="text-lg font-bold text-slate-800">ثبت محصول ژنتیکی جدید</h1>
      </header>

      <main className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
            <div className="bg-teal-50 p-3 rounded-xl">
              <Dna size={32} className="text-teal-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">اطلاعات محصول</h2>
              <p className="text-sm text-slate-500">لطفاً مشخصات علمی و فنی محصول را دقیق وارد کنید.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">نام محصول / سویه</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                placeholder="مثال: سویه باکتریایی BL21 (DE3)" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">گونه (Species)</label>
              <input type="text" name="species" required value={formData.species} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                placeholder="مثال: Escherichia coli" dir="ltr" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">توضیحات علمی</label>
              <textarea name="description" required value={formData.description} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition resize-none"
                rows="4" placeholder="توضیحات، ویژگی‌ها و کاربردهای محصول..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">قیمت (تومان)</label>
              <input type="text" name="price" required value={formData.price} onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
                placeholder="مثال: ۱۵,۰۰۰,۰۰۰" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">برگه آنالیز (COA) - PDF</label>
                <input type="file" accept=".pdf" onChange={(e) => setCoaFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">توالی FASTA - TXT</label>
                <input type="file" accept=".txt,.fasta,.fa" onChange={(e) => setFastaFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white py-3 rounded-lg hover:bg-teal-800 transition font-medium text-lg disabled:opacity-50">
              {loading ? 'در حال ثبت...' : <><CheckCircle size={20} /> ثبت نهایی محصول</>}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center font-medium ${message.includes('موفقیت') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}