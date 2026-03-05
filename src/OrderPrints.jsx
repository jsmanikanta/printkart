import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.mjs";
import "./styles/orderprints.css";
import qrImg from "/images/qr.jpg";

const colleges = [
  "Anil Neerukonda Institute of Technology & Sciences (ANITS), Visakhapatnam",
  "Andhra University, Waltair Junction, Visakhapatnam",
  "Gayatri Vidya Parishad College of Engineering (GVPE),Kommadi, Visakhapatnam",
  "SIMS College Madhurawada, Visakhapatnam",
  "Dr. Lankapalli Bullayya College of Engineering,Visakhapatnam",
  "Avanti Institute of Engineering & Technology, Vizianagaram",
  "Nadimpalli Satyanarayana Raju Institute of Technology (NSRIT), Visakhapatnam",
];

const COLOR_OPTIONS = [
  { value: "b/w", label: "Black & White" },
  { value: "colour", label: "Colour" },
];

const SIDES_OPTIONS = [
  { value: "1", label: "Single Side" },
  { value: "2", label: "Double Side" },
  { value: "2 per side", label: "2 per side (Front & Back)" },
  { value: "4 per side", label: "4 per side (Front & Back)" },
];

const BINDING_OPTIONS = [
  { value: "none", label: "None" },
  { value: "spiral", label: "Spiral Binding" },
  { value: "stick", label: "Stick File" },
  { value: "soft", label: "Soft Binding" },
  { value: "book", label: "Book Binding" },
];

const PAYMENT_OPTIONS = [
  { value: "payondelivery", label: "Pay on Delivery" },
  { value: "UPI", label: "UPI" },
];

