const API_CONFIG = {
    BASE_URL: '../api',
    ENDPOINTS: {
        COURSES: '/courses.php',
        SLIDESHOW: '/slideshow.php',
        UPLOAD: '/upload.php'
    },
    getUrl(endpoint) {
        return this.BASE_URL + this.ENDPOINTS[endpoint];
    }
};