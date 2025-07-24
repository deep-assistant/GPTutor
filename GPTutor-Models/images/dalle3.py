import base64
import os
import re

import requests
from openai import OpenAI


def get_image_form_response(text):
    pattern = r'!\[image\]\((https://files\.oaiusercontent\.com/file-.*?)\)'

    match = re.search(pattern, text)

    if match:
        image_url = match.group(1)
        return image_url
    else:
        return None


def format_image_from_request(text: str):
    pattern1 = r'\{\s*"prompt"\s*:\s*".*?",\s*"size"\s*:\s*".*?"\s*\}'
    answer_text_re1 = re.sub(pattern1, '', text, flags=re.DOTALL)
    pattern2 = r'\{\s*"prompt"\s*:\s*".*?,\s*"size"\s*:\s*".*?",\s*"n"\s*:\s*\d+\s*\}'
    answer_text_re2 = re.sub(pattern2, '', answer_text_re1, flags=re.DOTALL)
    pattern3 = r'!\[image\]\(https://files\.oaiusercontent\.com/file-.*?\)'
    answer_text_re3 = re.sub(pattern3, '', answer_text_re2)

    image = get_image_form_response(answer_text_re2)

    return {
        "image": image,
        "text": answer_text_re3
    }


def download_by_url(url):
    proxies = {
        'http': 'http://KBPfMh:cvtK90@94.131.19.8:9372',
        'https': 'http://KBPfMh:cvtK90@94.131.19.8:9372',
    }

    response = requests.get(url, proxies=proxies)

    if response.status_code == 200:
        image_base64 = base64.b64encode(response.content).decode('utf-8')
        return f"data:image/jpen;base64,{image_base64}"
    else:
        return None


def generate_dalle(prompt: str):
    print(os.environ.get('API_KEYS_120'))
    openai = OpenAI(
        api_key=os.environ.get('API_KEYS_120'),
        base_url="https://api.deep.assistant.run.place/v1/",
    )

    chat_completion = openai.chat.completions.create(
        model="gpt-4o-plus",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": f"You should generate images in size 1024х1024"
            },
            {"role": "user", "content": prompt},
        ],
        stream=False,
    )
    print(chat_completion)

    formatted_response = format_image_from_request(chat_completion.choices[0].message.content)

    return {
        "image": formatted_response["image"],
        "text": formatted_response["text"],
        "total_tokens": chat_completion.usage.total_tokens
    }
