import React from "react";
import { useNavigate } from "react-router-dom";
function QuickInfoSection() {
  const navigate = useNavigate();
  const mediaItems = [
    {
      src: "/images/printkart_poster.jpeg",
      title: "PrintKart – All-in-One Printing",
      about:
        "Posters, Flyers, Polaroids & Bindings at best prices also 15% student offer + classroom delivery.",
      link: "/order-prints",
      isInternal: true,
    },
    {
      src: "/images/Polariaids.jpg",
      title: "Polaroids at PrintKart",
      about:
        "Turn your memories into beautiful polaroids — choose your size and get them delivered hassle-free",
      link: "https://form.jotform.com/261114021639043",
      isInternal: false,
    },
    {
      src: "/images/phone_case.jpeg",
      title: "Custom Phone Cases",
      about:
        "Turn your favorite memories into a phone case and carry them with you wherever you go",
      link: "https://www.instagram.com/print_kart0001/",
      isInternal: false,
    },
    {
      src: "/images/pock.jpeg",
      title: "Mini Polaroids Offer",
      about:
        "Get 35 mini polaroids for just ₹99 — capture your beautiful memories in a cute aesthetic way.",
      link: "https://form.jotform.com/261114021639043",
      isInternal: false,
    },
    {
      src: "/images/frames.jpeg",
      title: "Photo Frames Offer",
      about:
        "Beautiful photo frames starting at just ₹99 — turn your memories into aesthetic wall decor. Combo offer available for just ₹169!",
      link: "https://www.instagram.com/print_kart0001/",
      isInternal: false,
    },
    // this must be the last one printkart_poster
    {
      src: "/images/prices.jpeg",
      title: "Price List",
      about: "Detailed prints & binding prices",
      link: "/order-prints",
      isInternal: true,
    },
  ];

  const handleOrderNow = (item) => {
    if (item.isInternal) {
      navigate(item.link);
    } else {
      const newWindow = window.open(item.link, "_blank");
      if (newWindow) newWindow.opener = null;
    }
  };

  return (
    <div className="quick-root">
      <style>{`
        * {
          box-sizing: border-box;
        }

        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow-x: hidden;
        }

        .quick-root {
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #e0f2fe, #ffffff);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 12px 60px;
        }

        .quick-title {
          font-size: 30px;
          font-weight: 800;
          color: #111827;
          margin-bottom: 30px;
          text-align: center;
        }

        .card-container {
          width: 100%;
          max-width: 1100px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 25px;
        }

        .quick-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: 0.3s;
        }

        .quick-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }

        .image-frame {
          width: 100%;
          height: 260px;
          background: #f3f4f6;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 14px;
        }

        .quick-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .quick-card-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
          text-align: center;
        }

        .quick-card-about {
          font-size: 14px;
          color: #4b5563;
          text-align: center;
          margin-bottom: 16px;
        }

        .order-btn {
          background: linear-gradient(135deg, #ff4d6d, #ff7a18);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .order-btn:hover {
          transform: scale(1.05);
        }
      `}</style>

      <div className="quick-title">Order Prints</div>

      <div className="card-container">
        {mediaItems.map((item, idx) => (
          <div className="quick-card" key={idx}>
            <div className="image-frame">
              <img src={item.src} alt={item.title} className="quick-image" />
            </div>

            <div className="quick-card-title">{item.title}</div>
            <div className="quick-card-about">{item.about}</div>

            <button className="order-btn" onClick={() => handleOrderNow(item)}>
              Order Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickInfoSection;
