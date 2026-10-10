import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "../components/providers";
import { PRODUCT_NAME } from "../lib/config";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: PRODUCT_NAME, template: `%s · ${PRODUCT_NAME}` },
  description: "Proof, not claims: every skill links to the code that shows it and the quiz that confirms it.",
};

/** Applies the saved theme before first paint so a dark-mode user never sees a light flash. Same key as hooks/use-theme. */
const THEME_BOOT = `try{var t=localStorage.getItem("ui-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-skin="hex" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="bg-bg text-fg">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
