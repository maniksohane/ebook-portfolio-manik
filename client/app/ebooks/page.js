import Navbar from "../../components/Navbar";
import EbookRoadmap from "../../components/EbookRoadmap";
import EbookShowcase from "../../components/EbookShowcase";

export const metadata = {
  title: "E-Books | Ebooks by Manik!",
  description:
    "Practical Microsoft Dynamics 365 CE, Dataverse and Power Platform e-books by Manikya Sohane.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <EbookRoadmap />
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24">
        <EbookShowcase showAll />
      </div>
      <footer className="border-t border-white/[0.07] px-5 py-8 text-center text-sm text-white/35 sm:px-6">
        © {new Date().getFullYear()} Ebooks by Manik! All rights reserved.
      </footer>
    </main>
  );
}
