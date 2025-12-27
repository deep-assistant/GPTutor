#!/usr/bin/env python3
"""
Simple test runner to verify our unit tests are syntactically correct
and imports work properly.
"""

import sys
import os
import importlib.util

def test_imports():
    """Test that all test modules can be imported successfully"""
    test_modules = [
        'tests.test_deepinfra',
        'tests.test_dalle3', 
        'tests.test_prodia',
        'tests.test_vk_docs',
        'tests.test_app'
    ]
    
    success_count = 0
    total_count = len(test_modules)
    
    for module_name in test_modules:
        try:
            # Try to import the module
            module = importlib.import_module(module_name)
            print(f"✓ Successfully imported {module_name}")
            success_count += 1
        except ImportError as e:
            print(f"✗ Failed to import {module_name}: {e}")
        except Exception as e:
            print(f"✗ Error importing {module_name}: {e}")
    
    print(f"\nImport Test Results: {success_count}/{total_count} modules imported successfully")
    return success_count == total_count

def test_source_modules():
    """Test that the source modules can be imported"""
    source_modules = [
        'llm.DeepInfra',
        'images.dalle3',
        'images.prodia', 
        'vk_docs.utils',
        'vk_docs.index',
        'app'
    ]
    
    success_count = 0
    total_count = len(source_modules)
    
    for module_name in source_modules:
        try:
            module = importlib.import_module(module_name)
            print(f"✓ Successfully imported source module {module_name}")
            success_count += 1
        except ImportError as e:
            print(f"✗ Failed to import source module {module_name}: {e}")
        except Exception as e:
            print(f"✗ Error importing source module {module_name}: {e}")
    
    print(f"\nSource Module Test Results: {success_count}/{total_count} modules imported successfully")
    return success_count == total_count

def main():
    print("GPTutor Unit Test Verification")
    print("=" * 40)
    
    # Test source module imports first
    print("\n1. Testing source module imports...")
    source_success = test_source_modules()
    
    print("\n2. Testing test module imports...")
    test_success = test_imports()
    
    print("\n" + "=" * 40)
    if source_success and test_success:
        print("✓ All tests passed! Unit test structure is valid.")
        return 0
    else:
        print("✗ Some tests failed. Please check the error messages above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())