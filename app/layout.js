import "./globals.css";
import Script from "next/script";
import LottieLoader from "./components/LottieLoader";
import ClientWrapper from "./ClientWrapper";
import AdPopup from "./components/AdPopup";

export const metadata = {
  title: "Kamma Icon Trust",
  description: "Official website of Kamma Icon Trust, a non-profit organization dedicated to empowering the Kamma community through education, healthcare, and social welfare initiatives.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>

        <AdPopup />
        
        <LottieLoader />

      
      

        <ClientWrapper>
          {children}
        </ClientWrapper>

        
        

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ML2SCJJL5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ML2SCJJL5');
          `}
        </Script>
      </body>
    </html>
  );
}