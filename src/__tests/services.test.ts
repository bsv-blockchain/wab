import { UserService } from "../src/services/UserService";
import { db, migrateLatest } from "../src/db/knex";

describe("UserService", () => {
    beforeAll(async () => {
        await migrateLatest();
    });

    afterAll(async () => {
        await db.destroy();
    });

    it("create and retrieve user", async () => {
        const key = "serviceTestKey";
        const user = await UserService.createUser(key);
        expect(user.id).toBeDefined();

        const fetched = await UserService.getUserByPresentationKey(key);
        expect(fetched?.presentationKey).toBe(key);
    });

    it("link auth method", async () => {
        const key = "methodKey";
        const user = await UserService.createUser(key);
        await UserService.linkAuthMethod(user.id, "TwilioPhone", { phoneNumber: "123" });
        const methods = await UserService.getAuthMethodsByUserId(user.id);
        expect(methods).toHaveLength(1);
        expect(methods[0].methodType).toBe("TwilioPhone");
    });

    it("faucet creation", async () => {
        const key = "faucetKey";
        const user = await UserService.createUser(key);
        const payment = await UserService.getOrCreateFaucetPayment(user.id, 1000);
        expect(payment.paymentData?.amount).toBe(1000);
        // subsequent call should retrieve same payment
        const payment2 = await UserService.getOrCreateFaucetPayment(user.id, 1000);
        expect(payment2.id).toBe(payment.id);
    });

    it("delete user", async () => {
        const key = "deleteKey";
        const user = await UserService.createUser(key);
        await UserService.deleteUserByPresentationKey(key);
        const fetched = await UserService.getUserByPresentationKey(key);
        expect(fetched).toBeUndefined();
    });
});
