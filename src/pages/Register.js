import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './register.css';

function Register() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
      
        const response = await fetch("http://localhost:3001/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            username,
            password
          })
        });
      
        const data = await response.json();
      
        if (response.ok) {
          alert("Register berhasil!");
          navigate('/login');
        } else {
          alert(data.message);
        }
      };

  return (
    <div class="register-body">
      <div className="wrapper">
          <form onSubmit={handleRegister}>
              <h1>Register</h1>
              <div class="input-box">
                  <input type="email" placeholder="Email" required 
                  onChange={(e) => setEmail(e.target.value)}/>
                  <i className='bx bx-envelope'></i>
              </div>
              <div className="input-box">
                  <input type="text" placeholder="Username" required 
                  onChange={(e) => setUsername(e.target.value)}/>
                  <i className='bx bx-user'></i>
              </div>
              <div className="input-box">
                  <input type="password" placeholder="Password" required 
                  onChange={(e) => setPassword(e.target.value)}/>
                  <i className='bx bx-lock-alt'></i>
              </div>
              <button type="submit" className="btn">Register</button>
          </form>
      </div>
    </div>
  );
}

export default Register;