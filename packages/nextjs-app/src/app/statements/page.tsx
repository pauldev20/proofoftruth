"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import StatementItem from "@/components/statementItem";
import { useContractContext } from "@/providers/contractProvider";
import { Input } from "@nextui-org/input";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Spinner } from "@nextui-org/spinner";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface AddressComponentProps {
    address: string;
}
function AddressComponent({ address }: AddressComponentProps) {
    const addr = address.length > 15 ? address.slice(0, 10) + "..." + address.slice(-8) : address;

    return <p className="font-bold">{addr}</p>;
}

interface TotalPayoutProps {
    total: number;
}
function TotalPayout({ total }: TotalPayoutProps) {
    return (
        <p>
            Total Payout: <span className="font-bold">{total} WLD</span>
        </p>
    );
}

type Statement = {
    id: number;
    statement: string;
    totalStake: number;
};

export default function HomePage() {
    const [statements, setStatements] = useState<Statement[] | null>(null);
    const [results, setResults] = useState<Statement[]>([]);
    const { HumanOracle } = useContractContext();
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const input = (await HumanOracle.read.getVotingList()) as Array<Array<unknown>>;
            const result = input[0].map(
                (id, index) =>
                    ({
                        id: Number(id),
                        statement: input[1][index],
                        totalStake: Number(input[2][index]),
                    }) as Statement,
            );

            setStatements(result);
            setResults(result);
        })();
    }, []);

    if (!statements) {
        return (
            <section className="h-dvh flex flex-col items-center justify-center">
                <Spinner size="lg" />
            </section>
        );
    }

    return (
        <section className="h-dvh flex flex-col items-center">
            <Navbar
                endContent={<TotalPayout total={100} />}
                startContent={<AddressComponent address="vitalik.eth" />}
            />
            <Input
                type="text"
                isClearable
                placeholder="Search"
                className="px-3"
                startContent={<MagnifyingGlassIcon className="size-4" />}
            />
            <ScrollShadow hideScrollBar className="w-full gap-3 grid py-5 px-3">
                {results.length > 0 ? (
                    results.map(event => (
                        <StatementItem
                            key={event.id}
                            amount={event.totalStake}
                            title={event.statement}
                            onClick={() => router.push(`/vote/${event.id}`)}
                        />
                    ))
                ) : (
                    <p className="w-full text-center">No statements found</p>
                )}
            </ScrollShadow>
        </section>
    );
}
