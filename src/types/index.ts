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
    userId: number;
    methodType: string;
    config: Record<string, any>;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Represents a Payment row
 */
export interface PaymentEntity {
    id: number;
    userId: number;
    paymentData: Record<string, any> | null;
    createdAt?: string;
    updatedAt?: string;
}
