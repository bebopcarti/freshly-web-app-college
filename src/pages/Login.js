import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import './loginstyle.css';
import { useState } from 'react';

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const response = await fetch("http://localhost:3001/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            password
          })
        });
      
        const data = await response.json();
        
        // DEBUG
        // const testData = {
        //   "message": "Login berhasil",
        //   "user": {
        //     "userId": 1,
        //     "username": "usertest",
        //     "password": "test123",
        //     "email": "test@gmail.com",
        //     "role": "buyer",
        //     "createdAt": "2025-11-18"
        //   }
        // }
        // ---
      
        if (response.ok) {
          login(data.user)
          alert("Login berhasil!");
          console.log("User:", data.user);
          
          // Contoh: simpan user ke localStorage
          localStorage.setItem("user", JSON.stringify(data.user));
          navigate('/');
          
        } else {

          // login(testData.user) // DEBUG
          // localStorage.setItem("user", JSON.stringify(testData.user)); // DEBUG
          alert(data.message);
          // navigate('/'); // DEBUG
        }
      };

  return (
    <div class="login-body">
      <div className="wrapper">
          <form onSubmit={handleSubmit}>
              <h1>Login</h1>
              <div className="input-box">
                  <input type="text" name="username" placeholder="Username" required 
                  onChange={(e) => setUsername(e.target.value)}/>
                  <i className='bx bx-user'></i>
              </div>
              <div className="input-box">
                  <input type="password" name="password" placeholder="Password" required 
                  onChange={(e) => setPassword(e.target.value)}/>
                  <i className='bx bx-lock-alt'></i>
              </div>
              <button type="submit" class="btn">Login</button>
              <div className="register-link">
                  <p>Tidak punya akun?<Link to='/register'> Register</Link></p>
              </div>
          </form>
      </div>
    </div>
  );
}

export default Login;