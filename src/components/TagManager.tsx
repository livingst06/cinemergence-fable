import Script from "next/script";

const GTM_ID = "GTM-KF4DTPJH";

const consentDefault = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  var choix = null;
  try { choix = localStorage.getItem('cinemergence-cookie-consent'); } catch (e) {}
  var etat = choix === 'accepted' ? 'granted' : 'denied';
  gtag('consent', 'default', {
    ad_storage: etat, ad_user_data: etat, ad_personalization: etat,
    analytics_storage: etat, wait_for_update: 500
  });
  dataLayer.push({ event: 'consent_ready', consent_choice: choix || 'none' });
`;

const gtmLoader = `
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://wisdom.cinemergence.fr/0zn3viavka62j2g.js?awl='+i.replace(/^GTM-/, '')+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${GTM_ID}');
`;

/** Conteneur Tag Manager servi par wisdom.cinemergence.fr, après le consentement par défaut. */
export function TagManager() {
  return (
    <>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
      <Script id="consent-default" strategy="beforeInteractive">
        {consentDefault}
      </Script>
      <Script id="gtm" strategy="afterInteractive">
        {gtmLoader}
      </Script>
    </>
  );
}
