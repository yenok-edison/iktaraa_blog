/**
 * Iktaraa Music Blog & Magazine Data File
 * ----------------------------------------------------------------------------
 * Maintain, edit, add, or delete blog articles directly in this file.
 * Each article supports rich markdown-ready sections, quotes, pro-tips,
 * specifications, audio demos, tags, and author credentials.
 */
import {
  siInstagram,
  siYoutube,
  siSpotify,
  siWhatsapp,
} from "simple-icons";


// -----------------------------------------------------------------------------
// SOCIAL MEDIA LINKS & CONTACT DETAILS (Rendered on Right Side)
// -----------------------------------------------------------------------------
export const SOCIAL_MEDIA_LINKS = [
  {
    name: "Instagram",
    handle: "@iktaraa_music",
    followers: "6K Musicians",
    url: "https://www.instagram.com/iktaraa_music/",
    color: "from-pink-500 via-rose-500 to-amber-500",
    icon: siInstagram,
  },
  {
    name: "YouTube",
    handle: "Iktaraa Music Studio",
    followers: "25K Subscribers",
    url: "https://www.youtube.com/@iktaraa-music-23",
    color: "from-red-600 to-rose-700",
    icon: siYoutube,
  },
  {
    name: "Spotify",
    handle: "Iktaraa Curated Playlists",
    followers: "85K Monthly Listeners",
    url: "https://spotify.com",
    color: "from-emerald-500 to-teal-700",
    icon: siSpotify,
  },
  {
    name: "WhatsApp Community",
    handle: "Iktaraa Gear Exchange",
    followers: "1K Active Members",
    url: "https://whatsapp.com",
    color: "from-green-500 to-emerald-600",
    icon: siWhatsapp,
  },
];

export const CONTACT_DETAILS = {
  headline: "Need Musical Assistance or Gear Advice?",
  subtext: "Connect directly with our in-house certified instrument specialists and sound engineers.",
  phone: "+91 7845205333",
  email: "support@iktaraa.com",
  editorialEmail: "support@iktaraa.com",
  storeHours: "Monday - Sunday: 10:00 AM - 9:00 PM IST",
  location: "No. 73, Anna Salai Road, Chennai - 600002, India",
};