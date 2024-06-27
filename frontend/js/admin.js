// admin.js
document.getElementById('room-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const roomData = {
        number: document.getElementById('room-number').value,
        beds: document.getElementById('beds').value,
        type: document.getElementById('type').value,
        floor: document.getElementById('floor').value,
        balcony: document.getElementById('balcony').value,
    };

    fetch('/api/admin/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
    })
        .then(response => response.json())
        .then(data => {
            alert('Room updated!');
            loadAdminRooms();
        })
        .catch(error => console.error('Error:', error));
});

function loadAdminRooms() {
    fetch('/api/admin/rooms')
        .then(response => response.json())
        .then(data => {
            const adminRoomsList = document.getElementById('admin-rooms-list');
            adminRoomsList.innerHTML = '';
            data.rooms.forEach(room => {
                const roomDiv = document.createElement('div');
                roomDiv.textContent = `Room ${room.number}: ${room.beds} beds, ${room.type}, ${room.floor} floor, Balcony: ${room.balcony}`;
                adminRoomsList.appendChild(roomDiv);
            });
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', loadAdminRooms);
