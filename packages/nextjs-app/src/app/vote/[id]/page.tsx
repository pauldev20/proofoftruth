"use client";

import { useRouter } from "next/navigation";
import IconButton from "@/components/iconButton";
import Navbar from "@/components/navbar";
import { Button } from "@nextui-org/button";
import { Radio, RadioGroup } from "@nextui-org/radio";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Slider } from "@nextui-org/slider";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

function ListItem() {
    return (
        <div>
            <h1>Answer ABC</h1>
        </div>
    );
}

interface VotePageProps {
    params: { id: string };
}
export default function VotePage({ params }: VotePageProps) {
    const router = useRouter();

    return (
        <section className="h-screen flex flex-col items-center">
            <Navbar
                startContent={
                    <IconButton icon={<ChevronLeftIcon className="size-7" onClick={() => router.back()} />} />
                }
            />
            <h1 className="text-2xl font-bold text-center">Test Question?</h1>
            <p className="text-sm opacity-50">
                100.000 <span className="font-bold">WLD</span>
            </p>
            <RadioGroup label="Answers" className="w-full px-2">
                <ScrollShadow hideScrollBar className="w-full gap-3 grid py-5 px-3">
                    {Array.from({ length: 50 }).map((_, index) => (
                        <Radio key={index} value={index.toString()}>
                            {index}
                        </Radio>
                    ))}
                </ScrollShadow>
            </RadioGroup>
            <div className="w-full flex flex-col items-center gap-2 p-3 mt-auto">
                <div className="w-full flex items-center gap-2">
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
                    />
                    <Button color="primary">Stake 1 WLD</Button>
                </div>
                <div className="w-3/4 h-px bg-gray-300" />
                <div className="w-full items-center">
                    <Button color="primary" fullWidth>
                        Submit Selection
                    </Button>
                    <p className="text-xs text-center">
                        Current Possible Return: 10 <span className="font-bold">WLD</span>
                    </p>
                </div>
            </div>
        </section>
    );
}
