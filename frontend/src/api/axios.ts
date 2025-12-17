import axiosModule from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axios = axiosModule.create({
    baseURL: API_URL,
});

axios.defaults.headers.common['Content-Type'] = 'application/json';

export default axios;