import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/build/pdf.worker.mjs";
import "./styles/orderprints.css";

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
  { value: "colour", label: "Colour Xerox" },
];

const ALL_SIDES_OPTIONS = [
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
  { value: "Razorpay", label: "Online Payment" },
  { value: "Pay on Delivery", label: "Pay on Delivery" },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function OrderPrints() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_PATH;
  const token = useMemo(() => localStorage.getItem("token")?.trim() || "", []);

  const [activeTab, setActiveTab] = useState("student");
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [pages, setPages] = useState(0);
  const [pdfError, setPdfError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [rollno, setRollno] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  const [color, setColor] = useState("b/w");
  const [sides, setSides] = useState("1");
  const [binding, setBinding] = useState("none");
  const [copies, setCopies] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponInfo, setCouponInfo] = useState(null);
  const [couponDiscountValue, setCouponDiscountValue] = useState(0);

  const [printCost, setPrintCost] = useState(0);
  const [bindingCost, setBindingCost] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [studentDiscount, setStudentDiscount] = useState(0);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const availableSidesOptions = useMemo(() => {
    if (color === "colour") {
      return [{ value: "1", label: "Single Side" }];
    }
    return ALL_SIDES_OPTIONS;
  }, [color]);

  // useEffect(() => {
  //   if (!token) navigate("/login");
  // }, [token, navigate]);

  useEffect(() => {
    if (color === "colour" && sides !== "1") {
      setSides("1");
    }
  }, [color, sides]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        setProfileLoading(true);

        const res = await fetch(`${API}/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) return;

        const profile = await res.json();

        const fullName = profile?.fullname || profile?.user?.fullname || "";
        const mobileNumber =
          profile?.mobileNumber || profile?.user?.mobileNumber || "";
        const userCollege = profile?.college || profile?.user?.college || "";
        const userYear = profile?.year || profile?.user?.year || "";
        const userSection =
          profile?.section ||
          profile?.branch ||
          profile?.user?.section ||
          profile?.user?.branch ||
          "";
        const userRollno = profile?.rollno || profile?.user?.rollno || "";
        const userType = (
          profile?.usertype ||
          profile?.user?.usertype ||
          ""
        ).toLowerCase();

        if (fullName) setName(fullName);
        if (mobileNumber) {
          setMobile(String(mobileNumber).replace(/\D/g, "").slice(0, 10));
        }
        if (userCollege) setCollege(userCollege);
        if (userYear) setYear(userYear);
        if (userSection) setSection(userSection);
        if (userRollno) setRollno(userRollno);

        if (userType.includes("student")) {
          setActiveTab("student");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [API, token]);

  useEffect(() => {
    if (!file) {
      setPages(0);
      setPdfError("");
      return;
    }

    const readPdf = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        setPages(pdf.numPages);
        setPdfError("");
      } catch (error) {
        console.error("PDF read error:", error);
        setPages(0);
        setPdfError("Invalid or corrupted PDF file");
      }
    };

    readPdf();
  }, [file]);

  useEffect(() => {
    if (!pages || pages <= 0) {
      setPrintCost(0);
      setBindingCost(0);
      setOriginalPrice(0);
      setDiscountPrice(0);
      setStudentDiscount(0);
      return;
    }

    let pricePerPage = 0;

    if (color === "b/w" && sides === "1") pricePerPage = 1.5;
    else if (color === "b/w" && sides === "2") pricePerPage = 1;
    else if (color === "b/w" && sides === "2 per side") pricePerPage = 0.5;
    else if (color === "b/w" && sides === "4 per side") pricePerPage = 0.29;
    else if (color === "colour" && sides === "1") pricePerPage = 6;

    const safeCopies = Number(copies) > 0 ? Number(copies) : 1;
    const currentPrintCost = pricePerPage * pages * safeCopies;

    let currentBindingCost = 0;
    switch (binding) {
      case "spiral":
        currentBindingCost = 25 * safeCopies;
        break;
      case "stick":
        currentBindingCost = 15 * safeCopies;
        break;
      case "soft":
        currentBindingCost = 30 * safeCopies;
        break;
      case "book":
        currentBindingCost = 150 * safeCopies;
        break;
      default:
        currentBindingCost = 0;
    }

    const baseTotal = currentPrintCost + currentBindingCost;
    const autoStudentDiscount =
      activeTab === "student" && couponDiscountValue <= 0
        ? currentPrintCost * 0.15
        : 0;

    const finalTotal = Math.max(
      0,
      baseTotal - autoStudentDiscount - couponDiscountValue,
    );

    setPrintCost(Math.ceil(currentPrintCost));
    setBindingCost(Math.ceil(currentBindingCost));
    setOriginalPrice(Math.ceil(baseTotal));
    setStudentDiscount(Math.ceil(autoStudentDiscount));
    setDiscountPrice(Math.ceil(finalTotal));
  }, [color, sides, binding, copies, pages, activeTab, couponDiscountValue]);

  const handleFileChange = (e) => {
    const uploaded = e.target.files?.[0];
    setSubmitError("");

    if (!uploaded) {
      setFile(null);
      setPages(0);
      setPdfError("");
      return;
    }

    if (uploaded.type !== "application/pdf") {
      setPdfError("Only PDF files are allowed");
      e.target.value = "";
      return;
    }

    if (uploaded.size > MAX_FILE_SIZE) {
      setPdfError("PDF file size must be less than 10MB");
      e.target.value = "";
      return;
    }

    setFile(uploaded);
    setPdfError("");
  };

  const handleApplyCoupon = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!couponCode.trim()) {
      setCouponInfo({ type: "error", message: "Please enter coupon code" });
      return;
    }

    try {
      setCouponLoading(true);
      setCouponInfo(null);

      const res = await fetch(`${API}/coupon/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setCouponDiscountValue(0);
        setCouponInfo({
          type: "error",
          message: data?.error || data?.message || "Invalid coupon",
        });
        return;
      }

      const rawDiscount =
        Number(data?.data?.discount) ||
        Number(data?.data?.discountPercentage) ||
        Number(data?.discount) ||
        0;

      setCouponDiscountValue(rawDiscount);
      setCouponInfo({
        type: "success",
        message: `Coupon applied successfully. Discount: ₹${rawDiscount}`,
      });
    } catch (error) {
      console.error("Coupon error:", error);
      setCouponDiscountValue(0);
      setCouponInfo({
        type: "error",
        message: "Failed to apply coupon",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const validateForm = () => {
    if (!file) return "Please upload a PDF file";
    if (!pages || pages <= 0) return "PDF page count not detected";
    if (!name.trim()) return "Full name is required";

    const mobileDigits = mobile.replace(/\D/g, "").slice(0, 10);
    if (!/^\d{10}$/.test(mobileDigits)) {
      return "Please enter a valid 10-digit mobile number";
    }

    if (activeTab === "student") {
      if (!college.trim()) return "Please select college";
      if (!year.trim()) return "Please enter year";
      if (!section.trim()) return "Please enter branch / section";
      if (!rollno.trim()) return "Please enter registration number";
    }

    if (activeTab === "others" && !address.trim()) {
      return "Please enter delivery address";
    }

    return "";
  };

  const createPrintOrder = async () => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("color", color);
    formData.append("sides", sides);
    formData.append("binding", binding);
    formData.append("copies", String(Number(copies) || 1));
    formData.append("description", description.trim());
    formData.append("originalprice", String(originalPrice));
    formData.append("discountprice", String(discountPrice));
    formData.append("paymentMethod", paymentMethod);

    if (activeTab === "student") {
      formData.append("college", college.trim());
      formData.append("year", year.trim());
      formData.append("section", section.trim());
      formData.append("rollno", rollno.trim());
    } else {
      formData.append("address", address.trim());
    }

    const res = await fetch(`${API}/orders/orderprints`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.success) {
      throw new Error(data?.message || data?.error || "Failed to create order");
    }

    return data.order;
  };

  const openRazorpay = async (order) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Razorpay SDK failed to load");
    }

    const createOrderRes = await fetch(`${API}/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        printOrderId: order._id,
      }),
    });

    const paymentData = await createOrderRes.json().catch(() => ({}));

    if (!createOrderRes.ok || !paymentData?.success) {
      throw new Error(
        paymentData?.error ||
          paymentData?.message ||
          "Failed to create Razorpay order",
      );
    }

    if (!paymentData?.key) {
      throw new Error("Razorpay key missing from backend response");
    }

    if (!paymentData?.razorpayOrderId) {
      throw new Error("Razorpay order id missing from backend response");
    }

    return new Promise((resolve, reject) => {
      const razorpay = new window.Razorpay({
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency || "INR",
        name: "PrintKart",
        description: "Print order payment",
        order_id: paymentData.razorpayOrderId,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${API}/payments/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                printOrderId: order._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json().catch(() => ({}));

            if (!verifyRes.ok || !verifyData?.success) {
              reject(
                new Error(
                  verifyData?.error ||
                    verifyData?.message ||
                    "Payment verification failed",
                ),
              );
              return;
            }

            resolve(verifyData);
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: async () => {
            try {
              await fetch(`${API}/payments/payment-failed`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  printOrderId: order._id,
                  razorpayOrderId: paymentData.razorpayOrderId,
                }),
              });
            } catch (error) {
              console.error("Payment failed update error:", error);
            }

            reject(new Error("Payment cancelled"));
          },
        },
        prefill: {
          name: name.trim(),
          contact: mobile.replace(/\D/g, "").slice(0, 10),
        },
        theme: {
          color: "#d4a017",
        },
      });

      razorpay.on("payment.failed", async (response) => {
        console.error("Razorpay payment.failed:", response);

        try {
          await fetch(`${API}/payments/payment-failed`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              printOrderId: order._id,
              razorpayOrderId: paymentData.razorpayOrderId,
            }),
          });
        } catch (error) {
          console.error("payment.failed callback error:", error);
        }
      });

      razorpay.open();
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setSubmitError("");

    const error = validateForm();
    if (error) {
      setSubmitError(error);
      return;
    }

    try {
      setLoading(true);

      const order = await createPrintOrder();

      if (paymentMethod === "Razorpay") {
        await openRazorpay(order);
      }

      navigate("/prints-cart");
    } catch (error) {
      console.error("Order submit error:", error);
      setSubmitError(error?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const formDisabled = loading || profileLoading;

  return (
    <>
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
              borderRadius: 14,
              padding: "16px 18px",
              maxWidth: 320,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              Processing your order...
            </div>
            <div style={{ fontSize: 13, opacity: 0.75 }}>
              Please wait and do not refresh.
            </div>
          </div>
        </div>
      )}

      <div className="order-main-bg">
        <div className="order-tabs">
          <button
            type="button"
            className={`order-tab${activeTab === "student" ? " active" : ""}`}
            onClick={() => setActiveTab("student")}
            disabled={formDisabled}
          >
            CLASS ROOM <br /> DELIVERY
          </button>

          <button
            type="button"
            className={`order-tab${activeTab === "others" ? " active" : ""}`}
            onClick={() => setActiveTab("others")}
            disabled={formDisabled}
          >
            HOME <br /> DELIVERY
          </button>
        </div>

        <form className="order-form-wrap" onSubmit={handleSubmit}>
          <fieldset
            disabled={formDisabled}
            style={{ border: "none", padding: 0 }}
          >
            <h2>
              {activeTab === "student" ? "Student" : "Home"} Printout Order
            </h2>
            <span>Name:</span>
            <input
              type="text"
              className="input"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <span>Mobile Number:</span>
            <input
              type="tel"
              className="input"
              placeholder="Mobile Number"
              value={mobile}
              maxLength={10}
              onChange={(e) =>
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              required
            />

            <p>
              To custom orders please contact Hemanth:{" "}
              <a href="tel:+919182415750">+91 9182415750</a>
            </p>

            {activeTab === "student" ? (
              <>
                <span>Select Your College:</span>
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
                <span>Year of Study</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Studying Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                />
                Branch:
                <input
                  type="text"
                  className="input"
                  placeholder="Branch / Section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                />
                <span>Registration Number:</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Registration Number"
                  value={rollno}
                  onChange={(e) => setRollno(e.target.value)}
                  required
                />
              </>
            ) : (
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

              <label htmlFor="pdfFile" className="custom-file-label">
                {file ? file.name : "Choose PDF File"}
              </label>

              <p style={{ marginLeft: 12 }}>Max Size: 10MB</p>
            </div>

            {pdfError && <div className="error-text">{pdfError}</div>}
            {pages > 0 && (
              <div className="pdf-pages-info">Pages detected: {pages}</div>
            )}

            <span>Worried about large file size?</span>
            <br />
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
              Compress file here
            </a>

            <br />

            <div className="input-row">
              <span>Colour options</span>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                required
              >
                {COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <span>Sides</span>
              <select
                value={sides}
                onChange={(e) => setSides(e.target.value)}
                required
              >
                {availableSidesOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="input-row">
              <span>Binding Options</span>
              <select
                value={binding}
                onChange={(e) => setBinding(e.target.value)}
                required
              >
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
                onChange={(e) => setCopies(e.target.value)}
                required
              />
            </div>

            <textarea
              className="input"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

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
                style={{ maxWidth: 140, minHeight: 40, fontSize: "0.9rem" }}
                onClick={handleApplyCoupon}
                disabled={couponLoading || formDisabled}
              >
                {couponLoading ? "Checking..." : "Apply Coupon"}
              </button>
            </div>

            {couponInfo && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: "0.92rem",
                  color: couponInfo.type === "success" ? "#04793f" : "#c02a1e",
                }}
              >
                {couponInfo.message}
              </div>
            )}

            <div className="input-row">
              <label htmlFor="paymentMethod" className="order-label">
                Select Payment Method
              </label>

              <select
                id="paymentMethod"
                className="input"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                {PAYMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {file && pages > 0 && (
              <div className="total-cost-box">
                <p>
                  Original Price: ₹{originalPrice}
                  <span style={{ fontSize: "smaller", marginLeft: 8 }}>
                    (Prints ₹{printCost} + Binding ₹{bindingCost})
                  </span>
                </p>

                {studentDiscount > 0 && (
                  <p>Student Discount on Prints: -₹{studentDiscount}</p>
                )}

                {couponDiscountValue > 0 && (
                  <p>Coupon Discount: -₹{couponDiscountValue}</p>
                )}

                <p>Final Price: ₹{discountPrice}</p>
                <p>
                  Payment Method:{" "}
                  <b>
                    {paymentMethod === "Razorpay"
                      ? "Online Payment"
                      : "Pay on Delivery"}
                  </b>
                </p>
              </div>
            )}

            {submitError && (
              <div
                style={{
                  marginTop: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "#fff2f2",
                  color: "#c62828",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {submitError}
              </div>
            )}

            <button
              className="order-btn"
              type="submit"
              disabled={loading || profileLoading || pages <= 0}
            >
              {loading
                ? "Processing..."
                : paymentMethod === "Razorpay"
                  ? "Pay & Place Order"
                  : "Place Order"}
            </button>
          </fieldset>
        </form>

        <div className="back-btn-wrapper">
          <a href="https://mybookhub.store/" className="back-link">
            <button className="back-btn" type="button">
              Back to MyBookHub
            </button>
          </a>
        </div>
      </div>
    </>
  );
}
