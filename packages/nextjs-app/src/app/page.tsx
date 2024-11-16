"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContractContext } from "@/providers/contractProvider";
import { Button } from "@nextui-org/button";
import { MiniAppVerifyActionSuccessPayload, MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { decodeAbiParameters } from "viem";

export interface TransactionStatus {
    transactionHash: `0x${string}`;
    transactionStatus: "pending" | "mined" | "failed";
}
async function waitOnTransaction(transactionId: string): Promise<TransactionStatus> {
    while (true) {
        try {
            const response = await fetch(
                `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${MiniKit.appId}&type=transaction`,
            );
            const data: TransactionStatus = await response.json();

            if (data.transactionStatus === "mined" || data.transactionStatus === "failed") {
                return data;
            }

            await new Promise<void>(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            throw Error(`Error while waiting on transaction ${error}`);
        }
    }
}

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const { HumanOracle } = useContractContext();
    const router = useRouter();

    const onLoginSignup = async () => {
        setLoading(true);

        // get wallet auth
        try {
            const res = await fetch(`/api/nonce`);
            const { nonce } = await res.json();

            const walletAuthResult = await MiniKit.commandsAsync.walletAuth({
                nonce: nonce,
                expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                statement: "Login or create an account",
            });
            const siweResponse = await fetch("/api/siwe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    payload: walletAuthResult.finalPayload,
                    nonce,
                }),
            });

            if (!siweResponse.ok) {
                throw new Error("Failed to complete SIWE");
            }
            const siweData = await siweResponse.json();

            console.log(siweData);
        } catch (error) {
            console.error(error);
            setLoading(false);

            return;
        }

        // check if registered and register if not
        try {
            const result = (await HumanOracle.read.isUserRegistered([MiniKit.walletAddress])) as boolean;

            if (result == false) {
                const verifyResult = await MiniKit.commandsAsync.verify({
                    action: "registration",
                    signal: MiniKit.walletAddress!,
                    verification_level: VerificationLevel.Orb,
                });

                if (verifyResult.finalPayload.status === "error") {
                    throw new Error("Error in verify action");
                }
                const verifySuccessResult = verifyResult.finalPayload as MiniAppVerifyActionSuccessPayload;

                await new Promise(res => setTimeout(res, 2000)); // because of app bug

                const transactionResult = await MiniKit.commandsAsync.sendTransaction({
                    transaction: [
                        {
                            address: HumanOracle.address,
                            abi: HumanOracle.abi,
                            functionName: "signUpWithWorldId",
                            args: [
                                verifySuccessResult.merkle_root,
                                verifySuccessResult.nullifier_hash,
                                decodeAbiParameters(
                                    [{ type: "uint256[8]" }],
                                    verifySuccessResult.proof as `0x${string}`,
                                )[0].map((value: bigint) => `0x${value.toString(16).padStart(64, "0")}`),
                            ],
                        },
                    ],
                });

                if (transactionResult.finalPayload.status === "error") {
                    throw new Error("Error in submitting transaction");
                }

                const tx = await waitOnTransaction(transactionResult.finalPayload.transaction_id);

                if (tx.transactionStatus == "failed") {
                    throw Error("Error executing transaction");
                }
                router.replace("/statements");
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
