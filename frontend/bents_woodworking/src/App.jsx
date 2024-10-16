import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './Header';
import Section1 from './Section1';
import Footer from './Footer';
import Chat from './Chat';
import Shop from './Shop';

function App() {
  const location = useLocation();
  const [isChatVisible, setIsChatVisible] = useState(false);
  const showFooter = location.pathname !== '/chat';

  useEffect(() => {
    setIsChatVisible(location.pathname === '/chat');
  }, [location]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow ${location.pathname !== '/' ? 'pt-[75px]' : ''}`}>
        <Routes>
          <Route path="/" element={<Section1 />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
        <div className={`fixed inset-0 bg-white ${isChatVisible ? 'block' : 'hidden'}`}>
          <Chat isVisible={isChatVisible} />
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
