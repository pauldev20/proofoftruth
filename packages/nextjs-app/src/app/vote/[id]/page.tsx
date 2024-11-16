"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomSheet from "./bottomSheet";
import IconButton from "@/components/iconButton";
import Navbar from "@/components/navbar";
import { useContractContext } from "@/providers/contractProvider";
import { Radio, RadioGroup } from "@nextui-org/radio";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Spinner } from "@nextui-org/spinner";
import { cn } from "@nextui-org/theme";
import { MiniKit } from "@worldcoin/minikit-js";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */
type StatementPart = {
    statement: string;
    answers: {
        answer: string;
        stake: number;
    }[];
    totalStake: number;
};
export type Statement = StatementPart & {
    over: boolean;
    voted: boolean;
    claimed: boolean;
    payoutAmount: number;
};

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */
function convertData(input: unknown): StatementPart {
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

/* -------------------------------------------------------------------------- */
/*                                 CustomRadio                                */
/* -------------------------------------------------------------------------- */
interface CustomRadioProps {
    children: React.ReactNode;
    value: string;
}
function CustomRadio({ children, value, ...otherProps }: CustomRadioProps) {
    return (
        <Radio
            {...otherProps}
            classNames={{
                base: cn(
                    "inline-flex m-0 bg-content2 hover:bg-gray-200 items-center justify-between",
                    "flex-row-reverse max-w-full cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
                    "transition transition-background duration-300",
                ),
            }}
            value={value}
        >
            {children}
        </Radio>
    );
}

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */
interface VotePageProps {
    params: { id: string };
}
export default function VotePage({ params }: VotePageProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [data, setData] = useState<Statement | null>(null);
    const [loading, setLoading] = useState(false);
    const { HumanOracle } = useContractContext();
    const router = useRouter();

    /* --------------- Fetch the statement data from the contract --------------- */
    const fetchStatementData = async () => {
        // setData(null);
        const dataResult = convertData(await HumanOracle.read.getVotingPage([Number(params.id)]));

        const over = (await HumanOracle.read.isVotingOver([Number(params.id)])) as boolean;
        const voted = (await HumanOracle.read.hasUserVotedForVote([
            MiniKit.walletAddress,
            Number(params.id),
        ])) as boolean;
        const claimed = (await HumanOracle.read.hasUserClaimedForVote([
            MiniKit.walletAddress,
            Number(params.id),
        ])) as boolean;
        const payoutAmount = Number(
            await HumanOracle.read.getUserPayoutForVote([MiniKit.walletAddress, Number(params.id)]),
        );

        setData({
            ...dataResult,
            over,
            voted,
            claimed,
            payoutAmount,
        });
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (!loading) {
                fetchStatementData();
            }
        }, 3000);

        return () => clearInterval(intervalId);
    }, [loading]);

    /* ----------------------- If no data, show a spinner ----------------------- */
    if (!data) {
        return (
            <section className="h-dvh flex flex-col items-center justify-center">
                <Spinner size="lg" />
            </section>
        );
    }

    return (
        <section className="h-dvh flex flex-col bg-gr">
            {/* Navbar */}
            <Navbar
                startContent={
                    <IconButton
                        disabled={loading}
                        icon={<ChevronLeftIcon className="size-7" onClick={() => router.back()} />}
                    />
                }
            />

            {/* Statement */}
            <div className="w-full p-5 pt-6 pb-6">
                <h1 className="text-3xl font-bold text-center">{data.statement}</h1>
                <p className="text-center opacity-50">
                    {data.totalStake} <span className="font-bold">WLD</span>
                </p>
            </div>

            {/* Answers */}
            <RadioGroup
                className="w-full px-2"
                isDisabled={loading || data.over || data.voted}
                value={selected}
                onValueChange={setSelected}
            >
                <ScrollShadow hideScrollBar className="w-full gap-3 grid py-5 px-3">
                    {data.answers.map((answer, index) => (
                        <CustomRadio key={index} value={answer.answer}>
                            <div className="flex flex-col">
                                <p>{answer.answer}</p>
                                <p className="text-xs opacity-50">
                                    {answer.stake} <span className="font-bold">WLD</span>
                                </p>
                            </div>
                        </CustomRadio>
                    ))}
                </ScrollShadow>
            </RadioGroup>

            {/* Bottom Sheet */}
            <BottomSheet
                data={data}
                id={Number(params.id)}
                loading={loading}
                refresher={fetchStatementData}
                selected={selected}
                setLoading={setLoading}
            />
        </section>
    );
}
