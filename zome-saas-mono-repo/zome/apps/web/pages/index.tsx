import React from 'react';
import styles from './login.module.less';
import Login from './login';
import Head from 'next/head';

export function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.less file.
   */
  return (
    <div className={styles.page}>
       <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
        <meta name="description" content="description of your project" />
        <meta name="theme-color" content="#000" />
        <title>ZOME</title>
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png"></link>
      </Head>
      <Login />
    </div>
  );
}

export default Index;
