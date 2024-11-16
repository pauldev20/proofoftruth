"use client";

import { ReactNode, createContext, useContext, useMemo } from "react";
import deployedContracts from "@/contracts/deployedContracts";
import {
    Address,
    GetContractReturnType,
    HttpTransport,
    PublicClient,
    createPublicClient,
    getContract,
    http,
} from "viem";
import { worldchain } from "viem/chains";

/* -------------------------------------------------------------------------- */
/*                               Initialization                               */
/* -------------------------------------------------------------------------- */
const chain = worldchain;
const contractName = "HumanOracle";
const rpcUrl = "https://worldchain-mainnet.g.alchemy.com/public";

const humanOracleAbi = deployedContracts[chain.id][contractName].abi;

/* -------------------------------------------------------------------------- */
/*                               ContractContext                              */
/* -------------------------------------------------------------------------- */
type ClientType = PublicClient<HttpTransport, typeof worldchain>;
type HumanOracleType = GetContractReturnType<typeof humanOracleAbi, ClientType, Address>;
interface ContractContextType {
    HumanOracle: HumanOracleType;
}
const ContractContext = createContext<ContractContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*                              ContractProvider                              */
/* -------------------------------------------------------------------------- */
interface ContractProviderProps {
    children: ReactNode;
}
export function ContractProvider({ children }: ContractProviderProps) {
    const HumanOracle = useMemo(() => {
        const client = createPublicClient({
            chain: chain,
            transport: http(rpcUrl),
        });

        return getContract({
            address: deployedContracts[client.chain.id][contractName].address as `0x${string}`,
            abi: humanOracleAbi,
            client,
        });
    }, []);

    return <ContractContext.Provider value={{ HumanOracle }}>{children}</ContractContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*                             useContractContext                             */
/* -------------------------------------------------------------------------- */
export function useContractContext(): ContractContextType {
    const context = useContext(ContractContext);

    if (!context) {
        throw new Error("useContractContext must be used within a ContractProvider");
    }

    return context;
}
