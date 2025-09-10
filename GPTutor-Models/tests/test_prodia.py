import pytest
from unittest.mock import patch, MagicMock
import sys
import os
from requests.exceptions import RequestException

# Add the parent directory to sys.path to import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from images.prodia import txt2img


class TestProdiaFunctions:
    """Test cases for Prodia image generation functions"""

    @patch('images.prodia.Client')
    @patch('images.prodia.randint')
    def test_txt2img_success(self, mock_randint, mock_client_class):
        """Test successful txt2img function"""
        # Mock random seed
        mock_randint.return_value = 12345
        
        # Mock client and response
        mock_client_instance = MagicMock()
        mock_client_class.return_value = mock_client_instance
        
        # Mock the response structure
        mock_response_data = MagicMock()
        mock_response_data.url = "https://example.com/generated_image.jpg"
        mock_response = MagicMock()
        mock_response.data = [mock_response_data]
        mock_client_instance.images.generate.return_value = mock_response
        
        # Test parameters
        prompt = "A beautiful landscape"
        negative_prompt = "blurry, low quality"
        model = "flux-pro"
        scheduler = "euler"
        guidance_scale = 7.5
        steps = 20
        seed = 54321
        
        result = txt2img(
            prompt=prompt,
            negative_prompt=negative_prompt,
            model=model,
            scheduler=scheduler,
            guidance_scale=guidance_scale,
            steps=steps,
            seed=seed
        )
        
        # Verify Client was created with correct provider
        from g4f.Provider import PollinationsAI
        mock_client_class.assert_called_once_with(provider=PollinationsAI)
        
        # Verify images.generate was called with correct parameters
        mock_client_instance.images.generate.assert_called_once_with(
            model="flux-pro",
            prompt=prompt,
            response_format="url"
        )
        
        # Verify result structure
        assert "output" in result
        assert "meta" in result
        assert result["output"] == ["https://example.com/generated_image.jpg"]
        assert result["meta"]["seed"] == seed

    @patch('images.prodia.Client')
    @patch('images.prodia.randint')
    def test_txt2img_with_default_seed(self, mock_randint, mock_client_class):
        """Test txt2img with default random seed"""
        # Mock random seed
        mock_randint.return_value = 9876
        
        # Mock client and response
        mock_client_instance = MagicMock()
        mock_client_class.return_value = mock_client_instance
        
        mock_response_data = MagicMock()
        mock_response_data.url = "https://example.com/test_image.jpg"
        mock_response = MagicMock()
        mock_response.data = [mock_response_data]
        mock_client_instance.images.generate.return_value = mock_response
        
        # Call without seed parameter (should use random)
        result = txt2img(
            prompt="test prompt",
            negative_prompt="test negative",
            model="test-model",
            scheduler="test-scheduler",
            guidance_scale=8.0,
            steps=25
        )
        
        # Verify randint was called for default seed
        mock_randint.assert_called_with(1, 10000)
        
        # Verify result uses the random seed
        assert result["meta"]["seed"] == 9876

    @patch('images.prodia.Client')
    def test_txt2img_request_exception(self, mock_client_class):
        """Test txt2img handling RequestException"""
        # Mock client to raise RequestException
        mock_client_instance = MagicMock()
        mock_client_class.return_value = mock_client_instance
        mock_client_instance.images.generate.side_effect = RequestException("Connection failed")
        
        # Should re-raise as RequestException with custom message
        with pytest.raises(RequestException) as exc_info:
            txt2img(
                prompt="test",
                negative_prompt="test",
                model="test",
                scheduler="test",
                guidance_scale=7.0,
                steps=20
            )
        
        assert str(exc_info.value) == "Unable to fetch the response."
        assert exc_info.value.__cause__ is not None
        assert isinstance(exc_info.value.__cause__, RequestException)

    @patch('images.prodia.Client')
    def test_txt2img_other_exception(self, mock_client_class):
        """Test txt2img handling other exceptions"""
        # Mock client to raise a different exception
        mock_client_instance = MagicMock()
        mock_client_class.return_value = mock_client_instance
        mock_client_instance.images.generate.side_effect = ValueError("Invalid parameter")
        
        # Should not catch non-RequestException errors
        with pytest.raises(ValueError):
            txt2img(
                prompt="test",
                negative_prompt="test",
                model="test",
                scheduler="test",
                guidance_scale=7.0,
                steps=20
            )

    @patch('images.prodia.Client')
    def test_txt2img_response_structure(self, mock_client_class):
        """Test txt2img response structure with multiple URLs"""
        mock_client_instance = MagicMock()
        mock_client_class.return_value = mock_client_instance
        
        # Mock response with multiple data items
        mock_response_data1 = MagicMock()
        mock_response_data1.url = "https://example.com/image1.jpg"
        mock_response_data2 = MagicMock()
        mock_response_data2.url = "https://example.com/image2.jpg"
        
        mock_response = MagicMock()
        mock_response.data = [mock_response_data1, mock_response_data2]
        mock_client_instance.images.generate.return_value = mock_response
        
        result = txt2img(
            prompt="test",
            negative_prompt="test",
            model="test",
            scheduler="test",
            guidance_scale=7.0,
            steps=20,
            seed=12345
        )
        
        # Should only return the first URL
        assert result["output"] == ["https://example.com/image1.jpg"]
        assert result["meta"]["seed"] == 12345

    def test_randint_import(self):
        """Test that randint is properly imported"""
        from images.prodia import randint
        # Should be able to call randint
        result = randint(1, 100)
        assert 1 <= result <= 100