import "./globals.css";
import ClientWrapper from "./ClientWrapper";

export const metadata = {
  metadataBase: new URL("https://kammaicontrust.org"),
  title: {
    default: "Kamma Icon Trust",
    template: "%s | Kamma Icon Trust",
  },
  description:
    "Kamma Icon Trust is a charitable organization focused on education, healthcare, and community development.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}