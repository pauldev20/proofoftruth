"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";
import { MiniKit, ResponseEvent } from "@worldcoin/minikit-js";
import { createPublicClient, http, getContract } from "viem";
import { worldchain } from "viem/chains";
import deployedContracts from "@/contracts/deployedContracts";

const subscribeToWalletAuth = async (nonce: string) => {
    return new Promise((resolve, reject) => {
        MiniKit.subscribe(ResponseEvent.MiniAppWalletAuth, async payload => {
            if (payload.status === "error") {
                reject(new Error("Payload status is error"));
            } else {
                try {
                    const response = await fetch("/api/siwe", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            payload: payload,
                            nonce,
                        }),
                    });

                    if (!response.ok) {
                        reject(new Error("Failed to complete SIWE"));
                    }

                    const responseData = await response.json();
                    resolve(responseData);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
};

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onLoginSignup = async () => {
        setLoading(true);

		const client = createPublicClient({
			chain: worldchain,
			transport: http("https://worldchain-mainnet.g.alchemy.com/public"),
		});
		const HumanOrcale = getContract({
			address: deployedContracts[worldchain].MockHumanOracle.address,
			abi: deployedContracts[worldchain].MockHumanOracle.abi,
			client
		});

		// get wallet auth
        try {
            const res = await fetch(`/api/nonce`);
            const { nonce } = await res.json();

            const generateMessageResult = MiniKit.commands.walletAuth({
                nonce: nonce,
                expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                statement: "Login or create an account",
            });
            console.log(generateMessageResult);
            const result = await subscribeToWalletAuth(nonce);
        } catch (error) {
            console.error(error);
            setLoading(false);
			return;
        }

		// check if registered?
		try {
			const result = HumanOrcale.read.isUserRegistered(MiniKit.walletAddress);
			console.log(result);
		} catch (error) {
			console.error(error);
			setLoading(false);
			return;
		}

		// // if not registered, register
		// try {

		// }
    };

    return (
        <section className="h-dvh flex flex-col items-center justify-center">
            <Button color="primary" radius="sm" onClick={onLoginSignup} isLoading={loading}>
                Sign In / Sign Up
            </Button>
        </section>
    );
}
