import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/footer.css";

function Footer() {
  const navigate = useNavigate();

  const orderprints = () => navigate("/orderprints");

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About */}
        <div className="footer-section footer-about">
          <h2>PrintKart</h2>

          <p>
            PrintKart is a student-focused online printing platform that allows
            users to upload documents, customize print settings, and receive
            high-quality printouts quickly and affordably. We simplify printing
            assignments, notes, project reports, and study materials.
          </p>
        </div>

        {/* Services */}
        <div className="footer-section">
          <h3>Print Services</h3>

          <p className="footer-link" onClick={orderprints}>
            Assignments →
          </p>

          <p className="footer-link" onClick={orderprints}>
            Project Reports →
          </p>

          <p className="footer-link" onClick={orderprints}>
            Class Notes →
          </p>

          <p className="footer-link" onClick={orderprints}>
            Spiral Binding →
          </p>

          <p className="footer-link" onClick={orderprints}>
            Black & White Prints →
          </p>

          <p className="footer-link" onClick={orderprints}>
            Color Prints →
          </p>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3>Contact</h3>

          <p>
            📧
            <a href="mailto:support@mybookhub.store">support@mybookhub.store</a>
          </p>

          <p>
            💬
            <a
              href="https://wa.me/919182415750"
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp Support
            </a>
          </p>

          <p>
            📞
            <a href="tel:+918074177294">8074177294</a>
          </p>

          <p>
            📷
            <a
              href="https://www.instagram.com/print_kart0001/"
              target="_blank"
              rel="noreferrer"
            >
              @print_kart0001
            </a>
          </p>

          <p
            className="footer-link"
            onClick={() => navigate("/privacy-policy")}
          >
            Privacy Policy
          </p>

          <p
            className="footer-link"
            onClick={() => navigate("/terms-and-conditions")}
          >
            Terms & Conditions
          </p>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <p>© 2026 PrintKart. All Rights Reserved.</p>
        <p>Made with ❤️ for Students.</p>
      </div>
    </footer>
  );
}

export default Footer;
