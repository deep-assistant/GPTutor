from flask import Flask, request

from images.dalle3 import generate_dalle
from images.prodia import txt2img
from images.midjourney import txt2img_midjourney
from vk_docs.index import create_question_vk_doc

app = Flask(__name__)


@app.post('/llm')
def llm_post():
    return None


@app.get('/llm')
def llm_get():
    return []


@app.post("/image")
def image():
    return txt2img(
        prompt=request.json["prompt"],
        model=request.json["modelId"],
        negative_prompt=request.json["negativePrompt"],
        scheduler=request.json["scheduler"],
        guidance_scale=request.json["guidanceScale"],
        seed=request.json["seed"],
        steps=request.json["numInferenceSteps"],
    )


@app.post("/vk-doc-question")
def vk_doc_question():
    return create_question_vk_doc(
        question=request.json["question"],
        source=request.json["source"]
    )


@app.post("/dalle")
def dalle():
    print(request.json)

    try:
        return txt2img(
            prompt=request.json["prompt"],
            model=request.json["modelId"],
            negative_prompt=request.json["negativePrompt"],
            scheduler=request.json["scheduler"],
            guidance_scale=request.json["guidanceScale"],
            seed=request.json["seed"],
            steps=request.json["numInferenceSteps"],
        )

    except Exception as e:
        print(e)
        return txt2img(
            prompt=request.json["prompt"],
            model=request.json["modelId"],
            negative_prompt=request.json["negativePrompt"],
            scheduler=request.json["scheduler"],
            guidance_scale=request.json["guidanceScale"],
            seed=request.json["seed"],
            steps=request.json["numInferenceSteps"],
        )


@app.post("/midjourney")
def midjourney():
    print("Midjourney request:", request.json)

    try:
        return txt2img_midjourney(
            prompt=request.json["prompt"],
            negative_prompt=request.json.get("negativePrompt", ""),
            model=request.json.get("modelId", "midjourney-v6"),
            scheduler=request.json.get("scheduler", "midjourney"),
            guidance_scale=request.json.get("guidanceScale", 7.0),
            seed=request.json.get("seed", -1),
            steps=request.json.get("numInferenceSteps", 25),
            width=request.json.get("width", 1024),
            height=request.json.get("height", 1024),
        )

    except Exception as e:
        print("Midjourney error:", e)
        return {
            "error": f"Midjourney generation failed: {str(e)}",
            "status": 500
        }


def run_flask():
    app.run(debug=True, port=1337, host="0.0.0.0")


if __name__ == '__main__':
    run_flask()
