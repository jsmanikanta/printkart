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

function getFreshToken() {
  return localStorage.getItem("token")?.trim() || "";
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existing) {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
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

async function parseResponseSafely(res) {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!text) {
    return {};
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getReadableError(data, fallback = "Something went wrong") {
  if (data?.error && typeof data.error === "string") return data.error;
  if (data?.message && typeof data.message === "string") return data.message;
  return fallback;
}

export default function OrderPrints() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_PATH;
  const token = useMemo(() => getFreshToken(), []);

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

  useEffect(() => {
    if (color === "colour" && sides !== "1") {
      setSides("1");
    }
  }, [color, sides]);

  useEffect(() => {
    const fetchProfile = async () => {
      const freshToken = getFreshToken();
      if (!freshToken) return;

      try {
        setProfileLoading(true);

        const res = await fetch(`${API}/user/profile`, {
          headers: {
            Authorization: `Bearer ${freshToken}`,
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
    const freshToken = getFreshToken();

    if (!freshToken) {
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
          Authorization: `Bearer ${freshToken}`,
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
    const freshToken = getFreshToken();

    if (!freshToken) {
      throw new Error("Please login again.");
    }

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
        Authorization: `Bearer ${freshToken}`,
      },
      body: formData,
    });

    const data = await parseResponseSafely(res);

    if (!res.ok || !data?.success) {
      throw new Error(data?.message || data?.error || "Failed to create order");
    }

    return data.order;
  };

  const createRazorpayOrder = async (printOrderId) => {
    const freshToken = getFreshToken();

    if (!freshToken) {
      throw new Error("Please login again.");
    }

    const res = await fetch(`${API}/payments/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${freshToken}`,
      },
      body: JSON.stringify({ printOrderId }),
    });

    const data = await parseResponseSafely(res);

    console.log("Razorpay create-order browser response:", {
      status: res.status,
      ok: res.ok,
      data,
    });

    const hasUsablePayload =
      !!data?.key &&
      !!data?.razorpayOrderId &&
      Number(data?.amount) > 0 &&
      !!data?.currency;

    if (hasUsablePayload) {
      return data;
    }

    if (!res.ok) {
      throw new Error(
        getReadableError(data, `Create-order failed with status ${res.status}`),
      );
    }

    throw new Error(getReadableError(data, "Failed to create Razorpay order"));
  };

  const verifyRazorpayPayment = async ({
    printOrderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) => {
    const freshToken = getFreshToken();

    if (!freshToken) {
      throw new Error("Please login again.");
    }

    const res = await fetch(`${API}/payments/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${freshToken}`,
      },
      body: JSON.stringify({
        printOrderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    });

    const data = await parseResponseSafely(res);

    if (!res.ok || !data?.success) {
      throw new Error(getReadableError(data, "Payment verification failed"));
    }

    return data;
  };

  const markPaymentFailed = async ({ printOrderId, razorpayOrderId }) => {
    const freshToken = getFreshToken();

    if (!freshToken || !printOrderId || !razorpayOrderId) {
      return;
    }

    try {
      await fetch(`${API}/payments/payment-failed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify({
          printOrderId,
          razorpayOrderId,
        }),
      });
    } catch (error) {
      console.error("payment-failed update error:", error);
    }
  };

  const openRazorpay = async (order) => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      throw new Error("Razorpay SDK failed to load");
    }

    const printOrderId = order?._id || order?.id;

    if (!printOrderId) {
      throw new Error("Order ID missing. Failed to start payment.");
    }

    const paymentData = await createRazorpayOrder(printOrderId);

    return new Promise((resolve, reject) => {
      try {
        const razorpay = new window.Razorpay({
          key: paymentData.key,
          amount: Number(paymentData.amount),
          currency: paymentData.currency || "INR",
          name: "PrintKart",
          description: "Print order payment",
          order_id: paymentData.razorpayOrderId,
          handler: async (response) => {
            try {
              const verifyData = await verifyRazorpayPayment({
                printOrderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              resolve(verifyData);
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: async () => {
              await markPaymentFailed({
                printOrderId,
                razorpayOrderId: paymentData.razorpayOrderId,
              });
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

          await markPaymentFailed({
            printOrderId,
            razorpayOrderId: paymentData.razorpayOrderId,
          });

          reject(
            new Error(
              response?.error?.description ||
                "Payment failed. Please try again.",
            ),
          );
        });

        razorpay.open();
      } catch (error) {
        reject(new Error(error?.message || "Unable to open Razorpay checkout"));
      }
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
