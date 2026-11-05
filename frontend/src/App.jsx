import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import Products from './pages/Products';
import Settings from './pages/Settings'; 
import AdminDashboard from './pages/AdminDashboard';
import SellerSettings from './pages/SellerSettings';
import BuyerSettings from './pages/BuyerSettings';
import About from './pages/About';
import Contact from './pages/Contact';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/add-product" element={<AddProduct />} />
		<Route path="/settings" element={<Settings />} />
		<Route path="/admin" element={<AdminDashboard />} />
		<Route path="/seller-settings" element={<SellerSettings />} />
        <Route path="/buyer-settings" element={<BuyerSettings />} />
		<Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Router>
  );
}

export default App;