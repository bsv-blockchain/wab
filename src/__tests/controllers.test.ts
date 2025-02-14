import request from "supertest";
import app from "../src/app";
import { db, migrateLatest } from "../src/db/knex";

describe("Controllers", () => {
    beforeAll(async () => {
        await migrateLatest();
    });

    afterAll(async () => {
        await db.destroy();
    });

    let testPresentationKey = "testkey_" + Date.now();

    it("GET /info should return server info", async () => {
        const res = await request(app).get("/info");
        expect(res.status).toBe(200);
        expect(res.body.supportedAuthMethods).toContain("TwilioPhone");
    });

    it("POST /auth/start TwilioPhone", async () => {
        const res = await request(app).post("/auth/start").send({
            methodType: "TwilioPhone",
            presentationKey: testPresentationKey,
            payload: { phoneNumber: "+10001112222" }
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.otp).toBe("123456");
    });

    it("POST /auth/complete TwilioPhone (success)", async () => {
        const res = await request(app).post("/auth/complete").send({
            methodType: "TwilioPhone",
            presentationKey: testPresentationKey,
            payload: { otp: "123456", phoneNumber: "+10001112222" }
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.presentationKey).toBe(testPresentationKey);
    });

    it("POST /faucet/request should provide or create payment", async () => {
        const res = await request(app).post("/faucet/request").send({
            presentationKey: testPresentationKey
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.paymentData).toBeDefined();
        expect(res.body.paymentData.amount).toBe(1000);
    });

    it("POST /user/linkedMethods should show TwilioPhone method", async () => {
        const res = await request(app).post("/user/linkedMethods").send({
            presentationKey: testPresentationKey
        });
        expect(res.status).toBe(200);
        expect(res.body.authMethods).toHaveLength(1);
        expect(res.body.authMethods[0].methodType).toBe("TwilioPhone");
    });

    it("POST /user/delete should delete user", async () => {
        const res = await request(app).post("/user/delete").send({
            presentationKey: testPresentationKey
        });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
