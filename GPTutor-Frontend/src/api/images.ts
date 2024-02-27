import {
  GeneratedImage,
  GenerateImageRequest,
  ImageComplaint,
  ImageLikes,
} from "$/entity/image/types";
import { ErrorResponseType, Pageable, ResponseData } from "$/entity/common";
import { miniAppSystem } from "$/services/MiniAppSystem";

const BACKEND_HOST = env.REACT_APP_BACKEND_HOST;

export function generateImage(
  params: GenerateImageRequest,
  controller: AbortController
): Promise<GeneratedImage[] & ErrorResponseType> {
  return fetch(`${BACKEND_HOST}image`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + location.href,
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    body: JSON.stringify(params),
  }).then((res) => res.json());
}

export async function getImageBase64(imageId: string): Promise<string> {
  const res = await fetch(`${BACKEND_HOST}image/${imageId}/base64`, {
    headers: {
      Authorization: "Bearer " + location.href,
      "Content-Type": "application/json",
    },
  });

  return await res.text();
}

export async function createComplaint(
  imageId: string
): Promise<ImageComplaint> {
  const res = await fetch(`${BACKEND_HOST}image/${imageId}/complaint`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + location.href,
      "Content-Type": "application/json",
    },
  });

  return await res.json();
}

export async function createImageLike(imageId: string): Promise<ImageLikes> {
  const res = await fetch(`${BACKEND_HOST}image/${imageId}/like`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + miniAppSystem.getAuthorization(),
      "Content-Type": "application/json",
    },
  });

  return await res.json();
}

export function getImages(
  pageNumber: number
): Promise<Pageable<GeneratedImage>> {
  return fetch(`${BACKEND_HOST}image?pageNumber=${pageNumber}`, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + miniAppSystem.getAuthorization(),
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
}

export function getImagesPublishing(
  queryOriginalPrompt: string,
  queryPrompt: string,
  pageNumber: number
): Promise<Pageable<GeneratedImage>> {
  return fetch(
    `${BACKEND_HOST}publishing?queryOriginalPrompt=${queryOriginalPrompt}&queryPrompt=${queryPrompt}&pageNumber=${pageNumber}`,
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + miniAppSystem.getAuthorization(),
        "Content-Type": "application/json",
      },
    }
  ).then((res) => res.json());
}
