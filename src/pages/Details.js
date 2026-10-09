import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import _1 from "../assets/box-white.png"
import _2 from "../assets/user-icon.png"
import './Details.css';

function Details() {
    const { produkId } = useParams();
    const { user } = useAuth();
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [userRating, setUserRating] = useState(0);
    const [userKomentar, setUserKomentar] = useState("");

    useEffect(() => {
        if (!produkId) {
            console.error("Product ID missing from URL.");
            navigate(`/store`);
            return;
        }

        fetch(`http://localhost:3001/store/${produkId}`)
            .then(res => res.json())
            .then(data => {
                setDetails(data);
                console.log(data)
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setLoading(false);
            })
    }, [produkId, user, navigate])

    const rupiah = (number)=>{
        return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR"
        }).format(number);
    }

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            alert("Please log in to submit a review.");
            return;
        }

        fetch("http://localhost:3001/review/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                produkId: produkId,
                userId: user.userId,
                rating: userRating,
                komentar: userKomentar
            })
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to submit review");
            }
            return res.json();
        })
        .then((data) => {
            alert("Review submitted successfully!");
            setUserKomentar("");
            setUserRating(0);
            window.location.reload();
        })
        .catch((err) => {
            console.error("Error submitting review:", err);
            alert("Something went wrong while saving your review.");
        });
    };
    

    return (
        <div className="details-body">
            {loading ? (
                <div className="loading-state">Loading product details...</div>
            ) : details.length === 0 ? (
                <div className="error-state">Product not found.</div>
            ) : (
                <>
                    <div className="top-section">
                        <div className="product-wrapper">
                            <img 
                                src={`http://localhost:3001/uploads/${details[0].gambar}`} 
                                className="p-img" 
                                alt={details[0].nama} 
                            />
                            <h2 className="product-card-text card-name">{details[0].nama}</h2>
                            <h2 className="product-card-text card-rating">
                                <span className="star-icon">★ </span>{Number(details[0].produk_rating).toFixed(1)}
                            </h2>
                            <h2 className="product-card-text card-price">{rupiah(details[0].harga)}</h2>
                        </div>

                        <div className="review-form-container">
                            <form onSubmit={handleReviewSubmit}>
                                <div className="form-header-row">
                                    <div className="rating-selector">
                                        <label>Rating:</label>
                                        <div className="star-rating-input">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    className={`star-btn ${star <= userRating ? "active" : ""}`}
                                                    onClick={() => setUserRating(star)}>
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button 
                                    type="submit" 
                                    className="submit-review-btn" 
                                    disabled={userKomentar.trim() === "" || userRating === 0}>
                                        Submit Review
                                        </button>
                                </div>

                                <div className="form-body-row">
                                    <label>Review:</label>
                                    <textarea 
                                        placeholder="Write your thoughts about this product here..." 
                                        value={userKomentar}
                                        onChange={(e) => setUserKomentar(e.target.value)}
                                        required
                                    />

                                    {(userKomentar.trim() === "" || userRating === 0) && (
                                        <p className="submit-warning-text-bottom">
                                            * Please select a star rating and type a comment before submitting.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="reviews-wrapper">
                        <h2>User Reviews:</h2>
                        
                        {details[0].komentar === null ? (
                            <p className="no-reviews-text">No reviews yet for this product.</p>
                        ) : (
                            details.map((d) => (
                                <>
                                    <hr />
                                    <div className="user-review-wrapper">
                                        <div className="user-profile">
                                            <span>
                                                <img src={_2} alt="user avatar"/>
                                                <div>
                                                    <strong>{d.username}</strong>
                                                    <br/>
                                                    <span className="star-icon">{"★".repeat(d.rating)}</span>
                                                </div>
                                            </span>
                                        </div>
                                        <div className="review-box">
                                            <p>{d.komentar}</p>
                                        </div>
                                    </div>
                                </>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Details;