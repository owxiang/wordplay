import React, { useState } from 'react';
import '../styles/globals.css';
import { EmailProvider } from '../contexts/EmailContext';
import { AppProps } from 'next/app'; 

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [email, setEmail] = useState('');

  return (
    <EmailProvider>
      <Component {...pageProps} />
    </EmailProvider>
  );
}

export default MyApp;