import { MiniKit } from "@worldcoin/minikit-js";

export interface TransactionStatus {
    transactionHash: `0x${string}`;
    transactionStatus: "pending" | "mined" | "failed";
}
export async function waitOnTransaction(transactionId: string): Promise<TransactionStatus> {
    while (true) {
        try {
            const response = await fetch(
                `https://developer.worldcoin.org/api/v2/minikit/transaction/${transactionId}?app_id=${MiniKit.appId}&type=transaction`,
            );
            const data: TransactionStatus = await response.json();

            if (data.transactionStatus === "mined" || data.transactionStatus === "failed") {
                return data;
            }

            await new Promise<void>(resolve => setTimeout(resolve, 2000));
        } catch (error) {
            throw Error(`Error while waiting on transaction ${error}`);
        }
    }
}
