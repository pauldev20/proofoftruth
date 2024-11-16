import { Inter } from "next/font/google";
import { NextProviders } from "../providers/nextUiProvider";
import { appConfig } from "@/appConfig";
import { ContractProvider } from "@/providers/contractProvider";
import { ErudaProvider } from "@/providers/eruda";
import { MiniKitProvider } from "@/providers/miniKitProvider";
import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

/* -------------------------------------------------------------------------- */
/*                                  Metadata                                  */
/* -------------------------------------------------------------------------- */
export const metadata: Metadata = {
    title: {
        default: appConfig.title,
        template: `%s - ${appConfig.title}`,
    },
    description: appConfig.description,
};

/* -------------------------------------------------------------------------- */
/*                                    Font                                    */
/* -------------------------------------------------------------------------- */
const inter = Inter({ subsets: ["latin"] });

// export const viewport: Viewport = {
//     themeColor: [
//         { media: "(prefers-color-scheme: light)", color: "white" },
//         { media: "(prefers-color-scheme: dark)", color: "black" },
//     ],
// };

/* -------------------------------------------------------------------------- */
/*                                   Layout                                   */
/* -------------------------------------------------------------------------- */
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning lang="en">
            <head />
            <body className={clsx("min-h-dvh text-foreground bg-background touch-none", inter.className)}>
                <NextProviders themeProps={{ attribute: "class", defaultTheme: "light", enableSystem: false }}>
                    <ContractProvider>
                        <ErudaProvider>
                            <MiniKitProvider>{children}</MiniKitProvider>
                        </ErudaProvider>
                    </ContractProvider>
                </NextProviders>
            </body>
        </html>
    );
}
