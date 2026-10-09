import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);


// DEBUG 
const test = 0;
const testuser = {
    userId: 1,
    username: "usertest",
    password: "test123",
    email: "test@gmail.com",
    role: "buyer",
    createdAt: "2025-11-18"
}
// ----

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // // DEBUG
        // if (test == 1) {
        //     return testuser
        // }
        // ---
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error loading user from localStorage:", error);
            return null;
        }
    });

    const login = (userData) => {
        setUser(userData);
        console.log(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};