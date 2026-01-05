import { url as API_URL } from './fetchUrl';

export async function getHealthStatus() {
    try {
        const response = await fetch(`${API_URL}/api/exams/status`, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error('Backend error');
        }

        const data = await response.json();
        return {
            backend: data.backend || 'Disconnected',
            db: data.db || 'Disconnected'
        };
    } catch (error) {
        console.error('Error fetching health status:', error);
        return {
            backend: 'Disconnected',
            db: 'Disconnected'
        };
    }
}

export async function checkDbConnection() {
    const status = await getHealthStatus();
    return status.db === 'Connected';
}
