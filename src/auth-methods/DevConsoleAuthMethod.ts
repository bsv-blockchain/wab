import { AuthMethod, AuthPayload, AuthResult } from "./AuthMethod";

/**
 * DevConsoleAuthMethod
 *
 * A development-only auth method that generates OTP codes and logs them to the console.
 * This allows developers to authenticate without requiring external services like Twilio.
 */
export class DevConsoleAuthMethod extends AuthMethod {
    public methodType = "DevConsole";

    // In-memory storage for OTP codes (only for development)
    private otpStorage: Map<string, { otp: string; expiresAt: number; identifier: string }> = new Map();

    /**
     * Generates a random 6-digit OTP and logs it to the console.
     * Expects `payload.identifier` (could be phone number, email, or any identifier).
     *
     * @param presentationKey - The user's prospective presentation key
     * @param payload - Must include { identifier }
     * @returns AuthResult
     */
    public async startAuth(presentationKey: string, payload: AuthPayload): Promise<AuthResult> {
        const identifier = payload.identifier;
        if (!identifier) {
            return { success: false, message: "identifier is required." };
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP with 10-minute expiration
        const expiresAt = Date.now() + (10 * 60 * 1000);
        this.otpStorage.set(presentationKey, { otp, expiresAt, identifier });

        // Log OTP to console for development use
        console.log("=".repeat(60));
        console.log("🔐 DEVELOPMENT OTP CODE");
        console.log("=".repeat(60));
        console.log(`Identifier: ${identifier}`);
        console.log(`OTP Code: ${otp}`);
        console.log(`Expires: ${new Date(expiresAt).toLocaleString()}`);
        console.log(`Presentation Key: ${presentationKey}`);
        console.log("=".repeat(60));

        return {
            success: true,
            message: `Development OTP sent for ${identifier}. Check console logs.`,
            data: { identifier }
        };
    }

    /**
     * Verifies the provided OTP against the stored value.
     * Expects `payload.identifier` and `payload.otp`.
     *
     * @param presentationKey - The user's prospective presentation key
     * @param payload - Must include { identifier, otp }
     * @returns AuthResult
     */
    public async completeAuth(presentationKey: string, payload: AuthPayload): Promise<AuthResult> {
        const identifier = payload.identifier;
        const providedOtp = payload.otp;

        if (!identifier || !providedOtp) {
            return {
                success: false,
                message: "identifier and otp are required."
            };
        }

        const storedData = this.otpStorage.get(presentationKey);
        if (!storedData) {
            return {
                success: false,
                message: "No OTP found for this session. Please start authentication first."
            };
        }

        // Check if OTP has expired
        if (Date.now() > storedData.expiresAt) {
            this.otpStorage.delete(presentationKey);
            return {
                success: false,
                message: "OTP has expired. Please request a new one."
            };
        }

        // Check if identifier matches
        if (storedData.identifier !== identifier) {
            return {
                success: false,
                message: "Identifier does not match the one used to generate OTP."
            };
        }

        // Check if OTP matches
        if (storedData.otp !== providedOtp) {
            return {
                success: false,
                message: "Invalid OTP code."
            };
        }

        // Clean up stored OTP after successful verification
        this.otpStorage.delete(presentationKey);

        console.log(`✅ Development auth successful for ${identifier}`);

        return {
            success: true,
            message: `Development authentication successful for ${identifier}.`
        };
    }

    /**
     * Stores the identifier in the config object for future recognition.
     *
     * @param payload - Must include { identifier }
     * @returns string
     */
    public buildConfigFromPayload(payload: AuthPayload): string {
        return payload.identifier;
    }

    /**
     * Checks if this identifier is already linked to the user.
     *
     * @param storedConfig - The stored configuration
     * @param payload - Must include { identifier }
     */
    public isAlreadyLinked(storedConfig: Record<string, any>, payload: AuthPayload): boolean {
        return storedConfig.identifier === payload.identifier;
    }

    /**
     * Utility method to clear expired OTPs (can be called periodically)
     */
    public clearExpiredOtps(): void {
        const now = Date.now();
        for (const [key, data] of this.otpStorage.entries()) {
            if (now > data.expiresAt) {
                this.otpStorage.delete(key);
            }
        }
    }
}
