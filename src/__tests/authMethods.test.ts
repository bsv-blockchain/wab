import { TwilioAuthMethod } from "../src/authMethods/TwilioAuthMethod";
import { PersonaAuthMethod } from "../src/authMethods/PersonaAuthMethod";

describe("AuthMethods", () => {
    it("TwilioAuthMethod startAuth and completeAuth success", async () => {
        const method = new TwilioAuthMethod({ accountSid: "mock", authToken: "mock" });
        const startResult = await method.startAuth("someKey", { phoneNumber: "+1234567890" });
        expect(startResult.success).toBe(true);
        expect(startResult.data).toBeDefined();
        expect(startResult.data?.otp).toBe("123456");

        const completeResult = await method.completeAuth("someKey", { otp: "123456" });
        expect(completeResult.success).toBe(true);
    });

    it("TwilioAuthMethod completeAuth fail with wrong OTP", async () => {
        const method = new TwilioAuthMethod({ accountSid: "mock", authToken: "mock" });
        const completeResult = await method.completeAuth("someKey", { otp: "999999" });
        expect(completeResult.success).toBe(false);
    });

    it("PersonaAuthMethod startAuth and completeAuth success", async () => {
        const method = new PersonaAuthMethod({ apiKey: "mock" });
        const startResult = await method.startAuth("someKey", {});
        expect(startResult.success).toBe(true);
        expect(startResult.data?.sessionId).toBe("persona-session-abc123");

        const completeResult = await method.completeAuth("someKey", { sessionId: "persona-session-abc123" });
        expect(completeResult.success).toBe(true);
    });

    it("PersonaAuthMethod completeAuth fail with wrong sessionId", async () => {
        const method = new PersonaAuthMethod({ apiKey: "mock" });
        const completeResult = await method.completeAuth("someKey", { sessionId: "unknown-session" });
        expect(completeResult.success).toBe(false);
    });
});
