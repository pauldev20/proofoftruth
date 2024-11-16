import { useEffect, useState } from "react";
import { waitOnTransaction } from "@/lib/miniKit";
import { useContractContext } from "@/providers/contractProvider";
import { Button } from "@nextui-org/button";
import { Slider } from "@nextui-org/slider";
import { MiniKit } from "@worldcoin/minikit-js";
import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface BottomSheetProps {
    selected: string | null;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    data: {
        answers: { answer: string; stake: number }[];
        totalStake: number;
    };
    id: number;
}
export default function BottomSheet({ selected, loading, setLoading, data, id }: BottomSheetProps) {
    const [stateStr, setStateStr] = useState("ongoing");
    const [stakeFactor, setStakeFactor] = useState(1);
    const { HumanOracle } = useContractContext();

    useEffect(() => {
        (async () => {
            const over = (await HumanOracle.read.isVotingOver([id])) as boolean;
            const voted = (await HumanOracle.read.hasUserVotedForVote([id])) as boolean;
            const claimed = (await HumanOracle.read.getUserHasClaimedForVote([id])) as boolean;

            if (!over && !voted) {
                setStateStr("ongoing");
            } else if (!over && voted) {
                setStateStr("voted");
            } else if (over && !claimed) {
                setStateStr("claimable");
            } else if (over && claimed) {
                setStateStr("claimed");
            }
        })();
    }, []);

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
                        args: [Number(id), data.answers.findIndex(item => item.answer === selected) || 0, stakeFactor],
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
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div
            className="w-full flex flex-col items-center gap-2 p-3 py-7 mt-auto rounded-t-2xl"
            style={{ boxShadow: "0 -4px 6px -2px rgba(0, 0, 0, 0.1)" }}
        >
            {stateStr == "claimed" && (
                <div className="flex flex-row gap-1 items-center">
                    <h1 className="text-xl">No reward to claim</h1>
                    <ExclamationCircleIcon className="size-8 text-yellow-500" />
                </div>
            )}
            {stateStr == "voted" && (
                <div className="flex flex-row gap-1 items-center">
                    <h1 className="text-xl">You submitted a vote</h1>
                    <CheckIcon className="size-10 text-green-500" />
                </div>
            )}
            {stateStr == "claimable" && (
                <Button fullWidth color="primary" disabled={loading} onClick={handleClaim}>
                    Claim Reward
                </Button>
            )}
            {stateStr == "ongoing" && (
                <>
                    <Slider
                        size="md"
                        step={1}
                        color="primary"
                        label="Leverage"
                        showSteps={true}
                        maxValue={5}
                        minValue={1}
                        getValue={level => `${level}x`}
                        defaultValue={1}
                        value={stakeFactor}
                        onChange={value => setStakeFactor(value as number)}
                    />
                    <div className="w-3/4 h-px bg-gray-300" />
                    <div className="w-full items-center">
                        <Button
                            color="primary"
                            fullWidth
                            isDisabled={!selected}
                            onClick={handleVote}
                            isLoading={loading}
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
