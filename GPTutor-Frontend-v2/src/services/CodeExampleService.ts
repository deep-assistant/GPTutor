import { createCodeHTML } from "../utils/codeFormatter";

export type CodeExampleType = "curl" | "python" | "js";

export interface CodeExample {
  code: string;
  language: string;
  html: string;
}

export class CodeExampleService {
  private static getBaseUrl(): string {
    return import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  }

  static generateCodeExample(
    type: CodeExampleType,
    apiKey: string
  ): CodeExample {
    const baseUrl = this.getBaseUrl();
    let code = "";
    let language = "";

    switch (type) {
      case "curl":
        code = `curl -X POST "${baseUrl}/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "model": "google/gemini-2.5-flash-lite",
    "messages": [
      {"role": "user", "content": "Привет!"}
    ]
  }'`;
        language = "bash";
        break;

      case "python":
        code = `import requests

url = "${baseUrl}/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
}
data = {
    "model": "google/gemini-2.5-flash-lite",
    "messages": [
        {"role": "user", "content": "Привет!"}
    ]
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`;
        language = "python";
        break;

      case "js":
        code = `const response = await fetch('${baseUrl}/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKey}'
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash-lite',
    messages: [
      { role: 'user', content: 'Привет!' }
    ]
  })
});

const data = await response.json();
console.log(data);`;
        language = "javascript";
        break;

      default:
        throw new Error(`Unsupported code example type: ${type}`);
    }

    return {
      code,
      language,
      html: createCodeHTML(code, language),
    };
  }

  static getRawCode(type: CodeExampleType, apiKey: string): string {
    return this.generateCodeExample(type, apiKey).code;
  }

  static getCodeHTML(type: CodeExampleType, apiKey: string): string {
    return this.generateCodeExample(type, apiKey).html;
  }
}

