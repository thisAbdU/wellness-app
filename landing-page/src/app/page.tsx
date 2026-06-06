import { CtaBanner } from '@/components/CtaBanner';
import { Faq } from '@/components/Faq';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { InstallGuide } from '@/components/InstallGuide';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <InstallGuide />
        <Faq />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
