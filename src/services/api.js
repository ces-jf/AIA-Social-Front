import axios from "axios";

const api = axios.create({baseURL: "http://localhost:3333"});

export const apiData = axios.create({baseURL: "http://localhost:8080"})

export default api;