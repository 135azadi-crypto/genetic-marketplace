import Layout from '../components/Layout';
import { Info } from 'lucide-react';

export default function About() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <Info size={64} className="mx-auto text-teal-600 mb-6" />
        <h1 className="text-3xl font-bold text-slate-800 mb-6">درباره پلتفرم جامع ژنتیک</h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-6">
          این پلتفرم به عنوان مرجع تخصصی داده‌ها و محصولات ژنتیکی کشور، با هدف تسهیل ارتباط میان تأمین‌کنندگان محصولات بیوتکنولوژی و محققان، خریداران و شرکت‌های دانش‌بنیان راه‌اندازی شده است.
        </p>
        <p className="text-lg text-slate-600 leading-relaxed">
          ما با تمرکز بر امنیت، اصالت داده‌ها و حاشیه‌نویسی علمی، بستری فراهم کرده‌ایم تا تمامی فعالان حوزه ژنتیک بتوانند محصولات و نیازهای خود را به سادگی به اشتراک بگذارند.
        </p>
      </div>
    </Layout>
  );
}