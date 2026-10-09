import React, { useState, useEffect } from "react";
import "./Transaction.css";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import qrisCode from "../assets/qris.jpg";

function Transaction() {
    const navigate = useNavigate();
    const [method, setMethod] = useState("card");

    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expDate, setExpDate] = useState("");
    const [cvv, setCvv] = useState("");

    const [address, setAddress] = useState("");

    const [showQR, setShowQR] = useState(false);

    const [cartItems, setCartItems] = useState([]);
    const [subtotal, setSubtotal] = useState(0);

    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
    
        // Ambil cartId user
        fetch("http://localhost:3001/cart/getOrCreate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.userId })
        })
        .then(res => res.json())
        .then(data => {
            const cartId = data.cartId;
    
            // Fetch item cart
            fetch(`http://localhost:3001/cart/items/${cartId}`)
                .then(res => res.json())
                .then(items => {
                    setCartItems(items);
    
                    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
                    setSubtotal(total);
                });
        });
    }, [user]);

    const handleCheckout = () => {
        fetch("http://localhost:3001/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.userId,
                method,
                address,
                deliveryFee: 10000,
                totalAmount: subtotal + 10000
            })
        })
        .then(res => res.json())
        .then(data => {
            if (method === "qris") {
                setShowQR(true);
            } else {
                navigate(`/transaction-history/${user.userId}`);
            }
        });
    };

    useEffect(() => {
        if (!user) {
            navigate('/');
        };
    }, [user, navigate]);


    return (
        <div className="transaction-container">
            
            <div className="payment-section">

                <h2 className="section-title">Payment Method</h2>

                <div className="steam-tabs">
                    <div
                        className={`steam-tab ${method === "card" ? "active" : ""}`}
                        onClick={() => setMethod("card")}
                    >
                        Credit / Debit Card
                    </div>

                    <div
                        className={`steam-tab ${method === "qris" ? "active" : ""}`}
                        onClick={() => setMethod("qris")}
                    >
                        QRIS
                    </div>

                    <div
                        className={`steam-tab ${method === "cod" ? "active" : ""}`}
                        onClick={() => setMethod("cod")}
                    >
                        COD
                    </div>
                </div>

                <div className="payment-box">

                    {method === "card" && (
                        <>
                            <label>Cardholder Name</label>
                            <input 
                                type="text" 
                                className="input-field"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value)}
                            />

                            <label>Card Number</label>
                            <input 
                                type="text" 
                                className="input-field"
                                maxLength="16"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />

                            <div className="flex-row">
                                <div>
                                    <label>Expiration Date</label>
                                    <input 
                                        type="text" 
                                        placeholder="MM/YY"
                                        className="input-field"
                                        value={expDate}
                                        onChange={(e) => setExpDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>CVV</label>
                                    <input 
                                        type="password"
                                        maxLength="4"
                                        className="input-field"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {method === "qris" && (
                        <p className="info-text">
                            You will receive your QR code after clicking Checkout.
                        </p>
                    )}

                    {method === "cod" && (
                        <p className="info-text">
                            Your order will be paid upon delivery.
                        </p>
                    )}

                </div>

            </div>

            <div className="order-summary">

                <h2 className="section-title">Order Summary</h2>

                {cartItems.map(item => (
                    <div className="order-item" key={item.cartItemId}>
                        <p><strong>{item.nama}</strong></p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: IDR {item.harga.toLocaleString()}</p>
                        <p>Subtotal: IDR {item.subtotal.toLocaleString()}</p>
                    </div>
                ))}

                <div className="summary-box">
                    <p><strong>Delivery Fee:</strong> IDR 10000</p>
                    <p><strong>Total:</strong> IDR {(subtotal + 10000).toLocaleString()}</p>
                </div>

                <h3>Delivery Address</h3>
                <textarea
                    className="input-field address-box"
                    placeholder="Enter full delivery address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <button 
                    className="checkout-btn"
                    onClick={handleCheckout}
                >
                    Checkout
                </button>

            </div>

            {showQR && (
                <div className="qr-popup">
                    <div className="qr-content">
                        <h3>Scan QRIS to Pay</h3>
                        <img src={qrisCode} alt="QRIS Code" className="qr-image" />
                        <button 
                            className="close-btn"
                            onClick={() => navigate(`/transaction-history/${user.userId}`)}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Transaction;
