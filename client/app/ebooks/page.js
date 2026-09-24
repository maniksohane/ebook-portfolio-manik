import Navbar from "../../components/Navbar";
import EbookShowcase from "../../components/EbookShowcase";

export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-28 sm:px-6 sm:pt-32">
        <EbookShowcase />
      </div>
    </main>
  );
}
