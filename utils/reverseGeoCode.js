const axios = require('axios');

const reverseGeocode = async (latitude, longitude) => {
    if (latitude == null || longitude == null) return null;

    try {
        const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat: latitude,
                lon: longitude,
                format: 'json'
            },
            headers: {
                'User-Agent': 'ucheva-school-app'
            },
            timeout: 5000 // don't let a slow third-party call hang the request
        });
        return data?.display_name || null;
    } catch (err) {
        console.error('Reverse geocode failed:', err.message);
        return null;
    }
};

module.exports = reverseGeocode;