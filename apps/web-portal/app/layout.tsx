import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'BankCore Web Portal',
  description: 'BankCore enterprise digital banking platform',
};

const tailwindConfig = `
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        "colors": {
          "primary": "#004ac6",
          "secondary": "#4648d4",
          "tertiary": "#4d556b",
          "background": "#f8f9ff",
          "surface": "#f8f9ff",
          "error": "#ba1a1a",
          "success-emerald": "#10B981",
          "warning-amber": "#F59E0B",
          "surface-container-lowest": "#ffffff",
          "surface-container-low": "#eff4ff",
          "surface-container": "#e5eeff",
          "surface-container-high": "#dce9ff",
          "surface-container-highest": "#d3e4fe",
          "on-surface": "#0b1c30",
          "on-surface-variant": "#434655",
          "outline-variant": "#c3c6d7",
          "outline": "#737686",
          "inverse-surface": "#213145",
          "inverse-on-surface": "#eaf1ff",
          "inverse-primary": "#b4c5ff",
          "chart-1": "#3B82F6",
          "chart-2": "#8B5CF6",
          "chart-3": "#EC4899",
          "chart-4": "#F97316",
          "chart-5": "#10B981",
          "error-rose": "#E11D48",
          "error-container": "#ffdad6",
          "on-error-container": "#93000a"
        },
        "spacing": {
          "lg": "24px",
          "xl": "32px",
          "2xl": "48px",
          "margin-desktop": "40px",
          "md": "16px",
          "margin-mobile": "16px",
          "unit": "8px",
          "sm": "8px",
          "gutter": "24px",
          "xs": "4px"
        }
      }
    }
  }
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" className="light">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script dangerouslySetInnerHTML={{ __html: tailwindConfig }}></script>
      </head>
      <body className="bg-slate-50 text-on-surface font-body-md text-body-md min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
