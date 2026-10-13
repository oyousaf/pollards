import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pollards",
    short_name: "Pollards",
    description: "Book an eye appointment with Pollards, Wakefield.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf9fc",
    theme_color: "#1e0b32",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
