"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IconButton from "@/components/iconButton";
import Navbar from "@/components/navbar";
import { useContractContext } from "@/providers/contractProvider";
import { Button } from "@nextui-org/button";
import { Radio, RadioGroup } from "@nextui-org/radio";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Slider } from "@nextui-org/slider";
import { Spinner } from "@nextui-org/spinner";
import { cn } from "@nextui-org/theme";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { MiniKit } from "@worldcoin/minikit-js";
import { waitOnTransaction } from "@/lib/miniKit";


interface CustomRadioProps {
    children: React.ReactNode;
    value: string;
}
function CustomRadio({ children, value, ...otherProps }: CustomRadioProps) {
    return (
        <Radio
            {...otherProps}
            value={value}
            classNames={{
                base: cn(
                    "inline-flex m-0 bg-content2 hover:bg-gray-200 items-center justify-between",
                    "flex-row-reverse max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                    "transition transition-background duration-300",
                ),
            }}
        >
            {children}
        </Radio>
    );
}

type Statement = {
    statement: string;
    answers: {
        answer: string;
        stake: number;
    }[];
    totalStake: number;
};
function convertData(input: unknown): Statement {
    // @ts-ignore
    const [statement, answers, totalStake, stakes] = input;

    const answersWithStakes = answers.map((answer: any, index: number) => ({
        answer: answer,
        stake: Number(stakes[index]),
    }));

    return {
        statement: statement,
        answers: answersWithStakes, //.concat(answersWithStakes).concat(answersWithStakes),
        totalStake: Number(totalStake),
    };
}

interface VotePageProps {
    params: { id: string };
}
export default function VotePage({ params }: VotePageProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [data, setData] = useState<Statement | null>(null);
    const [stakeFactor, setStakeFactor] = useState(1);
    const [loading, setLoading] = useState(false);
    const { HumanOracle } = useContractContext();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            setData(convertData(await HumanOracle.read.getVotingPage([params.id])));
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
                        args: [
                            Number(params.id),
                            data.answers.findIndex(item => item.answer === selected) || 0,
                            stakeFactor,
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
            console.log(tx);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (!data) {
        return (
            <section className="h-dvh flex flex-col items-center justify-center">
                <Spinner size="lg" />
            </section>
        );
    }

    return (
        <section className="h-dvh flex flex-col bg-gr">
            <Navbar
                startContent={
                    <IconButton
                        disabled={loading}
                        icon={<ChevronLeftIcon className="size-7" onClick={() => router.back()} />}
                    />
                }
            />
            <div className="w-full p-5 pt-6 pb-6">
                <h1 className="text-3xl font-bold text-center">{data.statement}</h1>
                <p className="text-center opacity-50">
                    {data.totalStake} <span className="font-bold">WLD</span>
                </p>
            </div>
            <RadioGroup value={selected} onValueChange={setSelected} className="w-full px-2">
                <ScrollShadow hideScrollBar className="w-full gap-3 grid py-5 px-3">
                    {data.answers.map((answer, index) => (
                        <CustomRadio key={index} value={answer.answer}>
                            {answer.answer}
                        </CustomRadio>
                    ))}
                </ScrollShadow>
            </RadioGroup>
            <div
                className="w-full flex flex-col items-center gap-2 p-3 py-7 mt-auto rounded-t-lg"
                style={{ boxShadow: "0 -4px 6px -2px rgba(0, 0, 0, 0.1)" }}
            >
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
                    <Button color="primary" fullWidth isDisabled={!selected} onClick={handleVote} isLoading={loading}>
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
            </div>
        </section>
    );
}
