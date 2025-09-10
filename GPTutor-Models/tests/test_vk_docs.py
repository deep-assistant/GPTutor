import pytest
from unittest.mock import patch, MagicMock, mock_open
import sys
import os

# Add the parent directory to sys.path to import modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vk_docs.utils import unique_objects_by_field
from vk_docs.index import create_question_vk_doc


class TestVKDocsUtils:
    """Test cases for VK docs utility functions"""

    def test_unique_objects_by_field_basic(self):
        """Test unique_objects_by_field with basic input"""
        objects = [
            {"id": 1, "name": "Alice"},
            {"id": 2, "name": "Bob"},
            {"id": 3, "name": "Alice"},  # duplicate name
            {"id": 4, "name": "Charlie"}
        ]
        
        result = unique_objects_by_field(objects, "name")
        
        # Should keep first occurrence of each unique name
        assert len(result) == 3
        assert result[0] == {"id": 1, "name": "Alice"}
        assert result[1] == {"id": 2, "name": "Bob"}
        assert result[2] == {"id": 4, "name": "Charlie"}

    def test_unique_objects_by_field_empty_list(self):
        """Test unique_objects_by_field with empty list"""
        result = unique_objects_by_field([], "field")
        assert result == []

    def test_unique_objects_by_field_single_item(self):
        """Test unique_objects_by_field with single item"""
        objects = [{"id": 1, "category": "test"}]
        result = unique_objects_by_field(objects, "category")
        assert result == objects

    def test_unique_objects_by_field_all_unique(self):
        """Test unique_objects_by_field where all items are unique"""
        objects = [
            {"id": 1, "status": "active"},
            {"id": 2, "status": "inactive"},
            {"id": 3, "status": "pending"}
        ]
        
        result = unique_objects_by_field(objects, "status")
        assert result == objects

    def test_unique_objects_by_field_all_same(self):
        """Test unique_objects_by_field where all items have same field value"""
        objects = [
            {"id": 1, "type": "document"},
            {"id": 2, "type": "document"},
            {"id": 3, "type": "document"}
        ]
        
        result = unique_objects_by_field(objects, "type")
        assert len(result) == 1
        assert result[0] == {"id": 1, "type": "document"}

    def test_unique_objects_by_field_missing_field(self):
        """Test unique_objects_by_field with missing field raises KeyError"""
        objects = [
            {"id": 1, "name": "Alice"},
            {"id": 2, "name": "Bob"}
        ]
        
        with pytest.raises(KeyError):
            unique_objects_by_field(objects, "missing_field")

    def test_unique_objects_by_field_different_types(self):
        """Test unique_objects_by_field with different value types"""
        objects = [
            {"id": 1, "value": "string"},
            {"id": 2, "value": 123},
            {"id": 3, "value": "string"},  # duplicate string
            {"id": 4, "value": 123},       # duplicate number
            {"id": 5, "value": None},
            {"id": 6, "value": None}       # duplicate None
        ]
        
        result = unique_objects_by_field(objects, "value")
        assert len(result) == 3
        assert result[0]["value"] == "string"
        assert result[1]["value"] == 123
        assert result[2]["value"] is None


