from flask import Flask, request, jsonify
import logging
import traceback

from images.dalle3 import generate_dalle
from images.prodia import txt2img
from vk_docs.index import create_question_vk_doc

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.post('/llm')
def llm_post():
    return jsonify({"message": "LLM POST endpoint not implemented"}), 501


@app.get('/llm')
def llm_get():
    return jsonify([])


@app.post("/image")
def image():
    try:
        if not request.json:
            return jsonify({"error": "JSON payload required"}), 400
        
        required_fields = ["prompt", "modelId", "negativePrompt", "scheduler", "guidanceScale", "seed", "numInferenceSteps"]
        for field in required_fields:
            if field not in request.json:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        result = txt2img(
            prompt=request.json["prompt"],
            model=request.json["modelId"],
            negative_prompt=request.json["negativePrompt"],
            scheduler=request.json["scheduler"],
            guidance_scale=request.json["guidanceScale"],
            seed=request.json["seed"],
            steps=request.json["numInferenceSteps"],
        )
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in image generation: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Image generation failed"}), 500


@app.post("/vk-doc-question")
def vk_doc_question():
    try:
        if not request.json:
            return jsonify({"error": "JSON payload required"}), 400
        
        if "question" not in request.json or "source" not in request.json:
            return jsonify({"error": "Missing required fields: question, source"}), 400
        
        result = create_question_vk_doc(
            question=request.json["question"],
            source=request.json["source"]
        )
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in VK doc question: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "VK doc question processing failed"}), 500


@app.post("/dalle")
def dalle():
    try:
        if not request.json:
            return jsonify({"error": "JSON payload required"}), 400
        
        logger.info(f"DALLE request: {request.json}")
        
        required_fields = ["prompt", "modelId", "negativePrompt", "scheduler", "guidanceScale", "seed", "numInferenceSteps"]
        for field in required_fields:
            if field not in request.json:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        result = txt2img(
            prompt=request.json["prompt"],
            model=request.json["modelId"],
            negative_prompt=request.json["negativePrompt"],
            scheduler=request.json["scheduler"],
            guidance_scale=request.json["guidanceScale"],
            seed=request.json["seed"],
            steps=request.json["numInferenceSteps"],
        )
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error in DALLE generation: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "DALLE generation failed"}), 500


def run_flask():
    app.run(debug=True, port=1337, host="0.0.0.0")


if __name__ == '__main__':
    run_flask()
