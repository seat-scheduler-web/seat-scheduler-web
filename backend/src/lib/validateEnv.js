const REQUIRED_VARS = ["JWT_SECRET", "DATABASE_URL"];

const MIN_JWT_SECRET_LENGTH = 32;

export function validateEnv() {
  const missing = REQUIRED_VARS.filter(
    (key) => !process.env[key] || process.env[key].trim() === "",
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Set them in your .env file. See .env.example for reference.`,
    );
  }

  if (process.env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long. ` +
        `Current length: ${process.env.JWT_SECRET.length}`,
    );
  }

  if (!process.env.DATABASE_URL.startsWith("mysql://")) {
    throw new Error(
      `DATABASE_URL must start with "mysql://". ` +
        `Current value: ${process.env.DATABASE_URL}`,
    );
  }
}
