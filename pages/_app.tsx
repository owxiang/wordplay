import React, { useState } from "react";
import "../styles/globals.css";
import { EmailProvider } from "../contexts/EmailContext";
import { AppProps } from "next/app";
import Head from "next/head";

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  const [email, setEmail] = useState("");

  return (
    <EmailProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Component {...pageProps} />
    </EmailProvider>
  );
};

export default MyApp;
