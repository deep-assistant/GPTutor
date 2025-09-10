import pytest
from unittest.mock import patch, MagicMock
import sys
import os
import json

# Add the parent directory to sys.path to import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Flask app
from app import app


class TestFlaskApp:
    """Test cases for Flask application endpoints"""

    @pytest.fixture
    def client(self):
        """Create a test client for the Flask app"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client

    def test_llm_get_endpoint(self, client):
        """Test GET /llm endpoint"""
        response = client.get('/llm')
        assert response.status_code == 200
        assert response.get_json() == []

    def test_llm_post_endpoint(self, client):
        """Test POST /llm endpoint"""
        response = client.post('/llm')
        assert response.status_code == 200
        assert response.get_json() is None

    @patch('app.txt2img')
    def test_image_post_endpoint_success(self, mock_txt2img, client):
        """Test successful POST /image endpoint"""
        # Mock the txt2img function
        mock_txt2img.return_value = {
            "output": ["https://example.com/generated_image.jpg"],
            "meta": {"seed": 12345}
        }
        
        # Test payload
        payload = {
            "prompt": "A beautiful landscape",
            "modelId": "flux-pro",
            "negativePrompt": "blurry, low quality",
            "scheduler": "euler",
            "guidanceScale": 7.5,
            "seed": 12345,
            "numInferenceSteps": 20
        }
        
        response = client.post('/image', 
                             data=json.dumps(payload),
                             content_type='application/json')
        
        assert response.status_code == 200
        
        # Verify txt2img was called with correct parameters
        mock_txt2img.assert_called_once_with(
            prompt="A beautiful landscape",
            model="flux-pro",
            negative_prompt="blurry, low quality",
            scheduler="euler",
            guidance_scale=7.5,
            seed=12345,
            steps=20
        )
        
        # Verify response
        result = response.get_json()
        assert result["output"] == ["https://example.com/generated_image.jpg"]
        assert result["meta"]["seed"] == 12345

    def test_image_post_endpoint_missing_data(self, client):
        """Test POST /image endpoint with missing data"""
        # Missing required fields should cause KeyError
        payload = {"prompt": "test"}
        
        response = client.post('/image',
                             data=json.dumps(payload),
                             content_type='application/json')
        
        # Should return 500 due to KeyError
        assert response.status_code == 500

    @patch('app.create_question_vk_doc')
    def test_vk_doc_question_endpoint_success(self, mock_create_question, client):
        """Test successful POST /vk-doc-question endpoint"""
        # Mock the create_question_vk_doc function
        mock_create_question.return_value = {
            "question": "How to use VK API?",
            "generation": "VK API allows you to...",
            "documents": [
                {
                    "metadata": {"source": "vk_api_docs"},
                    "page_content": "API documentation content"
                }
            ]
        }
        
        payload = {
            "question": "How to use VK API?",
            "source": "vk_api_docs"
        }
        
        response = client.post('/vk-doc-question',
                             data=json.dumps(payload),
                             content_type='application/json')
        
        assert response.status_code == 200
        
        # Verify create_question_vk_doc was called correctly
        mock_create_question.assert_called_once_with(
            question="How to use VK API?",
            source="vk_api_docs"
        )
        
        # Verify response
        result = response.get_json()
        assert result["question"] == "How to use VK API?"
        assert result["generation"] == "VK API allows you to..."
        assert len(result["documents"]) == 1

    def test_vk_doc_question_endpoint_missing_data(self, client):
        """Test POST /vk-doc-question endpoint with missing data"""
        payload = {"question": "test"}  # missing 'source'
        
        response = client.post('/vk-doc-question',
                             data=json.dumps(payload),
                             content_type='application/json')
        
        # Should return 500 due to KeyError
        assert response.status_code == 500

    @patch('app.txt2img')
    def test_dalle_endpoint_success(self, mock_txt2img, client):
        """Test successful POST /dalle endpoint"""
        mock_txt2img.return_value = {
            "output": ["https://example.com/dalle_image.jpg"],
            "meta": {"seed": 54321}
        }
        
        payload = {
            "prompt": "A futuristic city",
            "modelId": "dalle-3",
            "negativePrompt": "",
            "scheduler": "default",
            "guidanceScale": 8.0,
            "seed": 54321,
            "numInferenceSteps": 25
        }
        
        response = client.post('/dalle',
                             data=json.dumps(payload),
                             content_type='application/json')
        
        assert response.status_code == 200
        
        # Should call txt2img twice (once in try, once in except if first fails)
        # But since our mock doesn't raise an exception, it should only be called once
        assert mock_txt2img.call_count == 1
        
        # Verify response
        result = response.get_json()
        assert result["output"] == ["https://example.com/dalle_image.jpg"]

    @patch('app.txt2img')
    def test_dalle_endpoint_with_exception(self, mock_txt2img, client):
        """Test POST /dalle endpoint when first call fails"""
        # Mock txt2img to raise exception on first call, succeed on second
        mock_txt2img.side_effect = [
            Exception("First call failed"),
            {
                "output": ["https://example.com/dalle_retry.jpg"],
                "meta": {"seed": 99999}
            }
        ]
        
        payload = {
            "prompt": "Test prompt",
            "modelId": "dalle-3",
            "negativePrompt": "",
            "scheduler": "default",
            "guidanceScale": 7.0,
            "seed": 99999,
            "numInferenceSteps": 20
        }
        
        response = client.post('/dalle',
                             data=json.dumps(payload),
                             content_type='application/json')
        
        assert response.status_code == 200
        
        # Should be called twice (first fails, second succeeds)
        assert mock_txt2img.call_count == 2
        
        # Both calls should have identical parameters
        call_args_1 = mock_txt2img.call_args_list[0][1]
        call_args_2 = mock_txt2img.call_args_list[1][1]
        assert call_args_1 == call_args_2
        
        # Verify response from second call
        result = response.get_json()
        assert result["output"] == ["https://example.com/dalle_retry.jpg"]

    def test_dalle_endpoint_missing_data(self, client):
        """Test POST /dalle endpoint with missing data"""
        payload = {"prompt": "test"}  # missing other required fields
        
        response = client.post('/dalle',
                             data=json.dumps(payload),
                             content_type='application/json')
        
        # Should return 500 due to KeyError
        assert response.status_code == 500

    def test_run_flask_function_exists(self):
        """Test that run_flask function exists"""
        from app import run_flask
        assert callable(run_flask)

    def test_app_configuration(self):
        """Test Flask app basic configuration"""
        from app import app
        assert app is not None
        assert app.name == 'app'

    def test_endpoint_routes_exist(self):
        """Test that all expected routes are registered"""
        from app import app
        
        routes = [rule.rule for rule in app.url_map.iter_rules()]
        
        # Check that our endpoints exist
        assert '/llm' in routes
        assert '/image' in routes
        assert '/vk-doc-question' in routes
        assert '/dalle' in routes

    def test_endpoint_methods(self):
        """Test that endpoints accept correct HTTP methods"""
        from app import app
        
        rules = {rule.rule: rule.methods for rule in app.url_map.iter_rules()}
        
        # Check HTTP methods
        assert 'GET' in rules['/llm']
        assert 'POST' in rules['/llm']
        assert 'POST' in rules['/image']
        assert 'POST' in rules['/vk-doc-question']
        assert 'POST' in rules['/dalle']

    @patch('app.txt2img')
    def test_image_endpoint_parameter_mapping(self, mock_txt2img, client):
        """Test that image endpoint correctly maps JSON parameters to function arguments"""
        mock_txt2img.return_value = {"output": [], "meta": {}}
        
        payload = {
            "prompt": "test_prompt",
            "modelId": "test_model",
            "negativePrompt": "test_negative",
            "scheduler": "test_scheduler",
            "guidanceScale": 9.5,
            "seed": 42,
            "numInferenceSteps": 15
        }
        
        client.post('/image',
                   data=json.dumps(payload),
                   content_type='application/json')
        
        # Verify parameter mapping
        mock_txt2img.assert_called_once_with(
            prompt="test_prompt",
            model="test_model",
            negative_prompt="test_negative",
            scheduler="test_scheduler",
            guidance_scale=9.5,
            seed=42,
            steps=15
        )