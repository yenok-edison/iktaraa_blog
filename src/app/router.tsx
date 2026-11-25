
import { Navigate, Route, Routes } from "react-router-dom";

import App from "../App";
import EventsPage from "../features/events/pages/EventsPage";
import { EventAuthProvider } from "../features/events/context/EventAuthContext";

export default function AppRouter() {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate to="/blogs" replace />} />

      {/* Blog routes */}
      <Route path="/blogs" element={<App />} />
      <Route path="/blogs/:slug" element={<App />} />

      {/* Events routes */}
      
      {/* Events listing */}
      <Route
        path="/events"
        element={
          <EventAuthProvider>
            <EventsPage />
          </EventAuthProvider>
        }
      />

      {/* Individual event detail */}
      <Route
        path="/events/:slug"
        element={
          <EventAuthProvider>
            <EventsPage />
          </EventAuthProvider>
        }
      />

    </Routes>
  );
}
