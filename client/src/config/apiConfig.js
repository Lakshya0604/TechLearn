
// PROD (Render build) me API_BASE_URL khali string rehta hai,
// isliye requests same-origin (jis domain pe app hosted hai) chali jaati hain.
// DEV me (npm run dev) local backend (port 8080) hit hota hai.
export const API_BASE_URL = import.meta.env.PROD
    ? ""
    : "http://localhost:8080";