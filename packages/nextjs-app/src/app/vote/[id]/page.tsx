"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomSheet from "./bottomSheet";
import IconButton from "@/components/iconButton";
import Navbar from "@/components/navbar";
import { waitOnTransaction } from "@/lib/miniKit";
import { useContractContext } from "@/providers/contractProvider";
import { Button } from "@nextui-org/button";
import { Radio, RadioGroup } from "@nextui-org/radio";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Slider } from "@nextui-org/slider";
import { Spinner } from "@nextui-org/spinner";
import { cn } from "@nextui-org/theme";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

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
    const [loading, setLoading] = useState(false);
    const { HumanOracle } = useContractContext();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            setData(convertData(await HumanOracle.read.getVotingPage([params.id])));
        })();
    }, []);

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
            <RadioGroup className="w-full px-2" value={selected} onValueChange={setSelected} isDisabled={loading}>
                <ScrollShadow hideScrollBar className="w-full gap-3 grid py-5 px-3">
                    {data.answers.map((answer, index) => (
                        <CustomRadio key={index} value={answer.answer}>
                            {answer.answer}
                        </CustomRadio>
                    ))}
                </ScrollShadow>
            </RadioGroup>
            <BottomSheet
                data={data}
                id={Number(params.id)}
                loading={loading}
                selected={selected}
                setLoading={setLoading}
            />
        </section>
    );
}
