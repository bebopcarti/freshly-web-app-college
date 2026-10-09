import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo_no_bg.png';
import _1 from '../assets/bag.png';
import _2 from '../assets/rupiah.png';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const [showAnalytics, setBool] = useState(false);
  const [analyticsData, setData] = useState([]);
  const navigate = useNavigate();
  
  console.log(user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const viewAnalytics = () => {
    fetch(`http://localhost:3001/analytics`)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setBool(true);
        console.log(analyticsData);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      })
  };

  const rupiah = (number)=>{
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(number);
  }

  return (
    <header>
      <div className="nav-container">
        <nav className="main-links">
          <ul className="nav-list">
            <li><a href="/"><img class="logo-img" src={logo} alt="Freshly Logo"/></a></li>
            <li><a href="/">Admin Dashboard</a></li>
            <li><a href="/transaction-history/0">Transaction History</a></li>
          </ul>
        </nav>

        <div className="account-info">
          <button onClick={viewAnalytics} class="header-button">View Analytics</button>
          <button onClick={handleLogout} class="logout header-button">Logout</button>
        </div>
        
        {showAnalytics && (
          <div className="analytics-wrapper">
            {analyticsData.map((a_data) => (
              <div className="analytics-content">
                <h1>Admin Analytics</h1>
                <div className="analytics-sections">
                  <img src={_1} className="analytics-img"></img>
                  <div className="text-sections">
                    <h1 id="transaction-title">Transactions</h1>
                    <h2>Total: <span id="transaction-total">{a_data.total_transactions}</span></h2>
                    <h2>Today: <span id="transaction-today">{a_data.transactions_today}</span></h2>
                  </div>
                </div>
                <div className="analytics-sections">
                  <img src={_2} className="analytics-img"></img>
                  <div className="text-sections">
                    <h1 id="revenue-title">Revenue</h1>
                    <h2>Total: <span id="revenue-total">{rupiah(a_data.total_revenue)}</span></h2>
                    <h2>Today: <span id="revenue-today">{rupiah(a_data.revenue_today)}</span></h2>
                  </div>
                </div>
                <div className="button-wrapper">
                  <button className="analytics-button" onClick={() => setBool(false)}>Close</button>
                </div>
              </div>
            ))}
          </div>
        )}


      </div>
    </header>
  );
}

export default Header
