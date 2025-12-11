export const metadata = {
  title: "RiskLens – Contract Risk Checker",
  description: "Paste a contract and get quick risk flags."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          background: "#0b1020",
          color: "white"
        }}
      >
        {children}
      </body>
    </html>
  );
}
