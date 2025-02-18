let authToken = null;

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('admin-panel');
    const loginDiv = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.token) {
                        authToken = data.token;
                        adminPanel.style.display = 'block';
                        loginDiv.style.display = 'none';
                        loadAdminRooms();
                    } else {
                        alert('Login failed: ' + data.msg);
                    }
                })
                .catch(error => console.error('Error:', error));
        });
    }

    const roomForm = document.getElementById('room-form');
    if (roomForm) {
        roomForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const roomData = {
                number: document.getElementById('room-number').value,
                beds: document.getElementById('beds').value,
                type: document.getElementById('type').value,
                floor: document.getElementById('floor').value,
                balcony: document.getElementById('balcony').checked,
            };

            fetch('/api/admin/rooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': authToken // Include token in header
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
    }

    function loadAdminRooms() {
        fetch('/api/admin/rooms', {
                headers: {
                    'x-auth-token': authToken // Include token in header
                }
            })
            .then(response => response.json())
            .then(data => {
                const adminRoomsList = document.getElementById('admin-rooms-list');
                if (adminRoomsList) {
                    adminRoomsList.innerHTML = '';
                    data.forEach(room => {
                        const roomDiv = document.createElement('div');
                        roomDiv.innerHTML = `Room ${room.number}: ${room.beds} beds, ${room.type}, ${room.floor} floor, Balcony: ${room.balcony}
                                             <button class="edit-room" data-id="${room._id}">Edit</button>
                                             <button class="delete-room" data-id="${room._id}">Delete</button>`;
                        adminRoomsList.appendChild(roomDiv);
                    });

                    // Add event listeners to edit and delete buttons
                    const editButtons = document.querySelectorAll('.edit-room');
                    editButtons.forEach(button => {
                        button.addEventListener('click', function() {
                            const roomId = this.dataset.id;
                            // Implement edit functionality here (e.g., open a modal)
                            console.log('Edit room:', roomId);
                        });
                    });

                    const deleteButtons = document.querySelectorAll('.delete-room');
                    deleteButtons.forEach(button => {
                        button.addEventListener('click', function() {
                            const roomId = this.dataset.id;
                            deleteRoom(roomId);
                        });
                    });
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function deleteRoom(roomId) {
        fetch(`/api/admin/rooms/${roomId}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': authToken // Include token in header
                }
            })
            .then(response => {
                if (response.ok) {
                    alert('Room deleted!');
                    loadAdminRooms();
                } else {
                    alert('Failed to delete room.');
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // Get occupancy rate
    const getOccupancyButton = document.getElementById('get-occupancy');
    if (getOccupancyButton) {
        getOccupancyButton.addEventListener('click', function() {
            fetch('/api/reports/occupancy', {
                    headers: {
                        'x-auth-token': authToken // Include token in header
                    }
                })
                .then(response => response.json())
                .then(data => {
                    const occupancyRateDiv = document.getElementById('occupancy-rate');
                    occupancyRateDiv.textContent = `Occupancy Rate: ${data.occupancyRate.toFixed(2)}%`;
                })
                .catch(error => console.error('Error:', error));
        });
    }
});