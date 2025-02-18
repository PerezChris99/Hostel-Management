# Hostel Management System

## Overview

The Hostel Management System is a web application designed to streamline the management of hostel rooms and bookings. It provides a user-friendly interface for students to book rooms and check availability, as well as a robust admin panel for hostel administrators to manage room details, bookings, and generate reports.

## Features

### For Students:

*   **Room Booking:** Students can easily book available hostel rooms by providing their personal details, course information, and contact information.
*   **Availability Check:** Real-time room availability is displayed, allowing students to see which rooms are currently available for booking.
*   **Group Bookings:** Students can book multiple rooms for a group, specifying the group size during the booking process.
*   **Dynamic Pricing:** The system calculates the booking price based on the room's base price and seasonal pricing rules.
*   **SMS Confirmation:** Students receive an SMS confirmation message upon successful booking.

### For Administrators:

*   **Secure Login:** Administrators can securely log in to the admin panel using their username and password.
*   **Room Management:**
    *   Add new rooms with details such as room number, number of beds, room type (single/double), floor, balcony availability, base price, and seasonal price.
    *   Update existing room details.
    *   Delete rooms.
*   **Role-Based Access Control:** Different administrator roles (e.g., admin, room manager, booking manager) can be assigned with specific permissions to manage different aspects of the system.
*   **Reporting and Analytics:**
    *   Generate occupancy rate reports to track the percentage of occupied rooms.
    *   Generate revenue reports to track total revenue.

## Technologies Used

*   **Frontend:** HTML, CSS, JavaScript
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB
*   **Authentication:** JSON Web Tokens (JWT)
*   **SMS Integration:** Twilio

## API Endpoints

### Student API

*   `GET /api/bookings/rooms`: Fetch all available rooms.
*   `POST /api/bookings/book`: Book a room with provided student details.

### Admin API

*   `POST /api/auth/login`: Authenticate an administrator and receive a JWT.
*   `POST /api/admin/rooms`: Add a new room (protected, admin/room manager role).
*   `GET /api/admin/rooms`: Fetch all rooms (protected, admin/room manager/booking manager role).
*   `PUT /api/admin/rooms/:id`: Update a room (protected, admin/room manager role).
*   `DELETE /api/admin/rooms/:id`: Delete a room (protected, admin role).
*   `GET /api/reports/occupancy`: Get the occupancy rate (protected, admin/room manager role).

## Installation and Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    cd backend
    npm install
    cd ../frontend
    npm install
    ```

3.  **Configure the database:**

    *   Ensure you have MongoDB installed and running.
    *   Update the connection string in [db.js](http://_vscodecontentref_/1) with your MongoDB connection details.

4.  **Configure Twilio:**

    *   Create a Twilio account and obtain your Account SID and Auth Token.
    *   Update the [accountSid](http://_vscodecontentref_/2) and [authToken](http://_vscodecontentref_/3) variables in [bookings.js](http://_vscodecontentref_/4) with your Twilio credentials.
    *   Obtain a Twilio phone number and update the [from](http://_vscodecontentref_/5) number in [bookings.js](http://_vscodecontentref_/6).

5.  **Set the JWT secret:**

    *   Replace `'your-secret-key'` in [auth.js](http://_vscodecontentref_/7) and [auth.js](http://_vscodecontentref_/8) with a strong, randomly generated secret key. Store this key securely (e.g., in an environment variable).

6.  **Create an initial admin user:**

    *   Use a tool like MongoDB Compass or the MongoDB shell to create an initial admin user in the `users` collection.  Ensure the user has the [role](http://_vscodecontentref_/9) field set to `"admin"`.  Hash the password using bcrypt before storing it in the database.

7.  **Start the server:**

    ```bash
    cd backend
    node server.js
    ```

8.  **Access the application:**

    *   Open [index.html](http://_vscodecontentref_/10) in your browser to access the student booking interface (e.g., `http://localhost:5000`).
    *   Open [admin.html](http://_vscodecontentref_/11) in your browser to access the admin panel.

## Authentication

The admin panel is protected by JWT authentication. After logging in, the server will return a JWT that must be included in the `x-auth-token` header of subsequent requests to protected API endpoints.

## Contributing

Contributions are welcome! If you have any ideas for improvements or new features, feel free to submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.