"use client";

import { ReactNode, useEffect, useState } from "react";
import { Spinner } from "@nextui-org/spinner";
import { MiniKit } from "@worldcoin/minikit-js";

/* -------------------------------------------------------------------------- */
/*                               CenterChildren                               */
/* -------------------------------------------------------------------------- */
function CenterChildren({ children }: { children: ReactNode }) {
    return <section className="h-screen w-screen flex items-center justify-center">{children}</section>;
}

/* -------------------------------------------------------------------------- */
/*                               MiniKitProvider                              */
/* -------------------------------------------------------------------------- */
interface MiniKitProviderProps {
    children: ReactNode;
}
export function MiniKitProvider({ children }: MiniKitProviderProps) {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        MiniKit.install(process.env.NEXT_PUBLIC_APP_ID);
        setIsReady(true);
    }, []);

    if (!isReady) {
        return (
            <CenterChildren>
                <Spinner size="lg" />
            </CenterChildren>
        );
    }

    if (!MiniKit.isInstalled() && process.env.NODE_ENV === "production") {
        return (
            <CenterChildren>
                <h1 className="m-3 text-center text-xl">Please only use this App within the World App!</h1>
            </CenterChildren>
        );
    }

    return <>{children}</>;
}
