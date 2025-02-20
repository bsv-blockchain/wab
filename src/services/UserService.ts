/**
 * UserService
 *
 * Provides utility methods to handle storing and retrieving user data,
 * linking/unlinking auth methods, and retrieving faucet payments.
 */

import { Setup, SetupWallet } from '@bsv/wallet-toolbox'
import { db } from "../db/knex";
import { User, AuthMethodEntity, PaymentEntity } from "../types";
import { Random, RPuzzle, Utils, WalletClient } from '@bsv/sdk'

export class UserService {
    /**
     * Create a new user with a given presentationKey
     */
    static async createUser(presentationKey: string): Promise<User> {
        const [id] = await db("users").insert(
            { presentationKey },
            ["id"]
        );
        const user = await this.getUserById(id as number);
        if (!user) {
            throw new Error("User creation failed");
        }
        return user;
    }

    /**
     * Retrieve user by ID
     */
    static async getUserById(id: number): Promise<User | undefined> {
        return db<User>("users").where({ id }).first();
    }

    /**
     * Retrieve user by presentationKey
     */
    static async getUserByPresentationKey(key: string): Promise<User | undefined> {
        return db<User>("users").where({ presentationKey: key }).first();
    }

    /**
     * Delete a user (and cascade the other records)
     */
    static async deleteUserByPresentationKey(key: string): Promise<void> {
        await db("users").where({ presentationKey: key }).del();
    }

    /**
     * Link an AuthMethod to the user
     */
    static async linkAuthMethod(
        userId: number,
        methodType: string,
        config: string
    ): Promise<AuthMethodEntity> {
        const [authMethodId] = await db("auth_methods").insert(
            {
                userId,
                methodType,
                config
            },
            ["id"]
        );
        const authMethod = await db<AuthMethodEntity>("auth_methods")
            .where({ id: authMethodId })
            .first();

        if (!authMethod) {
            throw new Error("Failed to create auth method record");
        }
        return authMethod;
    }

    /**
     * TODO: MOVE AND FIX
     */
    static async findUserByConfig(
        methodType: string,
        config: string
    ): Promise<User | undefined> {
        const authMethod = await db<AuthMethodEntity>("auth_methods")
            .where({
                methodType,
                config
            })
            .first();

        if (!authMethod) {
            return undefined;
        }
        return await this.getUserById(authMethod.userId)
    }

    /**
     * Check if an auth method exists for user with the same config (to see if already linked).
     */
    static async getAuthMethodsByUserId(userId: number): Promise<AuthMethodEntity[]> {
        return db<AuthMethodEntity>("auth_methods").where({ userId });
    }

    static async getAuthMethodById(id: number): Promise<AuthMethodEntity | undefined> {
        return db<AuthMethodEntity>("auth_methods").where({ id }).first();
    }

    static async deleteAuthMethodById(id: number): Promise<void> {
        await db("auth_methods").where({ id }).del();
    }

    /**
     * Retrieve or create a faucet payment for a user.
     */
    static async getOrCreateFaucetPayment(userId: number, faucetAmount: number): Promise<PaymentEntity> {
        let payment = await db<PaymentEntity>("payments").where({ userId }).first();
        if (!payment) {
            // TODO: create a new payment record

            // Generate a random 32-byte value for k (since there's no fromRandom equivalent)
            // const randomBuffer = Random(32)
            // const kHex = Utils.toHex(randomBuffer)
            // const kArray = Array.from(randomBuffer) // convert to number array for RPuzzle.lock()

            // // Create an RPuzzle instance (using type 'raw' in this example)
            // const rpuzzle = new RPuzzle('raw')
            // const lockingScript = rpuzzle.lock(kArray)

            // For demonstration, we pretend the "paymentData" is a simple JSON with a "txid"
            const newPaymentData = {
                amount: faucetAmount,
                txid: `FAKE_TXID_${Date.now()}`
            };
            const [paymentId] = await db("payments").insert(
                {
                    userId,
                    paymentData: newPaymentData
                },
                ["id"]
            );
            payment = await db<PaymentEntity>("payments")
                .where({ id: paymentId })
                .first();
        }
        if (!payment) {
            throw new Error("Failed to create or retrieve faucet payment");
        }
        return payment;
    }
}
