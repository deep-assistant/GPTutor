import { YooCheckout, ICreatePayment } from '@a2seven/yoo-checkout';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { UserRepository } from '../repositories/UserRepository';
import { logger } from './LoggerService';

export interface CreatePaymentParams {
  userId: string;
  amount: number;
  description?: string;
  returnUrl?: string;
}

export class YooKassaService {
  private yooCheckout: YooCheckout;

  constructor(
    private shopId: string,
    private secretKey: string,
    private paymentRepository: PaymentRepository,
    private userRepository: UserRepository
  ) {
    this.yooCheckout = new YooCheckout({
      shopId: this.shopId,
      secretKey: this.secretKey,
    });
    
    logger.info('YooKassaService initialized', { shopId });
  }

  async createPayment(params: CreatePaymentParams) {
    const { userId, amount, description, returnUrl } = params;

    logger.info('Creating payment', { userId, amount });

    try {
      const idempotenceKey = `${userId}-${Date.now()}-${Math.random()}`;
      
      const createPayload: ICreatePayment = {
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: returnUrl || 'https://vk.com/app54187353#/profile',
        },
        description: description || `Пополнение баланса на ${amount}₽`,
      };

      const payment = await this.yooCheckout.createPayment(
        createPayload,
        idempotenceKey
      );

      logger.info('YooKassa payment created', {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount.value,
      });

      // Сохраняем платеж в БД
      const dbPayment = await this.paymentRepository.create({
        userId,
        yookassaId: payment.id,
        amount,
        currency: 'RUB',
        description: createPayload.description,
        confirmationUrl: payment.confirmation?.confirmation_url,
        status: payment.status,
      });

      logger.info('Payment saved to database', {
        dbPaymentId: dbPayment.id,
        yookassaId: payment.id,
      });

      return {
        id: dbPayment.id,
        yookassaId: payment.id,
        amount,
        status: payment.status,
        confirmationUrl: payment.confirmation?.confirmation_url,
        createdAt: dbPayment.createdAt,
      };
    } catch (error) {
      logger.error('Failed to create payment', error, { userId, amount });
      throw error;
    }
  }

  async getPaymentInfo(paymentId: string) {
    try {
      const payment = await this.yooCheckout.getPayment(paymentId);
      
      logger.info('Payment info retrieved', {
        paymentId,
        status: payment.status,
      });

      return payment;
    } catch (error) {
      logger.error('Failed to get payment info', error, { paymentId });
      throw error;
    }
  }

  async handlePaymentWebhook(paymentData: any) {
    try {
      const { id, status, amount } = paymentData.object;

      logger.info('Processing payment webhook', {
        paymentId: id,
        status,
        amount: amount?.value,
      });

      const dbPayment = await this.paymentRepository.findByYookassaId(id);

      if (!dbPayment) {
        logger.warn('Payment not found in database', { paymentId: id });
        return { success: false, message: 'Payment not found' };
      }

      // Обновляем статус платежа
      await this.paymentRepository.updateStatus(id, status);

      // Если платеж успешен, пополняем баланс пользователя
      if (status === 'succeeded') {
        const user = await this.userRepository.findById(dbPayment.userId);
        
        if (user) {
          const newBalance = user.balance + dbPayment.amount;
          await this.userRepository.updateBalance(dbPayment.userId, newBalance);

          logger.info('User balance updated', {
            userId: dbPayment.userId,
            oldBalance: user.balance,
            newBalance,
            addedAmount: dbPayment.amount,
          });
        }
      }

      return {
        success: true,
        status,
        paymentId: id,
      };
    } catch (error) {
      logger.error('Failed to process payment webhook', error, {
        paymentData,
      });
      throw error;
    }
  }

  async getUserPayments(userId: string) {
    return await this.paymentRepository.findByUserId(userId);
  }
}

