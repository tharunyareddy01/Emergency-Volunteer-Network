const API_URL = "http://localhost:4000/api";

/*
========================================
COMMON API FUNCTION
========================================
*/

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}


/*
========================================
AUTHENTICATION
========================================
*/

export async function registerUser(userData) {
    return apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData)
    });
}


export async function loginUser(loginData) {
    return apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData)
    });
}


/*
========================================
USERS
========================================
*/

export async function getUser(userId) {
    return apiRequest(`/users/${userId}`);
}


export async function updateUser(userId, userData) {
    return apiRequest(`/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(userData)
    });
}


/*
========================================
VOLUNTEERS
========================================
*/

export async function getVolunteers() {
    return apiRequest("/volunteers");
}


export async function getAvailableVolunteers() {
    return apiRequest("/volunteers/available");
}


export async function updateVolunteerAvailability(
    volunteerId,
    availability
) {
    return apiRequest(`/volunteers/${volunteerId}/availability`, {
        method: "PUT",
        body: JSON.stringify({
            availability
        })
    });
}


/*
========================================
EMERGENCIES
========================================
*/

export async function createEmergency(emergencyData) {
    return apiRequest("/emergencies", {
        method: "POST",
        body: JSON.stringify(emergencyData)
    });
}


export async function getEmergencies() {
    return apiRequest("/emergencies");
}


export async function getEmergency(emergencyId) {
    return apiRequest(`/emergencies/${emergencyId}`);
}


export async function getAvailableEmergencies(userId) {
    return apiRequest(
        `/emergencies/available?userId=${userId}`
    );
}


/*
========================================
MESSAGES
========================================
*/

export async function getMessages(requestId) {
    return apiRequest(`/messages/${requestId}`);
}


export async function sendMessage(messageData) {
    return apiRequest("/messages", {
        method: "POST",
        body: JSON.stringify(messageData)
    });
}


/*
========================================
NOTIFICATIONS
========================================
*/

export async function getNotifications(userId) {
    return apiRequest(`/notifications/${userId}`);
}


export async function markNotificationRead(notificationId) {
    return apiRequest(
        `/notifications/${notificationId}/read`,
        {
            method: "PUT"
        }
    );
}