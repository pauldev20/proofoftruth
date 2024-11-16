"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import StatementItem from "@/components/statementItem";
import deployedContracts from "@/contracts/deployedContracts";
import { Input } from "@nextui-org/input";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { createPublicClient, getContract, http } from "viem";
import { worldchain } from "viem/chains";
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
    const [statements, setStatements] = useState<Statement[]>([]);
    const [results, setResults] = useState<Statement[]>([]);
    const router = useRouter();

    useEffect(() => {
        const client = createPublicClient({
            chain: worldchain,
            transport: http("https://worldchain-mainnet.g.alchemy.com/public"),
        });
        const HumanOrcale = getContract({
            address: deployedContracts[client.chain.id].MockHumanOracle.address as `0x${string}`,
            abi: deployedContracts[client.chain.id].MockHumanOracle.abi,
            client,
        });

        (async () => {
            const input = (await HumanOrcale.read.getVotingList()) as Array<Array<unknown>>;
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
