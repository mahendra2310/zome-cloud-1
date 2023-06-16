import React from 'react';
import { AppProps } from 'next/app';
import './styles.less';
import '../components/style/tailwind.less';
import '../components/style/style.less';
import { AddToHomeScreen } from 'react-pwa-add-to-homescreen';

function CustomApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/service-worker.js").then(
          (registration) => {
            console.log(
              "ServiceWorker registration successful with scope: ",
              registration.scope
            );
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err);
          }
        );
      });
    }
  }, []);
  
  return (
    <>
      <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBht8VXDhG7fl4JFB5RiTMMFHbUJOMZIlw&libraries=places" />
      <main>
        <Component {...pageProps} />
        <AddToHomeScreen skipFirstVisit={false} cookie={{expireDays: 0}}/>
      </main>
    </>
  );
}

export default CustomApp;
