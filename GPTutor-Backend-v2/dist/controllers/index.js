"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerControllers = registerControllers;
const HealthController_1 = require("./HealthController");
const AuthController_1 = require("./AuthController");
const CompletionController_1 = require("./CompletionController");
const ModelsController_1 = require("./ModelsController");
const FilesController_1 = require("./FilesController");
function registerControllers(fastify, dependencies) {
    const controllers = [
        new HealthController_1.HealthController(fastify),
        new AuthController_1.AuthController(fastify, dependencies.authService),
        new CompletionController_1.CompletionController(fastify, dependencies.userRepository, dependencies.llmCostService, dependencies.openRouterService),
        new ModelsController_1.ModelsController(fastify, dependencies.llmCostService),
        new FilesController_1.FilesController(fastify, dependencies.filesService, dependencies.fileRepository, dependencies.authService),
    ];
    controllers.forEach(controller => controller.registerRoutes());
}
__exportStar(require("./BaseController"), exports);
__exportStar(require("./HealthController"), exports);
__exportStar(require("./AuthController"), exports);
__exportStar(require("./CompletionController"), exports);
__exportStar(require("./ModelsController"), exports);
__exportStar(require("./FilesController"), exports);
