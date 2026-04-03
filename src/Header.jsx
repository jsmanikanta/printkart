import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { api_path } from "../data";
import "./styles/header.css";

function Header() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);

  const goToLogin = () => navigate("/login");
  const goToCart = () => navigate("/prints-cart");
  const goToHome = () => navigate("/");
  const goToHelp = () => navigate("/quick-info");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUserName(null);
        return;
      }

      try {
        const response = await axios.get(`${api_path}/user/printorders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.user) {
          setUserName(
            response.data.user.fullname || response.data.user.name || null,
          );
        } else {
          setUserName(null);
        }
      } catch (error) {
        setUserName(null);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <header className="pk-header">
      <div className="pk-header-content">
        <div className="pk-logo" onClick={goToHome}>
          <img src="/images/middle.jpeg" alt="PrintKart" />
        </div>

        <div className="pk-header-actions">
          <div className="pk-user-profile" onClick={goToLogin}>
            <div className="pk-user-avatar">
              <img src="/images/user-avatar.png" alt="User" />
            </div>
            <span className="pk-login-text">
              {userName ? userName : "Login"}
            </span>
          </div>

          <div className="pk-help-section" onClick={goToHelp}>
            <img
              src="/images/help-icon.jpg"
              alt="Help"
              className="pk-help-icon"
            />
            <span className="pk-help-text">Quick Info</span>
          </div>

          <div className="pk-cart-section" onClick={goToCart}>
            <img
              src="/images/cart-icon.png"
              alt="Cart"
              className="pk-cart-icon"
            />
            <span className="pk-cart-text">Prints Vault</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
