import { useState } from "react";
import { Statement } from "./page";
import { waitOnTransaction } from "@/lib/miniKit";
import { useContractContext } from "@/providers/contractProvider";
import { Button } from "@nextui-org/button";
import { Slider } from "@nextui-org/slider";
import { Spinner } from "@nextui-org/spinner";
import { MiniKit } from "@worldcoin/minikit-js";
import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface BottomSheetProps {
    selected: string | null;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    refresher: () => Promise<void>;
    data: Statement;
    id: number;
}
export default function BottomSheet({ selected, loading, setLoading, refresher, data, id }: BottomSheetProps) {
    const [stakeFactor, setStakeFactor] = useState(1);
    const { HumanOracle } = useContractContext();

    const handleVote = async () => {
        if (!selected || !data) return;
        setLoading(true);

        try {
            const transactionResult = await MiniKit.commandsAsync.sendTransaction({
                transaction: [
                    {
                        address: HumanOracle.address,
                        abi: HumanOracle.abi,
                        functionName: "submitVotingDecisionWithStake",
                        args: [id, data.answers.findIndex(item => item.answer === selected) || 0, stakeFactor],
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
            console.log(tx);

            await refresher();

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!data) return;
        setLoading(true);

        try {
            const transactionResult = await MiniKit.commandsAsync.sendTransaction({
                transaction: [
                    {
                        address: HumanOracle.address,
                        abi: HumanOracle.abi,
                        functionName: "claimRewardForVote",
                        args: [Number(id)],
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
            console.log(tx);

            await refresher();

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div
            className="w-full flex flex-col items-center gap-2 p-5 mt-auto rounded-t-2xl"
            style={{ boxShadow: "0 -4px 6px -2px rgba(0, 0, 0, 0.1)" }}
        >
            {/* Loading Spinner */}
            {loading && (
                <div className="flex flex-row gap-1 items-center p-7">
                    <Spinner size="md" />
                </div>
            )}

            {/* No Reward Text */}
            {data.over && data.claimed && !loading && (
                <div className="flex flex-row gap-1 items-center p-7">
                    <h1 className="text-xl">No reward to claim</h1>
                    <ExclamationCircleIcon className="size-8 text-yellow-500" />
                </div>
            )}

            {/* Voted Text */}
            {!data.over && data.voted && !loading && (
                <div className="flex flex-row gap-1 items-center p-7">
                    <h1 className="text-xl">You submitted a vote</h1>
                    <CheckIcon className="size-10 text-green-500" />
                </div>
            )}

            {/* Over and Not Claimed Button */}
            {data.over && !data.claimed && !loading && (
                <Button fullWidth className="p-7" color="primary" disabled={loading} onClick={handleClaim}>
                    <p>
                        Claim {data.payoutAmount} <span className="font-bold">WLD</span>
                    </p>
                </Button>
            )}

            {/* Not Over and Not Voted */}
            {!data.over && !data.voted && !loading && (
                <>
                    <Slider
                        color="primary"
                        defaultValue={1}
                        getValue={level => `${level}x`}
                        label="Leverage"
                        maxValue={5}
                        minValue={1}
                        showSteps={true}
                        size="md"
                        step={1}
                        value={stakeFactor}
                        onChange={value => setStakeFactor(value as number)}
                    />
                    <div className="w-3/4 h-px bg-gray-300" />
                    <div className="w-full items-center">
                        <Button
                            fullWidth
                            color="primary"
                            isDisabled={!selected}
                            isLoading={loading}
                            onClick={handleVote}
                        >
                            <p>
                                Submit Selection And Stake {stakeFactor} <span className="font-bold">WLD</span>
                            </p>
                        </Button>
                        <p className="text-xs text-center">
                            Current Possible Return:{" "}
                            {selected
                                ? (
                                      (data.totalStake /
                                          (data.answers.find(item => item.answer === selected)?.stake || 0)) *
                                      stakeFactor
                                  ).toPrecision(3)
                                : "---"}{" "}
                            <span className="font-bold">WLD</span>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
