import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/footer.css";

function Footer() {
  const navigate = useNavigate();

  const orderprints = () => navigate("/orderprints");

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* About */}
        <div className="footer-section">
          <h4>PrintKart</h4>
          <p>
            PrintKart makes printing simple and convenient for students. Upload
            your files, choose print options, and get high-quality printouts
            ready without waiting in queues.
          </p>
        </div>

        {/* Print Categories */}
        <div className="footer-section">
          <h4>Printouts</h4>
          <ul className="footer-links">
            <li onClick={orderprints}>Assignments</li>
            <li onClick={orderprints}>Project Reports</li>
            <li onClick={orderprints}>Class Notes</li>
            <li onClick={orderprints}>College Notices / PDFs</li>
            <li onClick={orderprints}>Spiral Bindings</li>
            <li onClick={orderprints}>Black & White / Color Prints</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4>Contact</h4>

          <p>
            Email: 
            <a href="mailto:support@mybookhub.store">support@mybookhub.store</a>
          </p>

          <div>
            <p>
              Chat with Us: 
              <a
              href="https://wa.me/919182415750"
              className="whatsapp-contact"
              target="_blank"
              rel="noopener noreferrer"
            >
               WhatsApp
            </a>
            </p>
          </div>

          <p>
            Phone: 
            <a href="tel:+918074177294"> 8074177294</a>
          </p>

          <p>
            Support: 
            <a href="tel:+919182415750"> 9182415750</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 PrintKart</p>
      </div>
    </footer>
  );
}

export default Footer;
