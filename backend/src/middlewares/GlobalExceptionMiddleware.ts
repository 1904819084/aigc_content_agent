import { GuluXMiddleware, Middleware, type NextFunction } from '@gulux/gulux';
import { Next, Res, type HTTPResponse } from '@gulux/gulux/application-http';
import { toAppError } from '../utils/appError';

@Middleware()
export default class GlobalExceptionMiddleware extends GuluXMiddleware {
  public async use(@Res() res: HTTPResponse, @Next() next: NextFunction) {
    try {
      await next();
    } catch (error) {
      console.error('[backend-error]', error);
      const appError = toAppError(error);
      res.body = {
        message: appError.message || 'internal_server_error',
      };
      res.status = appError.statusCode;
    }
  }
}
