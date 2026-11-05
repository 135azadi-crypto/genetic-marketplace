import Layout from '../components/Layout';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">ارتباط با ما</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-10">
          برای هرگونه سوال، پیشنهاد یا همکاری، می‌توانید از راه‌های زیر با ما در ارتباط باشید.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <Phone size={32} className="mx-auto text-teal-600 mb-4" />
            <h3 className="font-bold text-slate-800 mb-2">تلفن تماس</h3>
            <p className="text-slate-600" dir="ltr">021-12345678</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <Mail size={32} className="mx-auto text-teal-600 mb-4" />
            <h3 className="font-bold text-slate-800 mb-2">ایمیل</h3>
            <p className="text-slate-600" dir="ltr">info@genetic.ir</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <MapPin size={32} className="mx-auto text-teal-600 mb-4" />
            <h3 className="font-bold text-slate-800 mb-2">آدرس</h3>
            <p className="text-slate-600 text-sm">تهران، خیابان ولیعصر، ستاد توسعه زیست‌فناوری</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}