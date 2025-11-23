import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import "./login.css";

const Login = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");        // To show "Invalid Password"
    const [isLoading, setIsLoading] = useState(false); // To disable button while loading

    const navigate = useNavigate(); // Setup navigation

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // 1. SEND CREDENTIALS TO BACKEND
            const res = await axios.post("http://localhost:5000/api/auth/login", formData);

            // 2. GET THE TOKEN & USER DATA
            const { token, user, message } = res.data;

            // 3. SAVE "DIGITAL BADGE" TO BROWSER STORAGE
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user)); // Save user info (role, name)

            console.log(message); // "Login Successful"

            // 4. REDIRECT TO DASHBOARD
            // We use window.location to ensure the Sidebar re-reads the new user data
            window.location.href = "/dashboard"; 

        } catch (err) {
            // Handle Errors (Wrong password, Server down, etc.)
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError("Failed to connect to server.");
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                {/* Logo or Icon */}
                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>⚖️</div>
                
                <h2 className="login-title">BJMP SYSTEM</h2>
                <p style={{color: '#64748b', marginBottom: '20px'}}>Secure Information Management</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            className="input-field"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="input-field"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Error Message Display */}
                    {error && <div className="error-banner">{error}</div>}

                    <button className="login-btn" type="submit" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;