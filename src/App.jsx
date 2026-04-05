import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";

import Cart from "./Cart";
import OrderPrintsSection from "./Home";
import OrderPrints from "./OrderPrints";
import Signup from "./Signup";
import Login from "./Login";
import ForgotPassword from "./Forgotpass";
import Profile from "./Profile";
import Addlocation from "./Addlocation";
import PickupAddress from "./Getlocations";
import Settings from "./Settings";
import AdminPrints from "./AdminPrints";
import StudentInformation from "./Studentinfo";
import Wishlist from "./Wishlist";
import FAQ from "./Faq";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/order-prints" element={<OrderPrints />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/prints-cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/" element={<OrderPrintsSection />} />
        <Route path="/mylocations" element={<PickupAddress />} />
        <Route path="/addlocation" element={<Addlocation />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/student-details" element={<StudentInformation />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin" element={<AdminPrints />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
