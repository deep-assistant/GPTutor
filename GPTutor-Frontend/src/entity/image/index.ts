import { memo, sig } from "dignals";
import { ChipOption } from "@vkontakte/vkui";

import ReactivePromise from "$/services/ReactivePromise";
import { generateImage, getImageBase64, generateMidjourneyImage } from "$/api/images";
import {
  emptyImageGenerated,
  GeneratedImage,
  ImageAspectRatio,
  ImageExample,
} from "$/entity/image/types";
import { ChatGptImages } from "$/entity/GPT/ChatGptImages";
import { translationService } from "$/services/TranslationService";
import { datePlus30Days } from "$/utility/date";
import { ImageGenerationPrompt } from "$/entity/image/ImageGenerationPrompt";

import { StopWatch } from "$/entity/stopWatch";
import { getRandomStylesImage } from "$/entity/image/prompts";
import { vkStorageService } from "$/services/VkStorageService";

import { defaultModel, defaultSampler } from "./styles";

const emptyPrompt = {
  ru: "Космонавт верхном на лошади, hd, Космическое сияние, высокое качество, профессиональное фото",
  en: "Astronaut riding a horse, hd, cosmic radiance, high quality, professional photo",
};

class ImageGeneration {
  isHasHelpBlock$ = sig(false);

  requestParameters = false;
  advancedSettingOpen = false;

  abortController: AbortController | null = null;

  timer = new StopWatch();
  imageGenerationPrompt = new ImageGenerationPrompt();
  chatGpt = new ChatGptImages();

  enhancePrompt$ = sig(false);

  enhanceAvailable$ = sig(false);

  prompt$ = sig("");
  model$ = sig(defaultModel);
  sampler$ = sig(defaultSampler);
  step$ = sig(25);
  CFGScale$ = sig(7);
  negativePrompts$ = sig<ChipOption[]>([]);
  seed$ = sig("");
  result$ = sig<GeneratedImage[]>([]);
  error$ = sig<string>("");
  aspectRatio$ = sig<ImageAspectRatio>(ImageAspectRatio.square);
  samples$ = sig(1);
  height$ = sig(512);
  width$ = sig(512);
  widthView$ = sig(512);
  heightView$ = sig(512);
  imageSize = sig<ImageAspectRatio>(ImageAspectRatio.square);
  upscale$ = sig<"no" | "yes">("no");
  loraModel$ = sig("");

  loading$ = sig(false);

  resultIsEmpty$ = memo(
    () => !!this.result$.get().find((item) => !item.modelId)
  );

  resultHasEmpty$ = memo(() => this.result$.get().some((item) => item.modelId));

  notEmptyResults$ = memo(() =>
    this.result$.get().filter((item) => item.modelId)
  );

  constructor() {
    this.setResults();
    this.initHelpBlock();
  }

  toggleEnhancePrompt = () => {
    this.enhancePrompt$.set(!this.enhancePrompt$.get());
  };

  async initHelpBlock() {
    const isHasHelpBlock = await vkStorageService.get("isHasHelpBlock2");
    if (!isHasHelpBlock) return;

    this.isHasHelpBlock$.set(true);
  }

  setHelpBlock = () => {
    this.isHasHelpBlock$.set(true);
    vkStorageService.set("isHasHelpBlock2", String(true));
  };

  toggleAdvancedSettingOpen = () => {
    this.advancedSettingOpen = !this.advancedSettingOpen;
  };

  toggleRequestParameters = () => {
    this.requestParameters = !this.requestParameters;
  };

  setSamples(value: string) {
    const numberValue = Number(value);
    this.samples$.set(numberValue > 4 ? 4 : numberValue);
    this.setResults();
  }

  setUpscale(upscale: "no" | "yes") {
    this.upscale$.set(upscale);
  }

  setResults() {
    const notEmptyResults = this.notEmptyResults$.get().length;
    const samples = this.samples$.get();

    if (notEmptyResults > samples) {
      this.result$.set(this.notEmptyResults$.get());
      return;
    }

    const results = new Array(
      this.samples$.get() - this.notEmptyResults$.get().length
    )
      .fill(null)
      .map((_, index) => ({
        ...emptyImageGenerated,
        id: String(index),
      })) as GeneratedImage[];

    this.result$.set([...this.notEmptyResults$.get(), ...results]);
  }

  setEmptyResults() {
    const emptyResults = new Array(this.samples$.get())
      .fill(null)
      .map((_, index) => ({
        ...emptyImageGenerated,
        id: String(index),
      })) as GeneratedImage[];

    this.result$.set(emptyResults);
  }

  setNegativePrompts(negativePrompts: ChipOption[]) {
    this.negativePrompts$.set(negativePrompts);
  }

  setCFGScale = (CFGScale: number) => {
    this.CFGScale$.set(CFGScale);
  };

  setModel(model: string) {
    this.model$.set(model);
    this.loraModel$.set("");
  }

  setLoraModel(value: string) {
    this.loraModel$.set(value);
  }

  setSeed(seed: string) {
    this.seed$.set(seed);
  }

  setStep = (step: number) => {
    this.step$.set(step);
  };

  setWidth = (width: number) => {
    this.width$.set(width);
    this.aspectRatio$.set(ImageAspectRatio.custom);

    if (!this.loading$.get() && !this.resultHasEmpty$.get()) {
      this.widthView$.set(width);
    }
  };
  setHeight = (height: number) => {
    this.height$.set(height);
    this.aspectRatio$.set(ImageAspectRatio.custom);

    if (!this.loading$.get() && !this.resultHasEmpty$.get()) {
      this.heightView$.set(height);
    }
  };

  setSampler(sampler: string) {
    this.sampler$.set(sampler);
  }

