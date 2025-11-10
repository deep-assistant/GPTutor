import { BaseController } from './BaseController';
import { AuthService } from '../services/AuthService';
export declare class AuthController extends BaseController {
    private authService;
    constructor(fastify: any, authService: AuthService);
    registerRoutes(): void;
    private getUser;
    private updateToken;
}
