# Midjourney Integration for GPTutor

## Overview

This implementation adds Midjourney support to the GPTutor image generation system. The integration follows the existing patterns used for other image generation services like DALL-E and Stable Diffusion.

## Files Modified

### Backend (GPTutor-Models)

1. **`images/midjourney.py`** - New file
   - Main Midjourney integration module
   - Functions: `generate_midjourney_image()`, `txt2img_midjourney()`, `poll_midjourney_result()`
   - Compatible with existing API interface

2. **`images/enums.py`** - Updated
   - Added `MidjourneyModel` enum with available models (V6, V5.2, V5.1, V5, Niji V6, Niji V5)
   - Added `MidjourneyStyle` enum with style options (raw, expressive, cute, scenic, original)

3. **`app.py`** - Updated
   - Added import for Midjourney module
   - Added new `/midjourney` endpoint
   - Error handling for Midjourney-specific failures

### Frontend (GPTutor-Frontend)

1. **`src/entity/image/styles.ts`** - Updated
   - Added Midjourney models to the `styles` array
   - Added Midjourney models to the `models` array
   - Models: Midjourney V6, V5.2, Niji V6 (Anime)

2. **`src/api/images.ts`** - Updated
   - Added `generateMidjourneyImage()` function
   - Mirrors existing API structure for compatibility

3. **`src/entity/image/index.ts`** - Updated
   - Added Midjourney detection method: `isMidjourneyModel()`
   - Modified `generateImage()` to conditionally use Midjourney API
   - Maintains backward compatibility

## API Endpoints

### `/midjourney` (POST)

Generates images using Midjourney API.

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains",
  "modelId": "midjourney-v6",
  "negativePrompt": "blurry, low quality",
  "scheduler": "midjourney",
  "guidanceScale": 7.0,
  "seed": 12345,
  "numInferenceSteps": 25,
  "width": 1024,
  "height": 1024
}
```

**Response:**
```json
{
  "output": ["https://midjourney-cdn.com/image-url.png"],
  "meta": {
    "seed": 12345,
    "task_id": "mj_task_123",
    "full_prompt": "A beautiful sunset over mountains --ar 1:1 --style raw --seed 12345",
    "aspect_ratio": "1:1",
    "model": "midjourney",
    "scheduler": "midjourney",
    "width": 1024,
    "height": 1024
  }
}
```

## Configuration

### Environment Variables

- `MIDJOURNEY_API_KEY` - Required API key for Midjourney service

### Model Detection

The system automatically detects Midjourney models by checking if the model ID starts with "midjourney".

### Aspect Ratio Mapping

The system automatically converts width/height dimensions to Midjourney aspect ratio parameters:
- 1:1 for square images
- 16:9 for wide landscape
- 9:16 for tall portrait  
- 3:2 and 2:3 for moderate ratios

## Features

### Supported Midjourney Features

1. **Multiple Models**: V6, V5.2, V5.1, V5, Niji V6, Niji V5
2. **Style Parameters**: Raw, expressive, cute, scenic, original
3. **Aspect Ratios**: Automatic conversion from width/height
4. **Negative Prompts**: Converted to `--no` parameter
5. **Seeds**: Added to prompt as `--seed` parameter
6. **Polling**: Automatic result polling with timeout handling

### Compatibility

- Maintains full backward compatibility with existing image generation
- Uses same request/response structure as other services
- Integrates seamlessly with existing frontend interface
- Supports all existing frontend features (samples, upscaling, etc.)

## Testing

Run the integration test:
```bash
python3 examples/test_midjourney.py
```

This test verifies:
- Module imports
- Enum definitions
- API compatibility
- Function signatures

## Usage

1. **Set API Key**: Configure `MIDJOURNEY_API_KEY` environment variable
2. **Select Model**: Choose any Midjourney model from the dropdown
3. **Generate**: Use the standard image generation interface
4. **Wait**: Midjourney generation may take longer than other services

## Technical Notes

### API Integration

The implementation assumes a hypothetical Midjourney API structure. The actual Midjourney API may differ and will require adjustments to:
- API endpoints
- Authentication method
- Request/response format
- Polling mechanism

### Error Handling

- Connection timeouts
- API rate limiting
- Generation failures
- Invalid prompts
- Missing API keys

### Performance

- Polling interval: 5 seconds
- Maximum polling time: 5 minutes (60 attempts)
- Timeout handling for long generations

## Future Improvements

1. **Real API Integration**: Replace placeholder API with actual Midjourney endpoints
2. **Advanced Parameters**: Support more Midjourney-specific parameters
3. **Caching**: Implement result caching for repeated requests
4. **Webhooks**: Use webhooks instead of polling for better performance
5. **Batch Processing**: Support multiple image generation in one request