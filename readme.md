Hostel Management System

Welcome to the Hostel Management System project! This system provides a comprehensive solution for managing hostel rooms and bookings. It includes a frontend for students to book rooms and check availability and an admin panel for hostel administrators to manage room details and availability.

Features

For Students:

Room Booking: Easily book hostel rooms by providing the necessary personal details.

Availability Check: Check the real-time availability of rooms before booking.

For Admins:

Room Management: Add new rooms, update existing room details (number of beds, room type, floor, balcony availability, etc.).

Availability Management: Mark rooms as available or unavailable based on maintenance or other factors.

Project Structure

frontend/: Contains HTML, CSS, and JavaScript files for the frontend user interface.

server.js: Backend server built using Node.js and Express.js. Handles API requests, database operations (if used), and serves the frontend files.

Installation and Setup

To set up the Hostel Management System locally, follow these steps:

Clone the repository:

git clone https://github.com/your-username/hostel-management-system.git

cd hostel-management-system

Install dependencies:

npm install

Start the server:

node server.js

Access the application:

Open index.html in your browser to access the student booking interface.

Open admin.html in your browser to access the admin panel for room management.

API Endpoints

The backend provides the following API endpoints:

GET /api/rooms: Fetch all available rooms.

POST /api/book: Book a room with provided student details.

POST /api/admin/rooms: Add or update room details (admin panel).

GET /api/admin/rooms: Fetch all rooms for admin management.

Technologies Used

Frontend: HTML, CSS, JavaScript (Vanilla)

Backend: Node.js, Express.js

Database: (Optional, if implemented)

Contributing

Contributions are welcome! If you have any ideas for improvements or new features, feel free to submit a pull request.

License

This project is licensed under the MIT License - see the LICENSE file for details.