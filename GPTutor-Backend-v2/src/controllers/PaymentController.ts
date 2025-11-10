import { FastifyRequest, FastifyReply } from "fastify";
import { BaseController } from "./BaseController";
import { YooKassaService } from "../services/YooKassaService";
import { createVkAuthMiddleware } from "../middleware/authMiddleware";
import { AuthService } from "../services/AuthService";
import { RequestWithLogging } from "../middleware/loggingMiddleware";
import {
  createRateLimitMiddleware,
  getRateLimitConfig,
} from "../middleware/rateLimitMiddleware";
import { yookassaIpCheck } from "../middleware/yookassaIpMiddleware";

interface AuthenticatedRequest extends RequestWithLogging {
  vkUser: any;
  dbUser: any;
}

interface CreatePaymentBody {
  amount: number;
  description?: string;
  returnUrl?: string;
}

interface PaymentWebhookBody {
  type: string;
  event: string;
  object: any;
}

export class PaymentController extends BaseController {
  constructor(
    fastify: any,
    private yooKassaService: YooKassaService,
    private authService: AuthService
  ) {
    super(fastify);
  }

  registerRoutes(): void {
    const vkAuthMiddleware = createVkAuthMiddleware(this.authService);
    const createPaymentRateLimit = createRateLimitMiddleware(
      getRateLimitConfig("/payments/create")!
    );
    const getPaymentsRateLimit = createRateLimitMiddleware(
      getRateLimitConfig("/payments")!
    );

    // Создание платежа
    this.fastify.post(
      "/payments/create",
      {
        preHandler: [createPaymentRateLimit, vkAuthMiddleware] as any,
      },
      this.createPayment.bind(this)
    );

    // Получение списка платежей пользователя
    this.fastify.get(
      "/payments",
      {
        preHandler: [getPaymentsRateLimit, vkAuthMiddleware] as any,
      },
      this.getUserPayments.bind(this)
    );

    this.fastify.post(
      "/payments/webhook",
      {
        preHandler: [yookassaIpCheck] as any,
      },
      this.handleWebhook.bind(this)
    );

    this.fastify.get(
      "/payments/:yookassaId",
      {
        preHandler: [vkAuthMiddleware] as any,
      },
      this.getPaymentInfo.bind(this)
    );
  }

  private async createPayment(request: any, reply: FastifyReply) {
    try {
      const { amount, description, returnUrl } =
        request.body as CreatePaymentBody;

      if (!amount || typeof amount !== "number") {
        return this.sendValidationError(
          reply,
          "Amount is required and must be a number",
          request
        );
      }

      if (amount < 70) {
        return this.sendValidationError(
          reply,
          "Minimum payment amount is 70₽",
          request
        );
      }

      if (amount > 100000) {
        return this.sendValidationError(
          reply,
          "Maximum payment amount is 100,000₽",
          request
        );
      }

      this.logInfo(
        "Creating payment",
        {
          userId: request.dbUser.id,
          amount,
          vkId: request.dbUser.vkId,
        },
        request
      );

      const payment = await this.yooKassaService.createPayment({
        userId: request.dbUser.id,
        amount,
        description,
        returnUrl,
      });

      this.logInfo(
        "Payment created successfully",
        {
          paymentId: payment.id,
          yookassaId: payment.yookassaId,
          amount: payment.amount,
        },
        request
      );

      return this.sendSuccess(
        reply,
        {
          message: "Payment created successfully",
          payment: {
            id: payment.id,
            yookassaId: payment.yookassaId,
            amount: payment.amount,
            status: payment.status,
            confirmationUrl: payment.confirmationUrl,
            createdAt: payment.createdAt,
          },
        },
        201
      );
    } catch (error) {
      this.logError(
        "Failed to create payment",
        error,
        {
          userId: request.dbUser?.id,
        },
        request
      );
      return this.sendError(
        reply,
        error instanceof Error ? error.message : "Failed to create payment",
        500,
        request
      );
    }
  }

  private async getUserPayments(request: any, reply: FastifyReply) {
    try {
      this.logInfo(
        "Fetching user payments",
        {
          userId: request.dbUser.id,
        },
        request
      );

      const payments = await this.yooKassaService.getUserPayments(
        request.dbUser.id
      );

      return this.sendSuccess(reply, {
        message: "Payments retrieved successfully",
        payments,
      });
    } catch (error) {
      this.logError(
        "Failed to get user payments",
        error,
        {
          userId: request.dbUser?.id,
        },
        request
      );
      return this.sendError(reply, "Failed to retrieve payments", 500, request);
    }
  }

  private async getPaymentInfo(request: any, reply: FastifyReply) {
    try {
      const { yookassaId } = request.params as { yookassaId: string };

      this.logInfo(
        "Fetching payment info",
        {
          yookassaId,
          userId: request.dbUser.id,
        },
        request
      );

      const payment = await this.yooKassaService.getPaymentInfo(yookassaId);

      return this.sendSuccess(reply, {
        message: "Payment info retrieved successfully",
        payment,
      });
    } catch (error) {
      this.logError("Failed to get payment info", error, request);
      return this.sendError(
        reply,
        "Failed to retrieve payment info",
        500,
        request
      );
    }
  }

  private async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    try {
      const webhookData = request.body as PaymentWebhookBody;

      this.logInfo("Processing payment webhook", {
        type: webhookData.type,
        event: webhookData.event,
        paymentId: webhookData.object?.id,
      });

      if (
        webhookData.event === "payment.succeeded" ||
        webhookData.event === "payment.canceled"
      ) {
        const result = await this.yooKassaService.handlePaymentWebhook(
          webhookData
        );

        this.logInfo("Webhook processed successfully", {
          success: result.success,
          paymentId: result.paymentId,
          status: result.status,
        });

        return this.sendSuccess(reply, result);
      }

      return this.sendSuccess(reply, { message: "Webhook received" });
    } catch (error) {
      this.logError("Failed to process webhook", error);
      return this.sendError(reply, "Failed to process webhook", 500);
    }
  }
}
