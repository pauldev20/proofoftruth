import { Inter } from "next/font/google";
import { NextProviders } from "../providers/nextUiProvider";
import { appConfig } from "@/appConfig";
import { ErudaProvider } from "@/components/eruda";
import { MiniKitProvider } from "@/providers/miniKitProvider";
import "@/styles/globals.css";
import clsx from "clsx";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
    title: {
        default: appConfig.title,
        template: `%s - ${appConfig.title}`,
    },
    description: appConfig.description,
    icons: {
        icon: "/favicon.ico",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html suppressHydrationWarning lang="en">
            <head />
            <body className={clsx("min-h-dvh bg-background touch-none", inter.className)}>
                <NextProviders themeProps={{ attribute: "class", defaultTheme: "light" }}>
                    <ErudaProvider>
                        <MiniKitProvider>{children}</MiniKitProvider>
                    </ErudaProvider>
                </NextProviders>
            </body>
        </html>
    );
}
