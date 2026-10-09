import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import _1 from "../assets/heart-outline.png"
import _2 from "../assets/heart-filled.png"
import './Store.css';

function Store() {
    const [produk, setProduk] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 9999999999});
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user") || "null");
    
    const [favoritedItems, setFavoritedItems] = useState([]);
    
    const toggleFav = (produkId) => {
        if (user == null) {
            navigate('/login');
            return;
        }
        const isFavorited = favoritedItems.includes(produkId);

        setFavoritedItems((prevFavorites) =>
            isFavorited
                ? prevFavorites.filter((id) => id !== produkId)
                : [...prevFavorites, produkId]
        );

        const apiUrl = isFavorited 
        ? "http://localhost:3001/favorite/delete" 
        : "http://localhost:3001/favorite/update";
        
        const httpMethod = isFavorited ? "DELETE" : "POST";

        fetch(apiUrl, {
            method: httpMethod,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                produkId: produkId,
                userId: user.userId
            })
        })
        .then((res) => res.json())
        .then((data) => {
            console.log(`Backend sync successful (${httpMethod}):`, data);
        })
        .catch((err) => {
            console.error("Backend favorite sync failed:", err);
            
            alert("Could not update favorites. Server error.");
        })
    };

    const toggleCategory = (kategori) => {
        setSelectedCategories((prev) => {
          if (prev.includes(kategori)) {
            return prev.filter((item) => item !== kategori);
          } else {
            return [...prev, kategori];
          }
        });
      };

    const getSemuaProduk = () => {
        fetch("http://localhost:3001/produk")
          .then(res => res.json())
          .then(data => {
            setProduk(data);
        });
    };

    
    useEffect(() => {
        fetch("http://localhost:3001/produk/price", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(priceRange)
        })
        .then(res => res.json())
        .then(data => setProduk(data));
    }, [priceRange]);

    const handlePriceChange = (min, max) => {
        setPriceRange({ min, max });
    };

    useEffect(() => {
        if (user == null) {
            navigate('/login');
            return;
        }
        fetch("http://localhost:3001/produk/filter/all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categories: selectedCategories,
                min: priceRange.min,
                max: priceRange.max,
                userId: user.userId
            })
        })
        .then(res => res.json())
        .then(data => setProduk(data));
    }, [selectedCategories, priceRange]);

    const addToCart = async (produkId) => {
        const user = JSON.parse(localStorage.getItem("user"));
    
        if (user == null) {
            alert("You must be logged in first to add to cart.");
            return;
        }
        const resCart = await fetch("http://localhost:3001/cart/getOrCreate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.userId })
        });
        
        const cartData = await resCart.json();
        const cartId = cartData.cartId;

        const resAdd = await fetch("http://localhost:3001/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                cartId: cartId,
                produkId: produkId
            })
        });
    
        const addData = await resAdd.json();
        console.log(addData);
        alert("Product added to cart!");
    };

    useEffect(() => {
        if (user != null && user.userId) {
            fetch(`http://localhost:3001/favorite/${user.userId}`)
                .then(res => res.json())
                .then(favoritedIds => setFavoritedItems(favoritedIds))
                .catch(err => console.error("Error loading initial favorites:", err));
        }
    }, [user]);
    

    return (
        <>
        <div className="store-page">

            <div className="store-container">
                
                <aside className="sidebar">
                    <h3>Search & Filter</h3>

                    <h4>Price Range</h4>
                    <ul>
                        <li><input type="radio" name="price" onChange={() => handlePriceChange(0, 45000)}/> Under IDR 45.000</li>
                        <li><input type="radio" name="price" onChange={() => handlePriceChange(0, 95000)}/> Under IDR 95.000</li>
                        <li><input type="radio" name="price" onChange={() => handlePriceChange(0, 135000)}/> Under IDR 135.000</li>
                        <li><input type="radio" name="price" onChange={() => handlePriceChange(0, 180000)}/> Under IDR 180.000</li>
                        <li><input type="radio" name="price" onChange={() => handlePriceChange(0, 9999999999)}/> Any Price</li>
                    </ul>

                    <h4>Category</h4>
                    <ul>
                        <li><input type="checkbox" onChange={() => toggleCategory("Vegetables")} /> Vegetables</li>
                        <li><input type="checkbox" onChange={() => toggleCategory("Fruits")} /> Fruits</li>
                        <li><input type="checkbox" onChange={() => toggleCategory("Meat")} /> Meat</li>
                        <li><input type="checkbox" onChange={() => toggleCategory("Seafood")} /> Seafood</li>
                        <li><input type="checkbox" onChange={() => toggleCategory("Dairy")}/> Dairy</li>
                        <li><input type="checkbox" onChange={() => toggleCategory("Bakery")}/> Bakery</li>
                        <li><input type="checkbox" onChange={() => toggleCategory("Favorites")}/> Favorites</li>
                    </ul>

                    <li><input type="checkbox" onClick={getSemuaProduk} /> All Ingredients</li>
                </aside>

                {/* Items */}
                <main className="main-content">
                    <h2>All Ingredients</h2>

                    <div className="product-grid">

                        {produk.map((p) => {const isFavorited = favoritedItems.includes(p.produkId); return (
                            <div className="product-card" key={p.produkId}>
                                <div className="btn-container">
                                    <button 
                                        className="fav-btn" 
                                        onClick={() => toggleFav(p.produkId)}>
                                        <img 
                                            src={isFavorited ? _2 : _1} 
                                            className="fav-icon-img"/>
                                    </button>
                                </div>
                                <img 
                                    src={`http://localhost:3001/uploads/${p.gambar}`}
                                    className="product-img"
                                    alt={p.nama}
                                    onClick={() => navigate(`/store/${p.produkId}`)}/>
                                <h3 className="product-title" onClick={() => navigate(`/store/${p.produkId}`)}>{p.nama}</h3>
                                <h4 className="product-rating"><span className="star-icon">★ </span>{Number(p.produk_rating ?? 5).toFixed(1)}</h4>
                                <div className="price-box">IDR {p.harga.toLocaleString()}</div>
                                <button className="add-cart-btn" onClick={() => addToCart(p.produkId)}>Add to Cart</button>
                            </div>
                        )})}
                    </div>
                </main>
            </div>

        </div>
        </>
    );
}

export default Store;
