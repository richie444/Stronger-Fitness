import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import MainContent from "./components/MainContent.jsx";
import Footer from "./components/Footer.jsx";
import AuthDialog from "./components/AuthDialog.jsx";
import OrderSuccess from "./components/OrderSuccess.jsx";
import { apiRequest } from "./lib/api.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    apiRequest("/api/auth/me")
      .then((result) => setUser(result.user))
      .catch(() => setUser(null));
  }, []);

  const isSuccessPage = window.location.pathname === "/success";

  return (
    <>
      <Header user={user} onUserChange={setUser} onAuthRequest={() => setAuthOpen(true)} />
      {isSuccessPage ? (
        <OrderSuccess />
      ) : (
        <main id="top">
          <Hero />
          <MainContent user={user} onAuthRequest={() => setAuthOpen(true)} />
        </main>
      )}
      <Footer />
      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onSignedIn={setUser} />}
    </>
  );
}
