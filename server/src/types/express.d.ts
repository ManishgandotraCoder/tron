import { Request } from 'express';
import { UserPayload } from './index';

declare global {
    namespace Express {
        interface User extends UserPayload { }
    }
}

export interface AuthenticatedRequest extends Request {
    user?: UserPayload;
}
