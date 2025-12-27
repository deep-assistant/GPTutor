import pytest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to sys.path to import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from llm.DeepInfra import DeepInfra


class TestDeepInfra:
    """Test cases for DeepInfra class"""

    def test_class_attributes(self):
        """Test that DeepInfra class has correct attributes"""
        assert DeepInfra.label == "DeepInfra"
        assert DeepInfra.url == "https://deepinfra.com"
        assert DeepInfra.working is True
        assert DeepInfra.needs_auth is False
        assert DeepInfra.has_auth is True
        assert DeepInfra.supports_stream is True
        assert DeepInfra.supports_message_history is True
        assert DeepInfra.default_model == "meta-llama/Meta-Llama-3-70b-instruct"
        assert DeepInfra.default_vision_model == "llava-hf/llava-1.5-7b-hf"

    def test_model_aliases(self):
        """Test model aliases dictionary"""
        expected_aliases = {
            'dbrx-instruct': 'databricks/dbrx-instruct',
        }
        assert DeepInfra.model_aliases == expected_aliases

    @patch('llm.DeepInfra.random.choice')
    @patch('llm.DeepInfra.g4f.Provider.Openai.create_async_generator')
    def test_create_async_generator(self, mock_super_method, mock_random_choice):
        """Test create_async_generator method"""
        # Mock random.choice to return a specific token
        mock_token = "Bearer dChpwTq4VSmDBI8yxa3MVZzapqQNapNx"
        mock_random_choice.return_value = mock_token
        
        # Mock the super method
        mock_result = MagicMock()
        mock_super_method.return_value = mock_result
        
        # Test data
        model = "test-model"
        messages = [{"role": "user", "content": "test message"}]
        stream = True
        
        # Call the method
        result = DeepInfra.create_async_generator(
            model=model,
            messages=messages,
            stream=stream
        )
        
        # Verify random.choice was called with jwt_tokens
        mock_random_choice.assert_called_once()
        
        # Verify super method was called with correct parameters
        mock_super_method.assert_called_once()
        call_args = mock_super_method.call_args
        
        # Check that the correct model and messages were passed
        assert call_args[0][0] == model
        assert call_args[0][1] == messages
        
        # Check that stream parameter was passed correctly
        assert call_args[1]['stream'] == stream
        
        # Check that default parameters are set correctly
        assert call_args[1]['api_base'] == "https://api.deepinfra.com/v1/openai"
        assert call_args[1]['temperature'] == 0.7
        assert call_args[1]['max_tokens'] == 2056
        
        # Check that headers were set correctly
        headers = call_args[1]['headers']
        assert headers['Authorization'] == mock_token
        assert headers['Origin'] == 'https://deepinfra.com'
        assert headers['Referer'] == 'https://deepinfra.com/'
        assert headers['X-Deepinfra-Source'] == 'web-embed'
        
        # Verify result
        assert result == mock_result

    @patch('llm.DeepInfra.random.choice')
    @patch('llm.DeepInfra.g4f.Provider.Openai.create_async_generator')
    def test_create_async_generator_with_custom_params(self, mock_super_method, mock_random_choice):
        """Test create_async_generator with custom parameters"""
        mock_token = "Bearer dChpwTq4VSmDBI8yxa3MVZzapqQNapNx"
        mock_random_choice.return_value = mock_token
        mock_result = MagicMock()
        mock_super_method.return_value = mock_result
        
        # Custom parameters
        custom_api_base = "https://custom.api.com/v1"
        custom_temperature = 0.5
        custom_max_tokens = 1000
        
        result = DeepInfra.create_async_generator(
            model="custom-model",
            messages=[{"role": "user", "content": "custom message"}],
            stream=False,
            api_base=custom_api_base,
            temperature=custom_temperature,
            max_tokens=custom_max_tokens
        )
        
        call_args = mock_super_method.call_args
        assert call_args[1]['api_base'] == custom_api_base
        assert call_args[1]['temperature'] == custom_temperature
        assert call_args[1]['max_tokens'] == custom_max_tokens
        assert call_args[1]['stream'] == False

    def test_jwt_tokens_not_empty(self):
        """Test that jwt_tokens list is not empty"""
        from llm.DeepInfra import jwt_tokens
        assert len(jwt_tokens) > 0
        assert all(token.startswith("Bearer ") for token in jwt_tokens)