const API_URL = 'http://localhost:8080/api';

export const api = {
    // Rooms
    getRooms: async () => {
        const res = await fetch(`${API_URL}/rooms`);
        return res.json();
    },
    createRoom: async (data) => {
        const res = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to create room');
        }
        return res.json();
    },
    updateRoom: async (id, data) => {
        const res = await fetch(`${API_URL}/rooms/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update room');
        }
        return res.json();
    },
    deleteRoom: async (id) => {
        const res = await fetch(`${API_URL}/rooms/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) {
            // Try to parse JSON error, fallback to text/status
            try {
                const error = await res.json();
                throw new Error(error.message || 'Failed to delete room');
            } catch (e) {
                throw new Error('Failed to delete room. It might be linked to tenants/bills.');
            }
        }
    },

    // Tenants
    getTenants: async () => {
        const res = await fetch(`${API_URL}/tenants`);
        return res.json();
    },
    addTenant: async (data, roomId) => {
        const res = await fetch(`${API_URL}/tenants?roomId=${roomId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    updateTenant: async (id, data, roomId) => {
        let url = `${API_URL}/tenants/${id}`;
        if (roomId) url += `?roomId=${roomId}`;

        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update tenant');
        return res.json();
    },
    deleteTenant: async (id) => {
        const res = await fetch(`${API_URL}/tenants/${id}`, {
            method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete tenant');
    },

    // Bills
    getBills: async () => {
        const res = await fetch(`${API_URL}/bills`);
        return res.json();
    },
    generateBill: async (roomId, currentReading, month, year, previousBalance, previousReading) => {
        let url = `${API_URL}/bills/generate?roomId=${roomId}&currentReading=${currentReading}`;
        if (month) url += `&month=${month}`;
        if (year) url += `&year=${year}`;
        if (previousBalance) url += `&previousBalance=${previousBalance}`;
        if (previousReading) url += `&previousReading=${previousReading}`;

        const res = await fetch(url, {
            method: 'POST',
        });
        return res.json();
    },

    // Payments
    recordPayment: async (billId, amount, mode) => {
        const res = await fetch(`${API_URL}/payments?billId=${billId}&amount=${amount}&mode=${mode}`, {
            method: 'POST',
        });
        return res.json();
    }
};
