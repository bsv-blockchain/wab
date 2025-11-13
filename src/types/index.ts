import { HexString } from "@bsv/sdk";

/**
 * Represents minimal user entity
 */
export interface User {
    id: number;
    presentationKey: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Represents an Auth Method row
 */
export interface AuthMethodEntity {
    id: number;
    userId: number | null;
    methodType: string;
    config: string;
    receivedFaucet: boolean;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Represents a Payment row
 */
export interface PaymentEntity {
    id: number;
    userId: number | null;
    beef: Buffer;
    txid: string;
    k: HexString;
    amount: number;
    outputIndex: number;
    createdAt?: string;
    updatedAt?: string;
}
