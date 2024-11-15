import { Inter } from "next/font/google";
import { NextProviders } from "../providers/nextUiProvider";
import { appConfig } from "@/appConfig";
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
            <body className={clsx("min-h-screen bg-background", inter.className)}>
                <NextProviders themeProps={{ attribute: "class", defaultTheme: "dark" }}>
                    <MiniKitProvider>{children}</MiniKitProvider>
                </NextProviders>
            </body>
        </html>
    );
}
