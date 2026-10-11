import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pollards Opticians",
    short_name: "Pollards",
    description: "Book an eye appointment with Pollards Opticians, Wakefield.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf9fc",
    theme_color: "#9f34b5",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
