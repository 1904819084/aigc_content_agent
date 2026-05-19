export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export function toAppError(
  error: unknown,
  fallbackMessage = 'internal_server_error',
  fallbackStatusCode = 500,
) {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    const errorWithStatusCode = error as Error & { statusCode?: number };
    return new AppError(
      error.message || fallbackMessage,
      typeof errorWithStatusCode.statusCode === 'number'
        ? errorWithStatusCode.statusCode
        : fallbackStatusCode,
    );
  }

  return new AppError(fallbackMessage, fallbackStatusCode);
}
