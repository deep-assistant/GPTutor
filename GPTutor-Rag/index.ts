import express, { Request, Response } from "express";
import { GigaChatEmbeddings } from "./GigaChatSupport/GigaChatEmbeddings";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import * as bodyParser from "body-parser";
import { createWorkflow } from "./graph/buildWorkflow";
import { EnsembleRetriever } from "langchain/retrievers/ensemble";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

interface DocQuestionRequest {
  question: string;
  source: string;
}

type SupportedSources = "all" | "vk_api_docs" | "vk_ui" | "videos";

function isValidSource(source: string): source is SupportedSources {
  return ["all", "vk_api_docs", "vk_ui", "videos"].includes(source);
}

(async () => {
  try {
    console.log("Loading vector stores...");
    
    if (!process.env.CLIENT_SECRET_KEY) {
      throw new Error("CLIENT_SECRET_KEY environment variable is required");
    }

    const embeddings = new GigaChatEmbeddings({ clientSecretKey: process.env.CLIENT_SECRET_KEY });

    const vectorStoreVKUIDoc = await FaissStore.loadFromPython(
      "./faiss_vk_ui_docs_index",
      embeddings
    );

    const vectorStoreVKDoc = await FaissStore.load(
      "./faiss_vk_docs_index_js",
      embeddings
    );

    const vectorStoreVideos = await FaissStore.loadFromPython(
      "./faiss_vk_videos_index",
      embeddings
    );

    console.log("Vector stores loaded successfully");

    function createRetriever(source: SupportedSources) {
      switch (source) {
        case "all":
          return new EnsembleRetriever({
            retrievers: [
              vectorStoreVKUIDoc.asRetriever({ k: 2 }),
              vectorStoreVKDoc.asRetriever({ k: 2 }),
              vectorStoreVideos.asRetriever({ k: 2 }),
            ],
            weights: [0.33, 0.33, 0.33],
          });
        case "vk_api_docs":
          return new EnsembleRetriever({
            retrievers: [vectorStoreVKDoc.asRetriever({ k: 3 })],
          });
        case "vk_ui":
          return vectorStoreVKUIDoc.asRetriever({ k: 3 });
        case "videos":
          return vectorStoreVideos.asRetriever({ k: 3 });
        default:
          throw new Error(`Unsupported source: ${source}`);
      }
    }

    app.post("/doc-question", async (req: Request<{}, any, DocQuestionRequest>, res: Response) => {
      try {
        const { question, source } = req.body;

        if (!question || !source) {
          return res.status(400).json({ 
            error: "Missing required fields: question and source are required" 
          });
        }

        if (!isValidSource(source)) {
          return res.status(400).json({ 
            error: `Invalid source. Supported sources: ${["all", "vk_api_docs", "vk_ui", "videos"].join(", ")}` 
          });
        }

        const result = await createWorkflow(question, createRetriever(source));
        res.json({ result });
      } catch (error) {
        console.error("Error processing doc question:", error);
        res.status(500).json({ 
          error: "Internal server error occurred while processing your question" 
        });
      }
    });

    app.get("/health", (req: Request, res: Response) => {
      res.json({ status: "healthy", timestamp: new Date().toISOString() });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
})();
