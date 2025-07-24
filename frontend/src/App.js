import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { 
  AuthProvider,
  Header, 
  HeroSection, 
  PartnersSection, 
  FeaturesSection, 
  TestimonialsSection, 
  FAQSection, 
  CTASection, 
  Footer,
  GoogleCallback
} from "./components";

const GOOGLE_CLIENT_ID = "618587939737-gb4qg37rridfr3ds1397sk19s7nihlct.apps.googleusercontent.com";

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <PartnersSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/google" element={<GoogleCallback />} />
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;