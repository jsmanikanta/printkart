import React from "react";
import "./styles/settings.css";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  console.log("[printkart:Settings] Rendered");

  // Back button
  const handleBack = () => {
    console.log("[printkart:Settings] Navigate back");
    navigate(-1);
  };

  // Change Password navigation
  const handleChangePassword = () => {
    console.log("[printkart:Settings] Open change password");
    navigate("/forgotpassword");
  };

  // Student Information navigation
  const handleStudentInfo = () => {
    console.log("[printkart:Settings] Open student information");
    navigate("/student-details");
  };

  // Logout navigation
  const handleLogout = () => {
    console.log("[printkart:Settings] Logout requested");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="settings-page">
      <div className="settings-topbar">
        <button
          className="settings-backBtn"
          type="button"
          aria-label="Go back"
          onClick={handleBack}
        >
          ←
        </button>

        <div className="settings-titleRow">
          <span className="settings-gear">⚙</span>
          <h2 className="settings-title">Settings</h2>
        </div>
      </div>

      <div className="settings-divider" />

      <div className="settings-list">
        <button
          className="settings-item"
          type="button"
          onClick={handleChangePassword}
        >
          <span className="settings-itemText">Change Password</span>
          <span className="settings-chevron">›</span>
        </button>

        <div className="settings-divider" />

        <button
          className="settings-item"
          type="button"
          onClick={handleStudentInfo}
        >
          <span className="settings-itemText">Student Information</span>
          <span className="settings-chevron">›</span>
        </button>

        <div className="settings-divider" />

        <button className="settings-item" type="button" onClick={handleLogout}>
          <span className="settings-itemText">Logout</span>
          <span className="settings-chevron">›</span>
        </button>

        <div className="settings-divider" />
      </div>
    </div>
  );
}
