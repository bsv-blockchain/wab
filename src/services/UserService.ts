/**
 * UserService
 *
 * Provides utility methods to handle storing and retrieving user data,
 * linking/unlinking auth methods, and retrieving faucet payments.
 */

import { Setup } from "@bsv/wallet-toolbox";
import { db } from "../db/knex";
import { User, AuthMethodEntity, PaymentEntity } from "../types";
import { Curve, KeyDeriver, PrivateKey, Random, RPuzzle, Utils } from '@bsv/sdk'

//temp solution 
const SERVER_PRIVATE_KEY = process.env.SERVER_PRIVATE_KEY

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
            // Generate a random 32-byte value for k (since there's no fromRandom equivalent)
            const k = Random(32)
            // Create an RPuzzle instance (using type 'raw' in this example)
            const rPuzzle = new RPuzzle('raw')
            const c = new Curve()
            let r = c.g.mul(k).x?.umod(c.n)?.toArray()
            if (r !== null && r !== undefined) {
                r = r[0] > 127 ? [0, ...r] : r
            }
            const lockingScript = rPuzzle.lock(r!)

            // TODO: const tx wallet.createAction()
            const wallet = await Setup.createWalletClientNoEnv({
                chain: 'test',
                rootKeyHex: SERVER_PRIVATE_KEY as string,
                storageUrl: 'https://staging-storage.babbage.systems'
            });

            const { txid, tx } = await wallet.createAction({
                description: 'Here is your funds!',
                outputs: [
                    {
                        lockingScript: lockingScript.toHex(),
                        satoshis: faucetAmount,
                        outputDescription: 'Faucet payment'
                    }
                ],
                options: {
                    randomizeOutputs: false
                }
            })
            console.log('Funding txid created!', txid)

            // For demonstration, we pretend the "paymentData" is a simple JSON with a "txid"
            const [paymentId] = await db("payments").insert(
                {
                    userId,
                    k: Utils.toHex(k),
                    beef: Buffer.from(tx as number[]),
                    amount: faucetAmount,
                    outputIndex: 0,
                    txid
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
