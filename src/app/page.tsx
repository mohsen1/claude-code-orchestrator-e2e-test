import Navigation from '@/components/landing/navigation';
import Hero from '@/components/landing/hero';
import Features from '@/components/landing/features';
import Footer from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
