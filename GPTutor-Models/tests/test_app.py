import pytest
from app import app


@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_llm_get_endpoint(client):
    """Test the GET /llm endpoint."""
    response = client.get('/llm')
    assert response.status_code == 200
    assert response.json == []


def test_llm_post_endpoint(client):
    """Test the POST /llm endpoint."""
    response = client.post('/llm')
    assert response.status_code == 200


def test_image_endpoint_missing_data(client):
    """Test the POST /image endpoint with missing data."""
    response = client.post('/image', json={})
    # Should return error due to missing required fields
    assert response.status_code in [400, 500]


def test_app_initialization():
    """Test that the Flask app initializes correctly."""
    assert app is not None
    assert app.config.get('TESTING') is not None