  setAspectRatio(aspectRatio: ImageAspectRatio) {
    if (aspectRatio === ImageAspectRatio.square) {
      this.setWidth(512);
      this.setHeight(512);
    }

    if (aspectRatio === ImageAspectRatio.portrait) {
      this.setWidth(512);
      this.setHeight(768);
    }

    if (aspectRatio === ImageAspectRatio.landscape) {
      this.setWidth(768);
      this.setHeight(512);
    }

    this.aspectRatio$.set(aspectRatio);
  }

  setPrompt(prompt: string) {
    this.prompt$.set(prompt);
    this.disableEnhance();
  }

  disableEnhance() {
    const prompt = this.prompt$.get().split(",");
    const styles = this.imageGenerationPrompt.selectedStyles$.get();

    const hasEnhancePrompt = prompt.concat(styles).length > 10;

    if (hasEnhancePrompt) {
      this.enhancePrompt$.set(false);
    }

    this.enhanceAvailable$.set(!hasEnhancePrompt);
  }

  applyExample(example: ImageExample) {
    this.prompt$.set(example.originalPrompt!);
    this.model$.set(example.modelId);
    this.seed$.set(example.seed ? String(example.seed) : "");
    this.step$.set(example.numInferenceSteps);
    this.CFGScale$.set(example.guidanceScale);
    this.sampler$.set(example.scheduler);
    this.aspectRatio$.set(ImageAspectRatio.square);
    this.loraModel$.set(example.loraModel);

    const negativePrompts = example.negativePrompt.trim().split(",");

    if (negativePrompts.length === 0) this.negativePrompts$.set([]);

    this.negativePrompts$.set(
      negativePrompts.map((value) => ({ value, label: value }))
    );
  }

  getPromptWithStyles(prompt: string) {
    return `${prompt}${this.getStyles()}`;
  }

  getStyles() {
    const styles = this.imageGenerationPrompt.selectedStyles$.get();

    if (styles.length === 0) {
      if (this.enhancePrompt$.get()) {
        return `,${getRandomStylesImage().join(", ")}`;
      }

      return "";
    }

    return `,${styles.concat(this.getEnhanceStyles()).join(", ")}`;
  }

  getEnhanceStyles() {
    if (this.enhancePrompt$.get()) {
      return getRandomStylesImage();
    }

    return [];
  }

  isWeakRequest() {
    if (this.prompt$.get() === "") return false;
    return this.getPromptWithStyles(this.prompt$.get()).split(",").length <= 4;
  }

  getTextWithNegativePrompts(prompt: string) {
    const negativePrompts = this.negativePrompts$.get();

    if (negativePrompts.length === 0) return prompt;

    return `${prompt} || ${negativePrompts
      .map(({ label }) => label)
      .join(",")}`;
  }

  splitPrompt(text: string) {
    const [prompt, negativePrompts] = text.split("||");

    return [prompt, negativePrompts || ""];
  }

  getSeed() {
    const seed = this.seed$.get();

    if (seed === "-1" || !seed) return "-1";

    if (isNaN(Number(seed)))
      return String(
        seed
          .split("")
          .map((_, index) => seed.charCodeAt(index))
          .reduce((acc, item) => acc + item)
      );

    return seed;
  }

  isMidjourneyModel() {
    const model = this.model$.get();
    return model.startsWith("midjourney");
  }

  getPrompt() {
    return this.prompt$.get().trim() === ""
      ? emptyPrompt.ru
      : this.prompt$.get();
  }

  generateImage = async () => {
    try {
      this.error$.set("");
      const originalPrompt = this.getPrompt();

      this.loading$.set(true);

      this.timer.run();

      const translatedPrompt = await translationService.translate(
        this.getTextWithNegativePrompts(
          this.getPromptWithStyles(originalPrompt)
        )
      );

      const [prompt, negativePrompt] = this.splitPrompt(translatedPrompt);

      this.abortController = new AbortController();

      const requestParams = {
        modelId: this.model$.get(),
        prompt: prompt.trim(),
        createdAt: new Date(),
        guidanceScale: this.CFGScale$.get(),
        seed: this.getSeed(),
        expireTimestamp: datePlus30Days(),
        samples: this.samples$.get(),
        originalPrompt: "",
        scheduler: this.sampler$.get(),
        width: this.width$.get(),
        height: this.height$.get(),
        upscale: this.upscale$.get(),
        numInferenceSteps: this.step$.get(),
        loraModel: this.loraModel$.get(),
        negativePrompt: negativePrompt.trim(),
      };

      const result = this.isMidjourneyModel() 
        ? await generateMidjourneyImage(requestParams, this.abortController!)
        : await generateImage(requestParams, this.abortController!);

      if (result.error) {
        console.log(result);
        this.setResults();
        this.timer.stop();
        this.loading$.set(false);

        if (result.status === 400) {
          this.error$.set(result.error);
          return;
        }

        if (result.status === 429) {
          this.error$.set(result.error);
          return;
        }

        this.error$.set("Что-то пошло не так, попробуйте позже");
        return;
      }

      this.timer.stop();
      this.loading$.set(false);
      this.result$.set(result);
    } catch (e: any) {
      console.log(e);
      if (e.name === "AbortError") {
        this.setResults();
        this.timer.stop();
        this.loading$.set(false);
        return;
      }

      console.dir(e);

      this.loading$.set(false);
      this.error$.set("Что-то пошло не так, попробуйте позже");
    }
  };

  abortGenerate = () => {
    this.abortController?.abort();
  };

  generate = () => {
    this.setEmptyResults();
    this.generateImage$.run();
  };

  getImageBase64 = async (imageId: string) => {
    return "data:image/png;base64," + (await getImageBase64(imageId));
  };

  generateImage$ = ReactivePromise.create(this.generateImage);
}

export const imageGeneration = new ImageGeneration();
