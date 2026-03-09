import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "./Loading";
import { api_path } from "../data";
import "./styles/adminprints.css";

const STATUS_OPTIONS = [
  "Order placed",
  "Verified",
  "Ready to dispatch",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "failed"];

export default function AdminPrints() {
  const navigate = useNavigate();

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orders, setOrders] = useState([]);
  const [viewingOrders, setViewingOrders] = useState(false);
  const [editStates, setEditStates] = useState({});

  const ADMIN_USERNAME = "admin@mybookhub.com";
  const ADMIN_PASSWORD = "Ayush@5121";

  const fetchOrders = async () => {
    const response = await axios.get(`${api_path}/admin/printorders`);
    setOrders(Array.isArray(response.data?.orders) ? response.data.orders : []);
  };

  const goToBooks = () => {
    navigate("/adminbooks");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setErrorMsg("Invalid username or password");
      return;
    }

    try {
      setLoading(true);
      await fetchOrders();
      setViewingOrders(true);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (orderId, field, value) => {
    setEditStates((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (orderId, order) => {
    const edits = editStates[orderId] || {};

    const selectedStatus = edits.status ?? order.status ?? "Order placed";
    const selectedPaymentStatus =
      edits.paymentStatus ?? order.paymentStatus ?? "pending";
    const selectedDiscountPrice =
      edits.discountprice ?? order.discountprice ?? order.originalprice ?? "";

    if (!STATUS_OPTIONS.includes(selectedStatus)) {
      alert(`Status must be one of: ${STATUS_OPTIONS.join(", ")}`);
      return;
    }

    if (!PAYMENT_STATUS_OPTIONS.includes(selectedPaymentStatus)) {
      alert(
        `Payment status must be one of: ${PAYMENT_STATUS_OPTIONS.join(", ")}`,
      );
      return;
    }

    try {
      setLoading(true);

      await axios.put(`${api_path}/admin/update-status/${orderId}`, {
        status: selectedStatus,
        discountprice:
          selectedDiscountPrice !== "" &&
          selectedDiscountPrice !== null &&
          selectedDiscountPrice !== undefined
            ? Number(selectedDiscountPrice)
            : undefined,
      });

      await axios.put(`${api_path}/admin/update-payment-status/${orderId}`, {
        paymentStatus: selectedPaymentStatus,
      });

      await fetchOrders();

      setEditStates((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    } catch (error) {
      alert(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update print order.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const handleLogout = () => {
    setViewingOrders(false);
    setUserName("");
    setPassword("");
    setOrders([]);
    setErrorMsg("");
    setEditStates({});
  };

  if (!viewingOrders) {
    return (
      <div className="admin-container">
        <h2>Admin Login - Prints</h2>

        {errorMsg && <div className="error-msg">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="text"
            placeholder="Enter user name"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            required
            className="admin-input"
          />

          <input
            type="password"
            placeholder="Enter the password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="admin-input"
            autoComplete="current-password"
          />

          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? <Loader /> : "Login"}
          </button>

          <button
            type="button"
            className="admin-btn"
            style={{ marginTop: "10px" }}
            onClick={goToBooks}
          >
            Go to Books Orders
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Print Orders</h2>

      {loading && <Loader />}
      {errorMsg && <div className="error-msg">{errorMsg}</div>}

      <div
        style={{
          marginBottom: "12px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button className="admin-btn" onClick={fetchOrders} disabled={loading}>
          Refresh Orders
        </button>

        <button className="admin-btn" onClick={goToBooks} disabled={loading}>
          Go to Books Orders
        </button>

        <button className="admin-btn" onClick={handleLogout} disabled={loading}>
          Logout
        </button>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th style={{ minWidth: "220px" }}>Order Status</th>
            <th style={{ minWidth: "180px" }}>Payment Status</th>
            <th>Payment Method</th>
            <th>Discount Price</th>
            <th>Full Name</th>
            <th>Mobile Number</th>
            <th>File</th>
            <th>Color</th>
            <th>Sides</th>
            <th>Binding</th>
            <th>No. of Copies</th>
            <th>Original Price</th>
            <th>Roll Number</th>
            <th>College Name</th>
            <th>Year</th>
            <th>Branch</th>
            <th>Address</th>
            <th>Description</th>
            <th>Order Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan="21">No orders available</td>
            </tr>
          )}

          {orders.map((order) => {
            const edits = editStates[order._id] || {};

            return (
              <tr key={order._id}>
                <td>{order._id}</td>

                <td>
                  <select
                    style={{ width: "210px" }}
                    value={edits.status ?? order.status ?? "Order placed"}
                    onChange={(e) =>
                      handleInputChange(order._id, "status", e.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <select
                    style={{ width: "160px" }}
                    value={
                      edits.paymentStatus ?? order.paymentStatus ?? "pending"
                    }
                    onChange={(e) =>
                      handleInputChange(
                        order._id,
                        "paymentStatus",
                        e.target.value,
                      )
                    }
                  >
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>

                <td>{order.paymentMethod || "-"}</td>

                <td>
                  <input
                    type="number"
                    style={{ width: "110px" }}
                    value={
                      edits.discountprice ??
                      order.discountprice ??
                      order.originalprice ??
                      ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        order._id,
                        "discountprice",
                        e.target.value,
                      )
                    }
                  />
                </td>

                <td>{order.fullName ?? "-"}</td>
                <td>{order.mobile ?? "-"}</td>

                <td>
                  {order.file && order.file !== "-" ? (
                    <a
                      href={order.file}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View PDF
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td>{order.color ?? "-"}</td>
                <td>{order.sides ?? "-"}</td>
                <td>{order.binding ?? "-"}</td>
                <td>{order.copies ?? "-"}</td>
                <td>{order.originalprice ?? "-"}</td>
                <td>{order.rollno ?? "-"}</td>
                <td>{order.college ?? "-"}</td>
                <td>{order.year ?? "-"}</td>
                <td>{order.section ?? "-"}</td>
                <td>{order.address ?? "-"}</td>
                <td>{order.description ?? "-"}</td>
                <td>{formatDate(order.orderDate)}</td>

                <td>
                  <button
                    className="admin-btn"
                    onClick={() => handleSave(order._id, order)}
                    disabled={loading}
                  >
                    Save
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
