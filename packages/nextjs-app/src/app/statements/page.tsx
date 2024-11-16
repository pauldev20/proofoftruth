"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import StatementItem from "@/components/statementItem";
import { Input } from "@nextui-org/input";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
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

export default function HomePage() {
    const router = useRouter();
    const [results, setResults] = useState([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);

    return (
        <section className="h-dvh flex flex-col items-center">
            <Navbar
                startContent={<AddressComponent address="vitalik.eth" />}
                endContent={<TotalPayout total={100} />}
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
                    results.map((event, index) => (
                        <StatementItem key={index} onClick={() => router.push(`/vote/${event}`)} />
                    ))
                ) : (
                    <p className="w-full text-center">No statements found</p>
                )}
            </ScrollShadow>
        </section>
    );
}
