const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "VITE_API_BASE_URL is not configured. Check your environment file."
  );
}

export const ENV = {
  API_BASE_URL: API_BASE_URL.replace(/\/+$/, ""),
};