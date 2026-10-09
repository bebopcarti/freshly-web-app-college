import './Progress.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import _2 from '../assets/box-white.png';
import _3 from '../assets/cargo-truck-white.png';
import _1 from '../assets/shopping-cart-white.png';
import _4 from '../assets/check-white.png';

const getProgressWidth = (status) => {
    switch (status) {
        case 'PLACED':
            return 13; // Order Placed
        case 'PACKAGED':
            return 38; // Packaged
        case 'OTW':
            return 62; // On the Way
        case 'DELIVERED':
            return 100; // Delivered
        default:
            return 0;
    }
};

function Progress() {
    const { userId, orderId } = useParams();
    const [ orderData, setOrders ] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    const deliveryProgressWidth = orderData ? getProgressWidth(orderData.deliveryStatus) : 0;
    
    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        if (!userId) {
            console.error("User ID is missing from the URL.");
            navigate(`/login`);
            return;
        }
        if (!orderId) {
            console.error("Could not find order.");
            navigate(`/transaction-history/${userId}`);
        }

        const apiUrl = `http://localhost:3001/progress/${userId}/${orderId}`;
        
        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    setOrders(data[0]);
                } else {
                    setOrders(null);
                    navigate(`/transaction-history/${userId}`);
                }
            })
            .catch(err => console.error("Fetch error:", err));
    }, [userId, orderId, navigate]);
    
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    const formatAmount = (amount) => amount ? `Rp${amount.toLocaleString('id')}` : 'N/A';
    
    return (
        <div className="progress-body">
            <div className="progress-banner">
                <h1>Order Tracking Page</h1>
                <p>Your order ({orderData.orderId}) has been placed.</p>
                <p>Please wait and track your order progress from here.</p>
            </div>
            <div className="order-details-wrapper progress-sections">
                <div className="order-details">
                    <h1>Order Placed</h1>
                    <p>{formatDate(orderData.createdAt)}</p>
                </div>
                <div className="order-details">
                    <h1>Total</h1>
                    <p>{formatAmount(orderData.totalAmount)}</p>
                </div>
                <div className="order-details">
                    <h1>Order ID</h1>
                    <p>{orderData.orderId}</p>
                </div>
            </div>
            <div className="order-status-wrapper progress-sections">
                <h1>Order Status: <span className="status green">{orderData.deliveryStatus}</span></h1>
            </div>
            <div className="progress-wrapper progress-sections">
                <div className="progress-sub-wrapper">
                    <div className="progress-container">
                        <div className="progress-line prog-gray"></div>
                        <div className="progress-line prog-green" style={{width: `${deliveryProgressWidth}%`}}></div>
                        <div className="progress-step">
                            <div className={`img-border ${deliveryProgressWidth >= 13 ? 'active' : 'inactive'}`}>
                                <img src={_1}></img>
                            </div>
                        </div>
                        <div className="progress-step">
                            <div className={`img-border ${deliveryProgressWidth >= 38 ? 'active' : 'inactive'}`}>
                                <img src={_2}></img>
                            </div>
                        </div>
                        <div className="progress-step">
                            <div className={`img-border ${deliveryProgressWidth >= 62 ? 'active' : 'inactive'}`}>
                                <img src={_3}></img>
                            </div>
                        </div>
                        <div className="progress-step">
                            <div className={`img-border ${deliveryProgressWidth >= 100 ? 'active' : 'inactive'}`}>
                                <img src={_4}></img>
                            </div>
                        </div>
                    </div>
                    <div className="details-container">
                        <h1>Order Placed</h1>
                        <h1>Packaged</h1>
                        <h1>On the Way</h1>
                        <h1>Delivered</h1>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Progress;