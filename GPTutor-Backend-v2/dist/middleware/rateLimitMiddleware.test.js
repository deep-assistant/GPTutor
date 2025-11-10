"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRateLimitMiddleware = testRateLimitMiddleware;
const rateLimitMiddleware_1 = require("./rateLimitMiddleware");
// Простой тест для проверки работы rate limiting
async function testRateLimitMiddleware() {
    console.log('🧪 Тестирование rate limiting middleware...');
    const config = {
        max: 3,
        timeWindow: 1000, // 1 секунда для быстрого тестирования
    };
    const middleware = (0, rateLimitMiddleware_1.createRateLimitMiddleware)(config);
    // Создаем мок объекты
    const mockRequest = {
        ip: '127.0.0.1',
        url: '/test',
        method: 'GET',
        headers: { 'user-agent': 'test-agent' }
    };
    const mockReply = {
        code: (status) => ({
            send: (data) => {
                console.log(`Response ${status}:`, data);
                return { status, data };
            }
        }),
        header: (name, value) => {
            console.log(`Header ${name}: ${value}`);
        }
    };
    console.log('\n📊 Тестирование нормальных запросов...');
    // Тест 1-3: нормальные запросы
    for (let i = 1; i <= 3; i++) {
        console.log(`Запрос ${i}:`);
        await middleware(mockRequest, mockReply);
    }
    console.log('\n🚫 Тестирование превышения лимита...');
    // Тест 4: превышение лимита
    console.log('Запрос 4 (должен быть заблокирован):');
    await middleware(mockRequest, mockReply);
    console.log('\n🧹 Тестирование очистки store...');
    // Проверяем размер store до очистки
    const store = (0, rateLimitMiddleware_1.getGlobalRateLimitStore)();
    console.log(`Store size before cleanup: ${store.size}`);
    // Ждем истечения времени окна
    console.log('Ожидание истечения timeWindow...');
    await new Promise(resolve => setTimeout(resolve, 1100));
    // Очищаем store
    (0, rateLimitMiddleware_1.cleanupRateLimitStore)(store);
    console.log(`Store size after cleanup: ${store.size}`);
    console.log('\n✅ Тест после очистки...');
    // Тест после очистки - должен работать снова
    console.log('Запрос после очистки:');
    await middleware(mockRequest, mockReply);
    console.log('\n🎉 Тестирование завершено!');
}
// Запуск теста, если файл выполняется напрямую
if (require.main === module) {
    testRateLimitMiddleware().catch(console.error);
}
