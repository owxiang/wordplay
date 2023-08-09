import React, { useState } from 'react';
import '../styles/globals.css';
import { EmailProvider } from '../contexts/EmailContext';

function MyApp({ Component, pageProps }) {
  const [email, setEmail] = useState('');

  return (
    
    <EmailProvider>
    <Component {...pageProps} />
  </EmailProvider>
  );
}

export default MyApp;




