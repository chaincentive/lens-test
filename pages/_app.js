import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <div style={{ paddingLeft: "100px" }}>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
