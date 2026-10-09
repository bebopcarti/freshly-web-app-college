import './Home.css';
import homeBanner from '../assets/hellofreshImage 2.jpg'; // KEEPING THE SPACE
import { useAuth } from '../context/AuthContext';

function Home() {
    const { user } = useAuth();
    return (
        <div className="home-body">

            {/* BANNER */}
            <div className="home-banner">
                <img className="home-banner-img" src={homeBanner} alt="Home Banner" />
                <div className="home-banner-text">
                    <h1>Fresh Ingredients Delivered to Your Doorstep</h1>
                    <p>Healthy, fresh, and affordable groceries for everyone.</p>
                    <a href="/store" className="home-banner-btn">Shop Now</a>
                </div>
            </div>

 {/* MENU RECIPE */}
<div className="taste-section">
    <h1 className="taste-title">
        Reimagine Your Recipe
    </h1>
    <p className="taste-subtitle">
        Recipe You Can Recreate on Your Home Using Our Ingredients.
    </p>

    <div className="taste-grid">

        <div className="taste-card">
            <img src="https://www.singaporeanmalaysianrecipes.com/wp-content/uploads/2024/06/nasi-goreng-usa-recipe.jpg" alt="Meat & Veggies" />
            <div className="taste-overlay">
                <h2>NASI GOREANG</h2>
                <span className="taste-tag">MOST POPPULAR RECIPE</span>
            </div>
        </div>

        <div className="taste-card">
            <img src="https://www.shelovesbiscotti.com/wp-content/uploads/2020/06/Healthy-Fruit-Salad-Recipe.jpg" alt="Veggie" />
            <div className="taste-overlay">
                <h2>FRUIT SALAD</h2>
                <span className="taste-tag">HEALTHY MEAL TO GO</span>
            </div>
        </div>

        <div className="taste-card">
            <img src="https://images.immediate.co.uk/production/volatile/sites/30/2022/05/Pulled-aubergine-burger-47673ee.jpg" alt="Family Menu" />
            <div className="taste-overlay">
                <h2>PLANT BASED HAMBURGER</h2>
                <span className="taste-tag">MEALS FOR VEGETARIAN</span>
            </div>
        </div>

        <div className="taste-card">
            <img src="https://www.allrecipes.com/thmb/DOgMge2dJv0Plavei2oPjvUm7o8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/235589-chef-johns-creamy-mushroom-soup-DDMFS-4x3-14854a8dc51c4c4c80cc5631299a873b.jpg" alt="Fit & Wholesome" />
            <div className="taste-overlay">
                <h2>MUSHROOM SOUP</h2>
                <span className="taste-tag">TASTE THE WARMTH</span>
            </div>
        </div>

    </div>

    <a href="/store" className="taste-button">See Ingredients to Make</a>
</div>


            {/* HOW IT WORKS */}
            <div className="home-sections home-how">
                <h1>How It Works</h1>

                <div className="how-wrapper">
                    <div className="how-card">
                        <h2>1. Lorem ipsum</h2>
                        <p>Lorem ipsum dolor sit amet</p>
                    </div>
                    <div className="how-card">
                        <h2>2. Lorem ipsum</h2>
                        <p>Lorem ipsum dolor sit amet</p>
                    </div>
                    <div className="how-card">
                        <h2>3. Lorem ipsum</h2>
                        <p>Lorem ipsum dolor sit amet</p>
                    </div>
                </div>
            </div>

            {/* TESTIMONIALS */}
            <div className="home-sections home-testimonials">
                <h1>What Our Customers Say</h1>

                <div className="test-wrapper">
                    <div className="test-card">
                        <p>Lorem ipsum dolor sit amet</p>
                        <span>- Lorem Ipsum</span>
                    </div>
                    <div className="test-card">
                        <p>Lorem ipsum dolor sit amet</p>
                        <span>- Lorem Ipsum</span>
                    </div>
                    <div className="test-card">
                        <p>Lorem ipsum dolor sit amet</p>
                        <span>- Lorem Ipsum</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
