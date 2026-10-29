import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import MainContent from "./components/MainContent.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <>
      <Header />
      <main id="top">
        <Hero />
        <MainContent />
      </main>
      <Footer />
    </>
  );
}
