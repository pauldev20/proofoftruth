"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import deployedContracts from "@/contracts/deployedContracts";
import { Button } from "@nextui-org/button";
import {
    MiniAppSendTransactionPayload,
    MiniAppVerifyActionPayload,
    MiniAppVerifyActionSuccessPayload,
    MiniKit,
    ResponseEvent,
    VerificationLevel,
} from "@worldcoin/minikit-js";
import { createPublicClient, decodeAbiParameters, getContract, hexToBigInt, http } from "viem";
import { worldchain, optimism } from "viem/chains";

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

const subscribeToTransaction = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        MiniKit.subscribe(ResponseEvent.MiniAppSendTransaction, async (payload: MiniAppSendTransactionPayload) => {
            if (payload.status === "error") {
                console.error("Error sending transaction", payload);

                reject(new Error("Error sending transaction: " + payload.details));
            } else {
                resolve(payload.transaction_id);
            }
        });
    });
};

const subscribeToVerifyAction = async (): Promise<MiniAppVerifyActionSuccessPayload> => {
    return new Promise((resolve, reject) => {
        MiniKit.subscribe(ResponseEvent.MiniAppVerifyAction, async (response: MiniAppVerifyActionPayload) => {
            if (response.status === "error") {
                console.log("Error payload", response);

                return reject(new Error("Error in MiniAppVerifyAction payload"));
            }
            resolve(response as MiniAppVerifyActionSuccessPayload);
        });
    });
};

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const onLoginSignup = async () => {
        setLoading(true);

        const client = createPublicClient({
            chain: optimism,
            // transport: http("https://worldchain-mainnet.g.alchemy.com/public"),
            transport: http("https://optimism.llamarpc.com"),
        });
        const HumanOrcale = getContract({
            address: deployedContracts[optimism.id].MockHumanOracle.address as `0x${string}`,
            abi: deployedContracts[optimism.id].MockHumanOracle.abi,
            client,
        });

        // get wallet auth
        try {
            const res = await fetch(`/api/nonce`);
            const { nonce } = await res.json();

            const generateMessageResult = await MiniKit.commands.walletAuth({
                nonce: nonce,
                expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                statement: "Login or create an account",
            });

            console.log(generateMessageResult);
            const result = await subscribeToWalletAuth(nonce);

            console.log(result);
        } catch (error) {
            console.error(error);
            setLoading(false);

            return;
        }

        // check if registered and register if not
        try {
            const result = await HumanOrcale.read.isUserRegistered([MiniKit.walletAddress]);

            console.log(result);
            if (true || result == false) {
                MiniKit.commands.verify({
                    action: "registration",
                    signal: MiniKit.walletAddress!,
                    verification_level: VerificationLevel.Orb,
                });
                const verifyResult = await subscribeToVerifyAction();

                console.log(verifyResult);
				// @todo only optimism???
                const transactionPayload = MiniKit.commands.sendTransaction({
                    transaction: [
                        {
                            address: deployedContracts[optimism.id].MockHumanOracle.address,
                            abi: deployedContracts[optimism.id].MockHumanOracle.abi,
                            functionName: "signUpWithWorldId",
                            args: [
                                hexToBigInt(verifyResult.merkle_root as `0x${string}`),
                                hexToBigInt(verifyResult.nullifier_hash as `0x${string}`),
                                decodeAbiParameters([{ type: "uint256[8]" }], verifyResult.proof as `0x${string}`)[0],
                            ],
                        },
                    ],
                });

                console.log(transactionPayload);
                const transactionId = await subscribeToTransaction();

                console.log(transactionId);
                // useWaitForTransactionReceipt({
                // 	client: client,
                // 	appConfig: {
                // 		app_id: process.env.NEXT_PUBLIC_APP_ID,
                // 	},
                // 	transactionId: transactionId,
                // })
            } else {
                router.replace("/statements");
            }
        } catch (error) {
            console.error(error);
            setLoading(false);

            return;
        }
    };

    return (
        <section className="h-dvh flex flex-col items-center justify-center">
            <Button color="primary" isLoading={loading} radius="sm" onClick={onLoginSignup}>
                Sign In / Sign Up
            </Button>
        </section>
    );
}
