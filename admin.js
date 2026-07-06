const API_URL = "https://vestiga-backend-3392.onrender.com/api";

// DOM Elements
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("admin-login-form");
const loginError = document.getElementById("login-error");

// 1. Check if Admin is already logged in when page loads
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        showDashboard();
    }
});

// 2. Handle Admin Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Save token to localStorage
            localStorage.setItem("adminToken", data.token);
            loginError.style.display = "none";
            loginForm.reset();
            showDashboard();
        } else {
            loginError.innerText = data.message || "Login failed. Check credentials.";
            loginError.style.display = "block";
        }
    } catch (error) {
        console.error("Login Error:", error);
        loginError.innerText = "Network error. Please try again.";
        loginError.style.display = "block";
    }
});

// 3. UI Toggle Functions
function showDashboard() {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    // ഇവിടെ നാം Product List ലോഡ് ചെയ്യുന്ന ഫംഗ്ഷൻ വിളിക്കും (അടുത്ത ഘട്ടത്തിൽ)
    // fetchAdminProducts(); 
}

function logoutAdmin() {
    localStorage.removeItem("adminToken");
    dashboardSection.style.display = "none";
    loginSection.style.display = "flex";
}
