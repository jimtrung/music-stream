/// <reference types="vite/client" />

export const API_BASE_URL = `http://${import.meta.env.VITE_IP_ADDRESS}:${import.meta.env.VITE_BACKEND_PORT}`;
export const MINIO_BASE_URL = `http://${import.meta.env.VITE_IP_ADDRESS}:${import.meta.env.VITE_MINIO_PORT}/musicstream`;  

