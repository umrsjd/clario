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
  Footer 
} from "./components";

const GOOGLE_CLIENT_ID = "your-google-client-id"; // You'll need to replace this

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
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;