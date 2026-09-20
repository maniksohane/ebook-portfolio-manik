import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "Manikya Sohane | Microsoft Dynamics CRM Consultant",
  description:
    "Microsoft Dynamics CRM, Dynamics 365 CE, Power Platform and Azure integration consultant.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}