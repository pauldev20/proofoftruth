"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IconButton from "@/components/iconButton";
import Navbar from "@/components/navbar";
import deployedContracts from "@/contracts/deployedContracts";
import { Button } from "@nextui-org/button";
import { Radio, RadioGroup } from "@nextui-org/radio";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Slider } from "@nextui-org/slider";
import { Spinner } from "@nextui-org/spinner";
import { createPublicClient, getContract, http } from "viem";
import { worldchain } from "viem/chains";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { cn } from "@nextui-org/theme";

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
            "inline-flex m-0 bg-content1 hover:bg-content2 items-center justify-between",
            "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent"
          )
        }}
      >
        {children}
      </Radio>
    );
};

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
        answers: answersWithStakes,
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
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const client = createPublicClient({
                chain: worldchain,
                transport: http("https://worldchain-mainnet.g.alchemy.com/public"),
            });
            const HumanOrcale = getContract({
                address: deployedContracts[client.chain.id].MockHumanOracle.address as `0x${string}`,
                abi: deployedContracts[client.chain.id].MockHumanOracle.abi,
                client,
            });

            setData(convertData(await HumanOrcale.read.getVotingPage([params.id])));
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
        <section className="h-dvh flex flex-col">
            <Navbar
                startContent={
                    <IconButton icon={<ChevronLeftIcon className="size-7" onClick={() => router.back()} />} />
                }
            />
            <div className="w-full p-5 pt-6 pb-10">
                <h1 className="text-2xl font-bold text-center">{data.statement}</h1>
                <p className="text-sm text-center opacity-50">
                    {data.totalStake} <span className="font-bold">WLD</span>
                </p>
            </div>
            <RadioGroup value={selected} onValueChange={setSelected} label="Answers" className="w-full px-2">
                <ScrollShadow hideScrollBar className="w-full gap-3 grid py-5 px-3">
                    {data.answers.map((answer, index) => (
                        <CustomRadio key={index} value={answer.answer}>
                            {answer.answer}
                        </CustomRadio>
                    ))}
                </ScrollShadow>
            </RadioGroup>
            <div className="w-full flex flex-col items-center gap-2 p-3 mt-auto">
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
                    <Button color="primary" fullWidth isDisabled={!selected}>
                        <p>
                            Submit Selection And Stake {stakeFactor} <span className="font-bold">WLD</span>
                        </p>
                    </Button>
                    <p className="text-xs text-center">
                        Current Possible Return:{" "}
                        {selected ? (
                            (data.totalStake / (data.answers.find(item => item.answer === selected)?.stake || 0)) *
                            stakeFactor
                        ).toPrecision(3) : "---"}{" "}
                        <span className="font-bold">WLD</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
