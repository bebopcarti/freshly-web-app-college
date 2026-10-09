import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';

// Page Imports ~
import DynamicHeader from './header/DynamicHeader.js';
import AdminHeader from './header/AdminHeader.js';
import Header from './header/Header.js';
import Header2 from './header/Header2.js';
import Footer from './footer/Footer.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import About from './pages/About.js';
import Home from './pages/Home.js';
import Store from './pages/Store.js';
import Cart from './pages/Cart.js';
import Transaction from './pages/Transaction.js';
import Progress from './pages/Progress.js';
import TransactionHistory from './pages/TransactionHistory.js';
import Admin from './pages/Admin.js';
import Details from './pages/Details.js';
// ------------ ~

import './App.css'; // Main CSS (bisa override CSS page)

function HomeOrAdmin() {
  const { user } = useAuth();

  return (
    <>
      <DynamicHeader />

      {user && user.role === 'admin' ? (
        <>
          <Admin />
        </>
      ) : (
        <>
          <Home />
        </>
      )}

      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          
          <Routes>
            <Route path="/login" element={<><Header2/><Login /></>} />
            <Route path="/register" element={<><Header2/><Register /></>} />
            <Route path="/" element={<HomeOrAdmin />} />
            <Route path="/store" element={<><DynamicHeader /><Store /><Footer /></>} />

            <Route path="/store/:produkId" element={<><DynamicHeader /><Details /><Footer /></>} />

            <Route path="/about" element={<><DynamicHeader /><About /><Footer /></>} />
            <Route path="/cart" element={<><DynamicHeader /><Cart /><Footer /></>} />
            <Route path={`/progress/:userId/:orderId`} element={<><DynamicHeader /><Progress /><Footer /></>} />
            <Route path="/transaction" element={<><DynamicHeader /><Transaction /><Footer /></>} />
            <Route path={"/transaction-history/:userId"} element={<><DynamicHeader /><TransactionHistory /><Footer /></>} />
          </Routes>
        
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
