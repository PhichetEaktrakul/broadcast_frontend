import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// Customer API URL
export const api = axios.create({ baseURL: apiUrl });
