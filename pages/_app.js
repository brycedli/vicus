import "../styles/global.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/vicus-dark.png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/vicus-light.png" media="(prefers-color-scheme: dark)" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
