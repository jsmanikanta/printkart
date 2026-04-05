import React from "react";

function QuickInfoSection() {
  const mediaItems = [
    {
      src: "/images/prices.jpeg",
      title: "Price List",
      about: "Detailed print & binding prices",
      link: "https://printkart.mybookhub.store/#/order-prints",
    },
    {
      src: "/images/Polariaids.jpg",
      title: "Polaroids at PrintKart",
      about:
        "Turn your memories into beautiful polaroids — choose your size and get them delivered hassle-free",
      link: "https://www.instagram.com/print_kart0001/",
    },
    {
      src: "/images/phone_case.jpeg",
      title: "Custom Phone Cases",
      about:
        "Turn your favorite memories into a phone case and carry them with you wherever you go",
      link: "https://www.instagram.com/print_kart0001/",
    },
    {
      src: "/images/pock.jpeg",
      title: "Mini Polaroids Offer",
      about:
        "Get 35 mini polaroids for just ₹99 — capture your beautiful memories in a cute aesthetic way.",
      link: "https://www.instagram.com/print_kart0001/",
    },
  ];

  const handleOrderNow = (link) => {
    if (link.includes("printkart.mybookhub.store")) {
      window.location.href = link;
    } else {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };
  return (
    <div className="quick-root">
      <style>{`
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
          padding: 30px 10px 50px;
        }

        .quick-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 25px;
        }

        .card-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
          width: 100%;
          align-items: center;
        }

        .quick-card {
          width: min(360px, 92vw);
          background: #ffffff;
          border-radius: 20px;
          padding: 20px 16px 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.2s ease;
        }

        .quick-card:hover {
          transform: translateY(-4px);
        }

        .quick-image {
          width: 100%;
          border-radius: 14px;
          object-fit: cover;
          margin-bottom: 14px;
        }

        .quick-card-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
          text-align: center;
        }

        .quick-card-about {
          font-size: 14px;
          color: #4b5563;
          text-align: center;
          line-height: 1.5;
          margin-bottom: 16px;
          padding: 0 6px;
        }

        .order-btn {
          background: linear-gradient(135deg, #ff4d6d, #ff7a18);
          border: none;
          color: white;
          padding: 10px 20px;
          font-size: 14px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 600;
          transition: 0.2s;
        }

        .order-btn:hover {
          transform: scale(1.05);
        }

        @media (max-width: 600px) {
          .quick-title {
            font-size: 24px;
          }

          .quick-card {
            padding: 16px;
          }

          .quick-card-title {
            font-size: 16px;
          }

          .quick-card-about {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="quick-title">Quick Info</div>

      <div className="card-container">
        {mediaItems.map((item, idx) => (
          <div className="quick-card" key={idx}>
            <img src={item.src} alt={item.title} className="quick-image" />

            <div className="quick-card-title">{item.title}</div>

            <div className="quick-card-about">{item.about}</div>

            <button
              className="order-btn"
              onClick={() => handleOrderNow(item.link)}
            >
              Order Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuickInfoSection;
