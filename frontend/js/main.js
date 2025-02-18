document.addEventListener('DOMContentLoaded', function() {
    loadRooms();

    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const bookingData = {
                name: document.getElementById('name').value,
                course: document.getElementById('course').value,
                university: document.getElementById('university').value,
                courseDuration: document.getElementById('courseDuration').value,
                studentId: document.getElementById('studentId').value,
                personalPhone: document.getElementById('personalPhone').value,
                caretakerPhone: document.getElementById('caretakerPhone').value,
                room: document.getElementById('roomSelect').value,
                groupSize: document.getElementById('groupSize').value // Include group size
            };

            fetch('/api/bookings/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            })
            .then(response => response.json())
            .then(data => {
                alert('Booking successful!');
                loadRooms();
                document.getElementById('bookRoomForm').reset(); // Clear the form
            })
            .catch(error => console.error('Error:', error));
        });
    }

    function loadRooms() {
        fetch('/api/bookings/rooms')
            .then(response => response.json())
            .then(data => {
                const roomSelect = document.getElementById('roomSelect');
                if (roomSelect) {
                    roomSelect.innerHTML = '<option value="">Select a Room</option>';
                    data.forEach(room => {
                        const option = document.createElement('option');
                        option.value = room._id;
                        option.textContent = `Room ${room.number}: ${room.beds} beds, ${room.type}, Floor: ${room.floor}, Balcony: ${room.balcony ? 'Yes' : 'No'}`;
                        roomSelect.appendChild(option);
                    });
                }

                const roomsList = document.getElementById('rooms-list');
                if (roomsList) {
                    roomsList.innerHTML = '<h2>Available Rooms</h2>'; // Clear existing list
                    if (data.length === 0) {
                        roomsList.innerHTML = '<p>No rooms available.</p>';
                    } else {
                        data.forEach(room => {
                            const roomDiv = document.createElement('div');
                            roomDiv.innerHTML = `<strong>Room ${room.number}:</strong> ${room.beds} beds, ${room.type}, Floor: ${room.floor}, Balcony: ${room.balcony ? 'Yes' : 'No'}`;
                            roomsList.appendChild(roomDiv);
                        });
                    }
                }
            })
            .catch(error => console.error('Error:', error));
    }
});