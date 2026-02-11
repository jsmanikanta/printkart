import { Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Header from "./Header";
import Cart from "./Cart";
import VideoHelpSection from "./Help";
import OrderPrints from "./OrderPrints";
import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./Forgotpass";
import Footer from "./Footer";
import Profile from "./Profile"

function App() {
  return (
    <>
      <Header />
    <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/prints-cart" element={<Cart />} />
        <Route path="/" element={<OrderPrints />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/help" element={<VideoHelpSection />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
