// main.js
document.getElementById('booking-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const bookingData = {
        name: document.getElementById('name').value,
        course: document.getElementById('course').value,
        university: document.getElementById('university').value,
        duration: document.getElementById('duration').value,
        studentId: document.getElementById('student-id').value,
        phone: document.getElementById('phone').value,
        caretakerPhone: document.getElementById('caretaker-phone').value,
    };

    fetch('/api/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    })
        .then(response => response.json())
        .then(data => {
            alert('Booking successful!');
            loadRooms();
        })
        .catch(error => console.error('Error:', error));
});

function loadRooms() {
    fetch('/api/rooms')
        .then(response => response.json())
        .then(data => {
            const roomsList = document.getElementById('rooms-list');
            roomsList.innerHTML = '';
            data.rooms.forEach(room => {
                const roomDiv = document.createElement('div');
                roomDiv.textContent = `Room ${room.number}: ${room.beds} beds, ${room.type}, ${room.floor} floor, Balcony: ${room.balcony}`;
                roomsList.appendChild(roomDiv);
            });
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', loadRooms);
