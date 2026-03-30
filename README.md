# PrintKart – Smart Printing Solution

PrintKart is a student-focused online printing platform that allows users to upload documents and get high-quality printouts delivered directly to their classroom or home. It is designed to eliminate long queues at print shops and provide a fast, affordable, and convenient printing experience.

🌐 Live Website: https://printkart.mybookhub.store  

PrintKart enables users to upload PDFs, choose print options, and receive printed documents with doorstep delivery. :contentReference[oaicite:0]{index=0}  

## Features

- Upload documents (PDF, notes, assignments)
- Select print options (B/W or Color, sides, copies)
- Binding options (spiral, soft, book, etc.)
- Classroom or home delivery
- Order tracking system
- Secure user authentication
- Admin dashboard for order management
- Affordable pricing for students

## Project Structure

```bash
printkart/
│── frontend/        → React / HTML frontend
│── backend/         → Node.js + Express backend
│── models/          → MongoDB schemas
│── routes/          → API routes
│── controllers/     → Business logic
│── uploads/         → File handling (Cloudinary/local)
│── server.js        → Backend entry point
