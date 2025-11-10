import { BaseController } from "./BaseController";
import { FilesService } from "../services/FilesService";
import { FileRepository } from "../repositories/FileRepository";
import { AuthService } from "../services/AuthService";
export declare class FilesController extends BaseController {
    private filesService;
    private fileRepository;
    private authService;
    constructor(fastify: any, filesService: FilesService, fileRepository: FileRepository, authService: AuthService);
    registerRoutes(): void;
    private uploadFile;
}
