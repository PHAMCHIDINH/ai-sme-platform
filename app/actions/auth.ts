"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

import { authActionErrorMessage, type AuthActionErrorCode } from "@/lib/services/errors/auth-action-errors";
import { registerSchema } from "@/lib/validators/auth";
import { registerUserAndProfile } from "@/lib/services/register";
import { err, ok, type Result } from "@/lib/types/result";

type AuthActionResult = Result<null, AuthActionErrorCode>;

function success(): AuthActionResult {
  return ok(null);
}

function failure(code: AuthActionErrorCode, overrideMessage?: string): AuthActionResult {
  return err(code, overrideMessage ?? authActionErrorMessage(code));
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
): Promise<AuthActionResult> {
  try {
    await signIn("credentials", formData);
    return success();
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return failure("INVALID_CREDENTIALS");
        default:
          return failure("LOGIN_FAILED");
      }
    }
    throw error;
  }
}

export async function register(prevState: string | undefined, formData: FormData): Promise<AuthActionResult> {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsed = registerSchema.safeParse(data);

    if (!parsed.success) {
      return failure("REGISTER_INVALID_INPUT", parsed.error.issues[0].message);
    }

    const result = await registerUserAndProfile(parsed.data);
    if (!result.ok && result.code === "EMAIL_EXISTS") {
      return failure("EMAIL_EXISTS", result.error);
    }

    return success();
  } catch (error) {
    console.error("Register Error:", error);
    return failure("REGISTER_FAILED");
  }
}
