import base64
import os
import re
import requests
import time
from typing import Optional, Dict, Any
from requests.exceptions import RequestException


def get_midjourney_api_key():
    """Get Midjourney API key from environment variables"""
    return os.environ.get('MIDJOURNEY_API_KEY')


def generate_midjourney_image(prompt: str, aspect_ratio: str = "1:1", style: str = "raw") -> Dict[str, Any]:
    """
    Generate image using Midjourney API
    
    Args:
        prompt: The text prompt for image generation
        aspect_ratio: Image aspect ratio (e.g., "1:1", "16:9", "9:16")
        style: Midjourney style parameter
    
    Returns:
        Dictionary containing image URL, text response and metadata
    """
    api_key = get_midjourney_api_key()
    if not api_key:
        raise ValueError("MIDJOURNEY_API_KEY environment variable not set")
    
    # Midjourney API endpoint (using hypothetical API structure)
    # Note: Actual Midjourney API endpoints and structure may differ
    base_url = "https://api.midjourney.com/v1"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Construct Midjourney prompt with parameters
    full_prompt = f"{prompt} --ar {aspect_ratio} --style {style}"
    
    payload = {
        "prompt": full_prompt,
        "process_mode": "fast"  # or "relax" for slower but cheaper generation
    }
    
    try:
        # Submit generation request
        response = requests.post(
            f"{base_url}/imagine",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code != 200:
            raise RequestException(f"Midjourney API error: {response.status_code} - {response.text}")
        
        result = response.json()
        task_id = result.get("task_id")
        
        if not task_id:
            raise RequestException("No task_id received from Midjourney API")
        
        # Poll for completion
        image_url = poll_midjourney_result(task_id, api_key, base_url)
        
        return {
            "image": image_url,
            "text": f"Generated with Midjourney: {prompt}",
            "task_id": task_id,
            "prompt": prompt,
            "full_prompt": full_prompt,
            "aspect_ratio": aspect_ratio,
            "style": style
        }
        
    except RequestException as exc:
        raise RequestException(f"Midjourney generation failed: {str(exc)}") from exc


def poll_midjourney_result(task_id: str, api_key: str, base_url: str, max_attempts: int = 60) -> str:
    """
    Poll Midjourney API for generation result
    
    Args:
        task_id: Task ID from initial request
        api_key: API key for authentication
        base_url: Base API URL
        max_attempts: Maximum polling attempts (60 * 5 seconds = 5 minutes)
    
    Returns:
        URL of generated image
    """
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(
                f"{base_url}/tasks/{task_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                status = result.get("status")
                
                if status == "completed":
                    image_url = result.get("image_url")
                    if image_url:
                        return image_url
                    else:
                        raise RequestException("No image URL in completed result")
                
                elif status == "failed":
                    error_msg = result.get("error", "Unknown error")
                    raise RequestException(f"Generation failed: {error_msg}")
                
                elif status in ["pending", "processing"]:
                    # Still processing, continue polling
                    time.sleep(5)
                    continue
                    
            else:
                raise RequestException(f"Polling error: {response.status_code}")
                
        except RequestException:
            if attempt == max_attempts - 1:
                raise RequestException("Midjourney generation timeout - max polling attempts exceeded")
            time.sleep(5)
    
    raise RequestException("Midjourney generation timeout")


def txt2img_midjourney(prompt: str, negative_prompt: str = "", model: str = "", 
                      scheduler: str = "", guidance_scale: float = 7.0, 
                      steps: int = 25, seed: int = -1, width: int = 1024, height: int = 1024):
    """
    Midjourney text-to-image generation with compatibility for existing interface
    
    This function provides compatibility with the existing txt2img interface
    while using Midjourney's generation capabilities.
    
    Args:
        prompt: Text prompt for image generation
        negative_prompt: Negative prompt (will be converted to Midjourney --no parameter)
        model: Model parameter (ignored for Midjourney)
        scheduler: Scheduler parameter (ignored for Midjourney)
        guidance_scale: Guidance scale (ignored for Midjourney)
        steps: Number of steps (ignored for Midjourney)
        seed: Random seed (will be added to Midjourney prompt if valid)
        width: Image width
        height: Image height
    
    Returns:
        Dictionary with output URLs and metadata compatible with existing interface
    """
    try:
        # Calculate aspect ratio from width/height
        if width == height:
            aspect_ratio = "1:1"
        elif width > height:
            ratio = round(width / height, 1)
            if ratio >= 1.7:
                aspect_ratio = "16:9"
            else:
                aspect_ratio = "3:2"
        else:
            ratio = round(height / width, 1)
            if ratio >= 1.7:
                aspect_ratio = "9:16"
            else:
                aspect_ratio = "2:3"
        
        # Build Midjourney prompt with additional parameters
        mj_prompt = prompt
        
        # Add negative prompt as --no parameter
        if negative_prompt and negative_prompt.strip():
            mj_prompt += f" --no {negative_prompt.strip()}"
        
        # Add seed if provided and valid
        if seed > 0:
            mj_prompt += f" --seed {seed}"
        
        # Generate image using Midjourney
        result = generate_midjourney_image(
            prompt=mj_prompt,
            aspect_ratio=aspect_ratio,
            style="raw"  # Use raw style for more control
        )
        
        return {
            "output": [result["image"]],
            "meta": {
                "seed": seed if seed > 0 else None,
                "task_id": result.get("task_id"),
                "full_prompt": result.get("full_prompt"),
                "aspect_ratio": aspect_ratio,
                "model": "midjourney",
                "scheduler": "midjourney",
                "width": width,
                "height": height
            }
        }
        
    except RequestException as exc:
        raise RequestException(f"Unable to generate Midjourney image: {str(exc)}") from exc
    except Exception as exc:
        raise RequestException(f"Unexpected error in Midjourney generation: {str(exc)}") from exc


def download_midjourney_image(url: str) -> Optional[str]:
    """
    Download Midjourney image and convert to base64
    
    Args:
        url: Image URL from Midjourney API
    
    Returns:
        Base64 encoded image data or None on failure
    """
    try:
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            image_base64 = base64.b64encode(response.content).decode('utf-8')
            # Determine image format from response headers
            content_type = response.headers.get('content-type', 'image/jpeg')
            if 'png' in content_type.lower():
                return f"data:image/png;base64,{image_base64}"
            else:
                return f"data:image/jpeg;base64,{image_base64}"
        else:
            return None
            
    except RequestException:
        return None