#!/bin/bash

# Скрипт для запуска всех тестов в проекте GPTutor
# Использование: ./run-all-tests.sh

set -e  # Остановить выполнение при любой ошибке

echo "🚀 Запуск всех тестов для проекта GPTutor"
echo "=========================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для логирования
log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия компонентов
check_component() {
    if [ ! -d "$1" ]; then
        log_error "Компонент $1 не найден"
        return 1
    fi
    return 0
}

# Тестирование Backend (Java)
test_backend() {
    log_info "Тестирование Backend (Java Spring Boot)..."
    
    if ! check_component "GPTutor-Backend"; then
        return 1
    fi
    
    cd GPTutor-Backend
    
    if [ -f "./mvnw" ]; then
        ./mvnw test
    else
        mvn test
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Backend тесты пройдены успешно"
    else
        log_error "Backend тесты завершились с ошибкой"
        return 1
    fi
    
    cd ..
}

# Тестирование Frontend (React)
test_frontend() {
    log_info "Тестирование Frontend (React TypeScript)..."
    
    if ! check_component "GPTutor-Frontend"; then
        return 1
    fi
    
    cd GPTutor-Frontend
    
    # Проверка node_modules
    if [ ! -d "node_modules" ]; then
        log_info "Установка зависимостей для Frontend..."
        npm install
    fi
    
    # Запуск тестов без watch mode
    npm test -- --coverage --watchAll=false
    
    if [ $? -eq 0 ]; then
        log_success "Frontend тесты пройдены успешно"
    else
        log_error "Frontend тесты завершились с ошибкой"
        return 1
    fi
    
    cd ..
}

# Тестирование Models (Python)
test_models() {
    log_info "Тестирование Models (Python Flask)..."
    
    if ! check_component "GPTutor-Models"; then
        return 1
    fi
    
    cd GPTutor-Models
    
    # Проверка виртуального окружения (опционально)
    if command -v python3 &> /dev/null; then
        python3 -m pytest -v
    else
        pytest -v
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Models тесты пройдены успешно"
    else
        log_error "Models тесты завершились с ошибкой"
        return 1
    fi
    
    cd ..
}

# Тестирование RAG (Node.js)
test_rag() {
    log_info "Тестирование RAG (Node.js TypeScript)..."
    
    if ! check_component "GPTutor-Rag"; then
        return 1
    fi
    
    cd GPTutor-Rag
    
    # Проверка node_modules
    if [ ! -d "node_modules" ]; then
        log_info "Установка зависимостей для RAG..."
        npm install
    fi
    
    npm test
    
    if [ $? -eq 0 ]; then
        log_success "RAG тесты пройдены успешно"
    else
        log_error "RAG тесты завершились с ошибкой"
        return 1
    fi
    
    cd ..
}

# Основная логика
main() {
    local failed_components=()
    
    echo "📍 Текущая директория: $(pwd)"
    echo ""
    
    # Запуск тестов для каждого компонента
    if ! test_backend; then
        failed_components+=("Backend")
    fi
    
    echo ""
    
    if ! test_frontend; then
        failed_components+=("Frontend")
    fi
    
    echo ""
    
    if ! test_models; then
        failed_components+=("Models")
    fi
    
    echo ""
    
    if ! test_rag; then
        failed_components+=("RAG")
    fi
    
    echo ""
    echo "=========================================="
    
    # Результаты
    if [ ${#failed_components[@]} -eq 0 ]; then
        log_success "🎉 Все тесты пройдены успешно!"
        exit 0
    else
        log_error "❌ Тесты завершились с ошибками в компонентах: ${failed_components[*]}"
        echo ""
        echo "Для отладки запустите тесты индивидуально:"
        for component in "${failed_components[@]}"; do
            case $component in
                "Backend")
                    echo "  cd GPTutor-Backend && ./mvnw test"
                    ;;
                "Frontend")
                    echo "  cd GPTutor-Frontend && npm test"
                    ;;
                "Models")
                    echo "  cd GPTutor-Models && pytest -v"
                    ;;
                "RAG")
                    echo "  cd GPTutor-Rag && npm test"
                    ;;
            esac
        done
        exit 1
    fi
}

# Запуск основной функции
main "$@"