class TestVKDocsIndex:
    """Test cases for VK docs index functionality"""

    @patch('vk_docs.index.create_retriever_app')
    def test_create_question_vk_doc_success(self, mock_create_retriever):
        """Test successful create_question_vk_doc execution"""
        # Mock the retriever app and its stream method
        mock_app = MagicMock()
        mock_create_retriever.return_value = mock_app
        
        # Mock document objects
        mock_doc1 = MagicMock()
        mock_doc1.metadata = {"source": "vk_api", "page": 1}
        mock_doc1.page_content = "Content of document 1"
        
        mock_doc2 = MagicMock()
        mock_doc2.metadata = {"source": "vk_ui", "page": 2}
        mock_doc2.page_content = "Content of document 2"
        
        # Mock the stream output
        stream_output = [
            {"retrieve": "some_data"},
            {
                "generate": {
                    "generation": "This is the generated answer",
                    "documents": [mock_doc1, mock_doc2]
                }
            }
        ]
        mock_app.stream.return_value = stream_output
        
        question = "How to use VK API?"
        source = "vk_api_docs"
        
        result = create_question_vk_doc(question, source)
        
        # Verify create_retriever_app was called with correct source
        mock_create_retriever.assert_called_once_with(source)
        
        # Verify stream was called with correct question
        mock_app.stream.assert_called_once_with({"question": question})
        
        # Verify result structure
        assert "question" in result
        assert "generation" in result
        assert "documents" in result
        
        assert result["question"] == question
        assert result["generation"] == "This is the generated answer"
        assert len(result["documents"]) == 2
        
        # Check document structure
        doc1_result = result["documents"][0]
        assert doc1_result["metadata"] == {"source": "vk_api", "page": 1}
        assert doc1_result["page_content"] == "Content of document 1"
        
        doc2_result = result["documents"][1]
        assert doc2_result["metadata"] == {"source": "vk_ui", "page": 2}
        assert doc2_result["page_content"] == "Content of document 2"

    @patch('vk_docs.index.create_retriever_app')
    def test_create_question_vk_doc_no_generate_output(self, mock_create_retriever):
        """Test create_question_vk_doc when stream doesn't contain 'generate' key"""
        mock_app = MagicMock()
        mock_create_retriever.return_value = mock_app
        
        # Mock stream output without 'generate' key
        stream_output = [
            {"retrieve": "some_data"},
            {"other_key": "other_value"}
        ]
        mock_app.stream.return_value = stream_output
        
        result = create_question_vk_doc("test question", "test_source")
        
        # Should return None since no 'generate' key found
        assert result is None

    @patch('vk_docs.index.create_retriever_app')
    def test_create_question_vk_doc_empty_documents(self, mock_create_retriever):
        """Test create_question_vk_doc with empty documents list"""
        mock_app = MagicMock()
        mock_create_retriever.return_value = mock_app
        
        stream_output = [
            {
                "generate": {
                    "generation": "No relevant documents found",
                    "documents": []
                }
            }
        ]
        mock_app.stream.return_value = stream_output
        
        result = create_question_vk_doc("test question", "test_source")
        
        assert result["generation"] == "No relevant documents found"
        assert result["documents"] == []

    @patch('vk_docs.index.create_retriever_app')
    def test_create_question_vk_doc_different_sources(self, mock_create_retriever):
        """Test create_question_vk_doc with different source types"""
        mock_app = MagicMock()
        mock_create_retriever.return_value = mock_app
        
        mock_doc = MagicMock()
        mock_doc.metadata = {"test": "data"}
        mock_doc.page_content = "test content"
        
        stream_output = [
            {
                "generate": {
                    "generation": "test generation",
                    "documents": [mock_doc]
                }
            }
        ]
        mock_app.stream.return_value = stream_output
        
        # Test different source values
        sources = ["vk_api_docs", "vk_ui", "all", "custom_source"]
        
        for source in sources:
            result = create_question_vk_doc("test question", source)
            
            # Verify create_retriever_app was called with the specific source
            mock_create_retriever.assert_called_with(source)
            
            # Result should be consistent regardless of source
            assert result["generation"] == "test generation"
            assert len(result["documents"]) == 1


class TestVKDocsRetriever:
    """Test cases for VK docs retriever functionality (mocked)"""

    @patch('vk_docs.retriver.FAISS.load_local')
    @patch('vk_docs.retriver.GigaChatEmbeddings')
    @patch('vk_docs.retriver.GigaChat')
    def test_retriever_imports(self, mock_gigachat, mock_embeddings, mock_faiss):
        """Test that retriever module imports work correctly"""
        # This test ensures the module can be imported without errors
        # when the dependencies are mocked
        try:
            import vk_docs.retriver
            assert True  # If we get here, imports worked
        except ImportError as e:
            pytest.fail(f"Failed to import vk_docs.retriver: {e}")

    def test_get_docs_index_function_exists(self):
        """Test that get_docs_index function exists and is callable"""
        from vk_docs.retriver import get_docs_index
        assert callable(get_docs_index)

    def test_create_retriever_app_function_exists(self):
        """Test that create_retriever_app function exists and is callable"""
        from vk_docs.retriver import create_retriever_app
        assert callable(create_retriever_app)