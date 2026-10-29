import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import MainContent from "./components/MainContent.jsx";
import Footer from "./components/Footer.jsx";
import { apiRequest } from "./lib/api.js";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    apiRequest("/api/auth/me")
      .then((result) => setUser(result.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <>
      <Header user={user} onUserChange={setUser} />
      <main id="top">
        <Hero />
        <MainContent />
      </main>
      <Footer />
    </>
  );
}
