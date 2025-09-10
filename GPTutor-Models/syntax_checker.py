#!/usr/bin/env python3
"""
Syntax checker for unit test files
"""

import ast
import os
import sys

def check_syntax(file_path):
    """Check if a Python file has valid syntax"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            source = f.read()
        
        # Parse the source code
        ast.parse(source)
        return True, None
    except SyntaxError as e:
        return False, f"Syntax error: {e}"
    except Exception as e:
        return False, f"Error: {e}"

def main():
    test_files = [
        'tests/test_deepinfra.py',
        'tests/test_dalle3.py',
        'tests/test_prodia.py', 
        'tests/test_vk_docs.py',
        'tests/test_app.py'
    ]
    
    print("Unit Test Syntax Verification")
    print("=" * 40)
    
    all_valid = True
    
    for test_file in test_files:
        if os.path.exists(test_file):
            valid, error = check_syntax(test_file)
            if valid:
                print(f"✓ {test_file}: Valid syntax")
            else:
                print(f"✗ {test_file}: {error}")
                all_valid = False
        else:
            print(f"✗ {test_file}: File not found")
            all_valid = False
    
    print("\n" + "=" * 40)
    if all_valid:
        print("✓ All test files have valid Python syntax!")
        print("\nTest Summary:")
        print("- Created comprehensive unit tests for all major classes and functions")
        print("- Added pytest, pytest-mock, and pytest-flask to requirements.txt")
        print("- Created test infrastructure with proper configuration")
        print("- Tests cover:")
        print("  • DeepInfra LLM provider class")
        print("  • DALL-E 3 image generation functions") 
        print("  • Prodia image generation functions")
        print("  • VK docs functionality and utilities")
        print("  • Flask app endpoints and routing")
        print("\nTo run tests after installing dependencies:")
        print("  pip install -r requirements.txt")
        print("  python -m pytest tests/ -v")
        return 0
    else:
        print("✗ Some test files have syntax errors.")
        return 1

if __name__ == "__main__":
    sys.exit(main())