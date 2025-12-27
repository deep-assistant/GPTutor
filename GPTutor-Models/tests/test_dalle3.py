import pytest
from unittest.mock import patch, MagicMock
import sys
import os
import re

# Add the parent directory to sys.path to import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from images.dalle3 import (
    get_image_form_response,
    format_image_from_request,
    download_by_url,
    generate_dalle
)


class TestDalle3Functions:
    """Test cases for DALL-E 3 functions"""

    def test_get_image_form_response_with_match(self):
        """Test get_image_form_response with valid image URL"""
        test_text = "Here is your image: ![image](https://files.oaiusercontent.com/file-12345abcdef)"
        result = get_image_form_response(test_text)
        assert result == "https://files.oaiusercontent.com/file-12345abcdef"

    def test_get_image_form_response_no_match(self):
        """Test get_image_form_response with no image URL"""
        test_text = "This is just regular text without an image URL"
        result = get_image_form_response(test_text)
        assert result is None

    def test_get_image_form_response_multiple_images(self):
        """Test get_image_form_response with multiple images (should return first)"""
        test_text = "![image](https://files.oaiusercontent.com/file-first) and ![image](https://files.oaiusercontent.com/file-second)"
        result = get_image_form_response(test_text)
        assert result == "https://files.oaiusercontent.com/file-first"

    @patch('images.dalle3.get_image_form_response')
    def test_format_image_from_request(self, mock_get_image):
        """Test format_image_from_request function"""
        mock_get_image.return_value = "https://files.oaiusercontent.com/file-test123"
        
        test_input = '''{"prompt": "test prompt", "size": "1024x1024"}
        Some additional text here
        ![image](https://files.oaiusercontent.com/file-test123)
        More text after image'''
        
        result = format_image_from_request(test_input)
        
        assert "image" in result
        assert "text" in result
        assert result["image"] == "https://files.oaiusercontent.com/file-test123"
        assert '{"prompt"' not in result["text"]  # JSON should be removed
        assert "![image]" not in result["text"]  # Image markdown should be removed

    @patch('images.dalle3.requests.get')
    @patch('images.dalle3.base64.b64encode')
    def test_download_by_url_success(self, mock_b64encode, mock_requests_get):
        """Test successful download_by_url"""
        # Mock response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = b"fake_image_data"
        mock_requests_get.return_value = mock_response
        
        # Mock base64 encoding
        mock_b64encode.return_value = b"ZmFrZV9pbWFnZV9kYXRh"  # "fake_image_data" in base64
        
        result = download_by_url("https://example.com/image.jpg")
        
        # Verify requests.get was called with correct URL and proxies
        mock_requests_get.assert_called_once()
        call_args = mock_requests_get.call_args
        assert call_args[0][0] == "https://example.com/image.jpg"
        assert "proxies" in call_args[1]
        
        # Verify result
        assert result == "data:image/jpen;base64,ZmFrZV9pbWFnZV9kYXRh"

    @patch('images.dalle3.requests.get')
    def test_download_by_url_failure(self, mock_requests_get):
        """Test failed download_by_url"""
        # Mock failed response
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_requests_get.return_value = mock_response
        
        result = download_by_url("https://example.com/nonexistent.jpg")
        
        assert result is None

    @patch('images.dalle3.OpenAI')
    @patch('images.dalle3.format_image_from_request')
    @patch.dict(os.environ, {'API_KEYS_120': 'test_api_key'})
    def test_generate_dalle_success(self, mock_format, mock_openai_class):
        """Test successful generate_dalle function"""
        # Mock OpenAI client and response
        mock_openai_instance = MagicMock()
        mock_openai_class.return_value = mock_openai_instance
        
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "Generated image response"
        mock_completion.usage.total_tokens = 150
        mock_openai_instance.chat.completions.create.return_value = mock_completion
        
        # Mock format function
        mock_format.return_value = {
            "image": "https://files.oaiusercontent.com/file-test",
            "text": "Generated text"
        }
        
        result = generate_dalle("Create a beautiful sunset")
        
        # Verify OpenAI client creation
        mock_openai_class.assert_called_once_with(
            api_key='test_api_key',
            base_url="https://api.deep.assistant.run.place/v1/"
        )
        
        # Verify chat completion call
        mock_openai_instance.chat.completions.create.assert_called_once()
        call_args = mock_openai_instance.chat.completions.create.call_args
        assert call_args[1]["model"] == "gpt-4o-plus"
        assert call_args[1]["max_tokens"] == 4096
        assert call_args[1]["stream"] is False
        assert len(call_args[1]["messages"]) == 2
        
        # Verify result structure
        assert "image" in result
        assert "text" in result
        assert "total_tokens" in result
        assert result["total_tokens"] == 150
        assert result["image"] == "https://files.oaiusercontent.com/file-test"
        assert result["text"] == "Generated text"

    @patch('images.dalle3.OpenAI')
    @patch.dict(os.environ, {}, clear=True)
    def test_generate_dalle_missing_api_key(self, mock_openai_class):
        """Test generate_dalle with missing API key"""
        # This should still work but with None as API key
        mock_openai_instance = MagicMock()
        mock_openai_class.return_value = mock_openai_instance
        
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "test response"
        mock_completion.usage.total_tokens = 100
        mock_openai_instance.chat.completions.create.return_value = mock_completion
        
        with patch('images.dalle3.format_image_from_request') as mock_format:
            mock_format.return_value = {"image": "test", "text": "test"}
            
            generate_dalle("test prompt")
            
            # Verify OpenAI was called with None as API key
            mock_openai_class.assert_called_once_with(
                api_key=None,
                base_url="https://api.deep.assistant.run.place/v1/"
            )

    def test_format_image_from_request_complex_input(self):
        """Test format_image_from_request with complex JSON structures"""
        complex_input = '''
        {"prompt": "complex prompt with quotes", "size": "512x512"}
        {"prompt": "another prompt", "size": "1024x1024", "n": 1}
        Some text in between
        ![image](https://files.oaiusercontent.com/file-complex123)
        Final text
        '''
        
        result = format_image_from_request(complex_input)
        
        # Should remove both JSON patterns
        assert '{"prompt"' not in result["text"]
        assert '"n": 1' not in result["text"]
        assert "![image]" not in result["text"]
        assert "Some text in between" in result["text"]
        assert "Final text" in result["text"]