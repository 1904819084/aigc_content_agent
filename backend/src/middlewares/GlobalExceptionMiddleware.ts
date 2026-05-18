import { GuluXMiddleware, Middleware, type NextFunction } from '@gulux/gulux';
import { Next, Res, type HTTPResponse } from '@gulux/gulux/application-http';

@Middleware()
export default class GlobalExceptionMiddleware extends GuluXMiddleware {
  public async use(@Res() res: HTTPResponse, @Next() next: NextFunction) {
    try {
      await next();
    } catch (error) {
      console.error('[backend-error]', error);
      const currentError = error as Error;
      const currentErrorWithStatusCode = error as Error & { statusCode?: number };
      const statusCode =
        typeof currentErrorWithStatusCode.statusCode === 'number'
          ? currentErrorWithStatusCode.statusCode
          : 500;
      res.body = {
        message: currentError.message || 'internal_server_error',
      };
      res.status = statusCode;
    }
  }
}
