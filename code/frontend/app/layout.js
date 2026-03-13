import "./globals.css";
import "@/styles/theme.css";

export const metadata = {
  title: "NeoConnect",
  description: "Staff feedback and complaint management platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
