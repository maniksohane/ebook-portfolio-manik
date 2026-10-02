import Navbar from "../../components/Navbar";
import EbookShowcase from "../../components/EbookShowcase";

export const metadata = {
  title: "E-Books | Manikya Publishing",
  description:
    "Practical Microsoft Dynamics 365 CE, Dataverse and Power Platform e-books by Manikya Sohane.",
};

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-6 sm:pt-32">
        <EbookShowcase showAll />
      </div>
      <footer className="border-t border-white/[0.07] px-5 py-8 text-center text-sm text-white/35 sm:px-6">
        © {new Date().getFullYear()} Manikya Publishing. All rights reserved.
      </footer>
    </main>
  );
}