export default function OrderPrints() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_PATH;

  const [activeTab, setActiveTab] = useState("student");

  const [file, setFile] = useState(null);
  const [pages, setPages] = useState(0);
  const [pdfError, setPdfError] = useState("");

  const [color, setColor] = useState("b/w");
  const [sides, setSides] = useState("1");
  const [binding, setBinding] = useState("none");
  const [copies, setCopies] = useState(1);
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [transactionImage, setTransactionImage] = useState(null);
  const [payment, setPayment] = useState("payondelivery");
  const [calcError, setCalcError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // form fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [rollno, setRollNo] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");

  // pricing
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [printCost, setPrintCost] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [bindingCost, setBindingCost] = useState(0);

  // coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const [couponDiscountAmount, setCouponDiscountAmount] = useState(0);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const token = useMemo(() => localStorage.getItem("token")?.trim(), []);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [navigate, token]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      setProfileLoading(true);
      try {
        const res = await fetch(`${API}/user/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setProfileLoading(false);
          return;
        }

        const profile = await res.json();
        if (profile?.fullname && !name) setName(profile.fullname);
        if (profile?.mobileNumber && !mobile) setMobile(String(profile.mobileNumber).replace(/\D/g, "").slice(0, 10));

        if (profile?.college && !college) setCollege(profile.college);
        if (profile?.year && !year) setYear(profile.year);
        if (profile?.branch && !section) setSection(profile.branch);
        if (profile?.rollno && !rollno) setRollNo(profile.rollno);

        if (profile?.usertype) {
          const u = String(profile.usertype).toLowerCase();
          if (u.includes("student")) setActiveTab("student");
        }
      } catch (e) {
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [API, token]);

  // Load PDF pages
  useEffect(() => {
    if (!file) {
      setPages(0);
      setPdfError("");
      return;
    }

    const loadPdfPages = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPages(pdf.numPages);
        setPdfError("");
      } catch (e) {
        setPages(0);
        setPdfError("Invalid or corrupted PDF");
      }
    };

    loadPdfPages();
  }, [file]);

  // Price calculation: student discount OR coupon discount
useEffect(() => {
  setCalcError("");

  if (!pages || pages <= 0) {
    setPrintCost(0);
    setBindingCost(0);
    setOriginalPrice(0);
    setDiscountValue(0);
    setCouponDiscountAmount(0);
    setDiscountPrice(0);
    return;
  }

  let pricePerPage = 0;

  if (color === "b/w" && sides === "2") pricePerPage = 1;
  else if (color === "b/w" && sides === "1") pricePerPage = 1.5;
  else if (color === "colour" && sides === "1") pricePerPage = 6;
  else if (color === "b/w" && sides === "4 per side") pricePerPage = 0.29;
  else if (color === "b/w" && sides === "2 per side") pricePerPage = 0.5;
  else {
    setCalcError("This option is unavailable. Please change colour/sides.");
    setPrintCost(0);
    setBindingCost(0);
    setOriginalPrice(0);
    setDiscountValue(0);
    setCouponDiscountAmount(0);
    setDiscountPrice(0);
    return;
  }

  const printAmount = pricePerPage * pages * copies;
  setPrintCost(printAmount);

  let bindingAmount = 0;
  switch (binding) {
    case "spiral":
      bindingAmount = 25 * copies;
      break;
    case "stick":
      bindingAmount = 15 * copies;
      break;
    case "soft":
      bindingAmount = 30 * copies;
      break;
    case "book":
      bindingAmount = 150 * copies;
      break;
    default:
      bindingAmount = 0;
  }
  setBindingCost(bindingAmount);

  const originalTotal = printAmount + bindingAmount;
  setOriginalPrice(originalTotal);
  let printsDiscount = 0;

  if (couponDiscountPercent > 0) {
    printsDiscount = (printAmount * couponDiscountPercent) / 100;
    setCouponDiscountAmount(Math.ceil(printsDiscount));
    setDiscountValue(0);
  } else if (activeTab === "student") {
    printsDiscount = printAmount * 0.15;
    setDiscountValue(printsDiscount);
    setCouponDiscountAmount(0);
  } else {
    setDiscountValue(0);
    setCouponDiscountAmount(0);
  }

  const finalTotal = Math.max(0, (printAmount - printsDiscount) + bindingAmount);
  setDiscountPrice(Math.ceil(finalTotal));
}, [color, sides, binding, pages, copies, activeTab, couponDiscountPercent]);

  const handleVerifyCoupon = async () => {
    if (!token) return alert("Please log in first.");
    if (!couponCode.trim()) return alert("Please enter a coupon code.");

    try {
      setCouponLoading(true);
      setCouponInfo(null);

      const res = await fetch(`${API}/coupon/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setCouponDiscountPercent(0);
        setCouponDiscountAmount(0);
        setCouponInfo({
          status: data.status || "error",
          discountPercentage: 0,
          message: data.error || data.message || "Invalid coupon",
        });
        return;
      }

      const percent = data.data?.discountPercentage || 0;
      setCouponDiscountPercent(percent);

      setCouponInfo({
        status: data.status,
        discountPercentage: percent,
        message:
          data.status === "available" || data.status === "applied"
            ? `Coupon applied! ${percent}% discount.`
            : "Coupon already used by you.",
      });
    } catch (err) {
      setCouponDiscountPercent(0);
      setCouponDiscountAmount(0);
      setCouponInfo({
        status: "error",
        discountPercentage: 0,
        message: "Network error. Please try again.",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) {
      setFile(null);
      setPages(0);
      setPdfError("");
      return;
    }
    if (uploaded.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      e.target.value = null;
      return;
    }
    if (uploaded.size > MAX_FILE_SIZE) {
      alert("PDF file size must be less than 10MB.");
      e.target.value = null;
      return;
    }
    setFile(uploaded);
  };

  const handleTransactionImageChange = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) {
      setTransactionImage(null);
      return;
    }
    if (!uploaded.type.startsWith("image/")) {
      alert("Transaction screenshot must be an image.");
      e.target.value = null;
      return;
    }
    if (uploaded.size > MAX_FILE_SIZE) {
      alert("Transaction screenshot must be less than 10MB.");
      e.target.value = null;
      return;
    }
    setTransactionImage(uploaded);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!file) return alert("Please upload a PDF.");
    if (!pages || pages <= 0) return alert("PDF page count unavailable.");
    if (!name.trim() || !mobile.trim()) return alert("Fill personal details.");

    const mobileDigits = mobile.replace(/\D/g, "").slice(0, 10);
    const mobileNumberPattern = /^\d{10}$/;
    if (!mobileNumberPattern.test(mobileDigits)) {
      return alert("Please enter a valid 10-digit mobile number.");
    }

    if (
      activeTab === "student" &&
      (!college.trim() || !year.trim() || !section.trim() || !rollno.trim())
    ) {
      return alert("Fill college, year, branch, registration number for students.");
    }

    if (activeTab === "others" && !address.trim()) {
      return alert("Fill delivery address for home delivery.");
    }

    if (!payment) return alert("Select payment method.");
    if (payment === "UPI" && !transactionImage) {
      return alert("Please upload UPI transaction screenshot.");
    }

    if (!token) {
      alert("Please log in first.");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("payment", payment);

      if (payment === "UPI") formData.append("transctionid", transactionImage);
      else formData.append("transctionid", "");

      formData.append("color", color);
      formData.append("sides", sides);
      formData.append("binding", binding);
      formData.append("copies", String(copies));
      formData.append("description", description.trim());
      formData.append("name", name.trim());
      formData.append("mobile", mobileDigits);
      formData.append("originalprice", Math.ceil(originalPrice));
      formData.append("discountprice", discountPrice);

      if (activeTab === "student") {
        formData.append("college", college.trim());
        formData.append("year", year.trim());
        formData.append("section", section.trim());
        formData.append("rollno", rollno.trim());
      } else {
        formData.append("address", address.trim());
      }

      const response = await fetch(`${API}/orders/orderprints`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Order failed");
      }

      navigate("/prints-cart");
    } catch (err) {
      alert(err.message || "Error placing order.");
      console.error("Order submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formDisabled = loading || profileLoading;

  return (
    <>
      {/* subtle, non-clumsy overlay while placing order */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: "14px 16px",
              maxWidth: 320,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Placing your order…
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Please don’t refresh or go back.
            </div>
          </div>
        </div>
      )}

      <div className="order-main-bg">
        <div className="order-tabs">
          <button
            className={`order-tab${activeTab === "student" ? " active" : ""}`}
            onClick={() => setActiveTab("student")}
            type="button"
            disabled={formDisabled}
          >
            CLASS ROOM <br /> DELIVERY
          </button>
          <button
            className={`order-tab${activeTab === "others" ? " active" : ""}`}
            onClick={() => setActiveTab("others")}
            type="button"
            disabled={formDisabled}
          >
            HOME <br /> DELIVERY
          </button>
        </div>

        <form className="order-form-wrap" onSubmit={handleSubmit}>
          <fieldset disabled={formDisabled} style={{ border: "none", padding: 0 }}>
            <h2>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Printout
              Order
            </h2>

            <input
              type="text"
              className="input"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="tel"
              className="input"
              placeholder="Mobile Number"
              value={mobile}
              maxLength={10}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                setMobile(digitsOnly);
              }}
              required
            />

            <p>
              To Custom orders please contact Hemanth:{" "}
              <a href="tel:+919182415750">+91 9182415750</a>
            </p>

            {activeTab === "student" && (
              <>
                <select
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map((clg) => (
                    <option key={clg} value={clg}>
                      {clg}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="input"
                  placeholder="Studying Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />

                <input
                  type="text"
                  className="input"
                  placeholder="Branch (e.g., CSE, ECE)"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                />

                <input
                  type="text"
                  className="input"
                  placeholder="Registration Number"
                  value={rollno}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
              </>
            )}

            {activeTab === "others" && (
              <textarea
                className="input"
                placeholder="Delivery Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            )}

            <div className="input-row">
              <input
                id="pdfFile"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
                required
              />

              <label
                htmlFor="pdfFile"
                className="custom-file-label"
                style={{
                  border: "1px solid #ccc",
                  padding: "6px 12px",
                  display: "inline-block",
                  cursor: "pointer",
                  background: "#f8f8f8",
                }}
              >
                {file ? file.name : "Choose File"}
              </label>

              <p style={{ marginLeft: 12 }}>Max Size: 10MB</p>
            </div>

            {pdfError && <div className="error-text">{pdfError}</div>}
            {pages > 0 && <div className="pdf-pages-info">Pages detected: {pages}</div>}

            <span>Worried about your large file size?</span><br />
            <a
              href="https://www.ilovepdf.com/compress_pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: "8px",
                padding: "6px 12px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "12px",
                cursor: "pointer",
                display: "inline-block",
                textDecoration: "none",
              }}
            >
              Compress file size here
            </a>

            <br />

            <div className="input-row">
              <span>Colour options</span>
              <select value={color} onChange={(e) => setColor(e.target.value)} required>
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <span>Sides</span>
              <select value={sides} onChange={(e) => setSides(e.target.value)} required>
                {SIDES_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-row">
              <span>Binding Options</span>
              <select value={binding} onChange={(e) => setBinding(e.target.value)} required>
                {BINDING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <span>Copies</span>
              <input
                type="number"
                className="input"
                min={1}
                value={copies}
                onChange={(e) => setCopies(Number(e.target.value || 1))}
                required
              />
            </div>

            <textarea
              className="input"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Coupon section */}
            <div className="input-row">
              <input
                type="text"
                className="input"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className="order-btn"
                style={{ maxWidth: 130, minHeight: 40, fontSize: "0.9rem" }}
                onClick={handleVerifyCoupon}
                disabled={couponLoading || formDisabled}
              >
                {couponLoading ? "Checking..." : "Apply Coupon"}
              </button>
            </div>

            {couponInfo && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: "0.9rem",
                  color:
                    couponInfo.status === "available" || couponInfo.status === "applied"
                      ? "#04793f"
                      : couponInfo.status === "used"
                        ? "#c27b00"
                        : "#c02a1e",
                }}
              >
                {couponInfo.message}{" "}
                {couponInfo.discountPercentage > 0 &&
                  `Discount: ${couponInfo.discountPercentage}%`}
              </div>
            )}

            <div className="input-row">
              <label htmlFor="paymentMethod" className="order-label">
                Select Payment Method
              </label>

              <select
                id="paymentMethod"
                className="input"
                value={payment}
                onChange={(e) => {
                  setPayment(e.target.value);
                  if (e.target.value !== "UPI") setTransactionImage(null);
                }}
                required
              >
                {PAYMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {payment === "UPI" && (
              <>
                <div className="upi-info">
                  <img src={qrImg} alt="UPI QR Code" className="qr" />
                  <p>
                    UPI ID: <b>papukumarsahu686-2@oksbi</b>
                  </p>
                </div>

                <label htmlFor="transactionUpload">
                  Transaction Details (Upload payment Screenshot)
                </label>
                <sub>Max Size: 10MB</sub>

                <input
                  id="transactionUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleTransactionImageChange}
                  style={{ display: "block", marginTop: 8 }}
                  required
                />

                {transactionImage && (
                  <div style={{ marginTop: 8 }}>
                    Selected file: {transactionImage.name}{" "}
                    <button type="button" onClick={() => setTransactionImage(null)} style={{ marginLeft: 8 }}>
                      Remove
                    </button>
                  </div>
                )}
              </>
            )}

            {file && pages > 0 && (
              <div className="total-cost-box">
                <p>
                  Original Price: ₹{originalPrice}
                  <span style={{ fontSize: "smaller", marginLeft: 8 }}>
                    (Prints ₹{printCost} + Binding ₹{bindingCost})
                  </span>
                </p>

                {couponDiscountPercent === 0 && discountValue > 0 && (
                  <p>15% Student Discount on Prints: -₹{discountValue.toFixed(2)}</p>
                )}

                {couponDiscountPercent > 0 && couponDiscountAmount > 0 && (
                  <p>
                    Coupon Discount ({couponDiscountPercent}% on total): -₹{couponDiscountAmount}
                  </p>
                )}

                <p>New Price: ₹{discountPrice}</p>
              </div>
            )}

            <button className="order-btn" type="submit" disabled={loading || pages <= 0}>
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </fieldset>
        </form>

        <div className="back-btn-wrapper">
          <a href="https://mybookhub.store/" className="back-link">
            <button className="back-btn">Back to MyBookHub</button>
          </a>
        </div>
      </div>
    </>
  );
}