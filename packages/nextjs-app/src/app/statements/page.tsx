"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AddressComponent from "./addressComponent";
import StatementItem from "./statementItem";
import IconButton from "@/components/iconButton";
import Navbar from "@/components/navbar";
import { useContractContext } from "@/providers/contractProvider";
import { Input } from "@nextui-org/input";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Spinner } from "@nextui-org/spinner";
import { MiniKit } from "@worldcoin/minikit-js";
import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */
type Statement = {
    id: number;
    statement: string;
    totalStake: number;
};

/* -------------------------------------------------------------------------- */
/*                                    Page                                    */
/* -------------------------------------------------------------------------- */
export default function HomePage() {
    const [statements, setStatements] = useState<Statement[] | null>(null);
    const [search, setSearch] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const { HumanOracle } = useContractContext();
    const router = useRouter();

    /* --------------- Fetch the statements list from the contract -------------- */
    const fetchVotingList = async () => {
        setStatements(null);
        const input = (await HumanOracle.read.getVotingList()) as Array<Array<unknown>>;

        setStatements(
            input[0].map(
                (id, index) =>
                    ({
                        id: Number(id),
                        statement: input[1][index],
                        totalStake: Number(input[2][index]),
                    }) as Statement,
            ),
        );
    };

    useEffect(() => {
        fetchVotingList();
    }, []);

    /* -------------------------- Search functionality -------------------------- */
    const results = useMemo(() => {
        if (!statements) return [];
        if (!search) return statements;

        return statements.filter(statement => statement.statement.toLowerCase().includes(search.toLowerCase()));
    }, [statements, search]);

    /* ----------------------- If loading, show a spinner ----------------------- */
    if (!statements || loading) {
        return (
            <section className="h-dvh flex flex-col items-center justify-center">
                <Spinner size="lg" />
            </section>
        );
    }

    return (
        <section className="h-dvh flex flex-col items-center">
            {/* Navbar */}
            <Navbar
                endContent={<IconButton icon={<ArrowPathIcon className="size-6" />} onClick={fetchVotingList} />}
                startContent={<AddressComponent address={MiniKit.walletAddress ?? "vitalik.eth"} />}
            />

            {/* Searchbar */}
            <Input
                isClearable
                className="px-3"
                placeholder="Search"
                startContent={<MagnifyingGlassIcon className="size-4" />}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClear={() => setSearch("")}
            />

            {/* Statements list */}
            <ScrollShadow hideScrollBar className="w-full gap-3 grid py-5 px-3">
                {results.length > 0 ? (
                    results.map(event => (
                        <StatementItem
                            key={event.id}
                            amount={event.totalStake}
                            title={event.statement}
                            onClick={() => {
                                setLoading(true);
                                router.push(`/vote/${event.id}`);
                            }}
                        />
                    ))
                ) : (
                    <p className="w-full text-center">No statements found</p>
                )}
            </ScrollShadow>
        </section>
    );
}
