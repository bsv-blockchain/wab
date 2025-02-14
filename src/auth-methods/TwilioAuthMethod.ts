/**
 * TwilioAuthMethod
 *
 * This is a demonstration Auth Method that verifies ownership
 * of a phone number using Twilio (mocked in this example).
 */

import { AuthMethod, AuthPayload, AuthResult } from "./AuthMethod";

export class TwilioAuthMethod extends AuthMethod {
    public methodType = "TwilioPhone";

    // In a real implementation, you would inject or configure Twilio credentials here.
    constructor(private twilioConfig: { accountSid: string; authToken: string }) {
        super();
    }

    /**
     * Start phone verification by sending an SMS code.
     *
     * In this example, we simply pretend we do so and store the code in memory for demonstration.
     */
    public async startAuth(presentationKey: string, payload: AuthPayload): Promise<AuthResult> {
        const phoneNumber = payload.phoneNumber;
        if (!phoneNumber) {
            return { success: false, message: "phoneNumber is required" };
        }

        // Generate a mock OTP and pretend to send via Twilio
        const mockOtp = "123456"; // You would generate a random code in production.
        // In a real scenario, you might save the OTP in a temporary DB or session.

        return {
            success: true,
            message: "OTP sent (mock).",
            data: { otp: mockOtp } // For demonstration, we return the code.
        };
    }

    /**
     * Complete phone verification by checking the OTP code.
     *
     * In a real scenario, you'd verify that the code matches what's stored.
     */
    public async completeAuth(presentationKey: string, payload: AuthPayload): Promise<AuthResult> {
        const providedOtp = payload.otp;
        if (!providedOtp) {
            return { success: false, message: "otp is required" };
        }

        // Check the OTP
        if (providedOtp === "123456") {
            return {
                success: true,
                message: "Phone verified successfully."
            };
        } else {
            return {
                success: false,
                message: "Invalid OTP."
            };
        }
    }

    /**
     * If phone verification is successful, we store the phone number in the config
     * so the user can re-auth in the future with that phone.
     */
    public buildConfigFromPayload(payload: AuthPayload): Record<string, any> {
        return {
            phoneNumber: payload.phoneNumber
        };
    }

    /**
     * (Optional) Check if phoneNumber from the DB config matches the payload's phoneNumber
     */
    public isAlreadyLinked(storedConfig: Record<string, any>, payload: AuthPayload): boolean {
        return storedConfig.phoneNumber === payload.phoneNumber;
    }
}
