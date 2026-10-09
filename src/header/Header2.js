import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header2() {
    const navigate = useNavigate();

    return (
        <header className="transparent-header">
            <div className="nav-container">
                <div className="main-links">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        Back
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header2;
