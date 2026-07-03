import React from "react";
import "./styles/privacy.css";

const PrivacyPolicy = () => {
  console.log("[printkart:PrivacyPolicy] Rendered");

  return (
    <div className="pk-privacy-page">
      <div className="pk-privacy-card">
        <h1>Privacy Policy</h1>

        <section>
          <p>
            PrintKart is committed to protecting your privacy and ensuring the
            security of your personal information. This Privacy Policy explains
            how we collect, use, store, and protect information when you use our
            printing services.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>

          <p>We may collect the following information:</p>

          <ul>
            <li>Name</li>
            <li>Email Address</li>
            <li>Phone Number</li>
            <li>Uploaded Documents for Printing</li>
            <li>Order Preferences and Instructions</li>
            <li>Delivery Information (if applicable)</li>
            <li>Payment Information processed through secure gateways</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>

          <ul>
            <li>Process and fulfill print orders.</li>
            <li>Communicate order updates and support requests.</li>
            <li>Improve platform performance and user experience.</li>
            <li>Prevent misuse and fraudulent activity.</li>
            <li>Maintain transaction records.</li>
          </ul>
        </section>

        <section>
          <h2>Document Privacy</h2>

          <p>
            Files uploaded to PrintKart are used solely for processing print
            orders.
          </p>

          <p>
            We do not sell, share, distribute, or publish your uploaded
            documents to third parties.
          </p>

          <p>
            Documents may be temporarily stored for order processing and are
            periodically removed after completion of the order.
          </p>
        </section>

        <section>
          <h2>Payments</h2>

          <p>
            PrintKart may use trusted third-party payment providers to process
            transactions securely.
          </p>

          <p>
            We do not store your card details, banking credentials, or payment
            passwords on our servers.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>

          <ul>
            <li>Cloudinary</li>
            <li>MongoDB Atlas</li>
            <li>Payment Gateway Providers</li>
            <li>Hosting Providers</li>
            <li>Email Communication Services</li>
          </ul>
        </section>

        <section>
          <h2>Log Data</h2>

          <p>
            We may collect technical information such as IP address, browser
            type, device information, operating system, and usage analytics for
            security and performance monitoring.
          </p>
        </section>

        <section>
          <h2>Data Security</h2>

          <p>
            We implement industry-standard security measures to protect user
            information. However, no online transmission method is completely
            secure.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>

          <p>
            PrintKart services are not intended for children under the age of
            13. We do not knowingly collect information from children under 13.
          </p>
        </section>

        <section>
          <h2>Policy Updates</h2>

          <p>
            We may update this Privacy Policy periodically. Changes become
            effective immediately after publication on this page.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>

          <p>
            If you have questions regarding this Privacy Policy, contact us:
          </p>

          <p>
            <strong>Email:</strong> support@mybookhub.store
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
