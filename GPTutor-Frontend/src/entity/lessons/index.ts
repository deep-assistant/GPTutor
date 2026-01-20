import { LessonsController } from "./LessonsController";
import { ChapterItem } from "./ChapterItem";
import { ModeType } from "./modeType";
import { lessonsJs } from "./lessonsItem/javascript";
import { htmlLessons } from "./lessonsItem/html";
import { gitLessons } from "./lessonsItem/git";
import { reactLessons } from "./lessonsItem/react";
import { typescriptLessons } from "./lessonsItem/typescript";
import { vueLessons } from "./lessonsItem/vue";
import { goLessons } from "./lessonsItem/go";

export * from "./LessonsController";
export * from "./ChapterItem";
export * from "./modeType";
export * from "./LessonItem";
export * from "./LessonRequest";
export * from "./ActionSuggestion";
export * from "./lessonsItem/javascript";
export * from "./lessonsItem/html";
export * from "./lessonsItem/git";
export * from "./lessonsItem/react";
export * from "./lessonsItem/vue";

export { ModeType } from "./modeType";

export const languages = [
  new ChapterItem(
    ModeType.HTMLCSS,
    htmlLessons,
    "Я хочу, чтобы вы выступили в роли Senior Frontend-разработчика. И помогали мне изучать HTML и CSS"
  ),
  new ChapterItem(
    ModeType.JS,
    lessonsJs,
    "Я хочу, чтобы вы выступили в роли Senior Frontend-разработчика. И помогали мне изучать JavaScript"
  ),
  new ChapterItem(
    ModeType.Typescript,
    typescriptLessons,
    "Я хочу, чтобы вы выступили в роли Senior Frontend-разработчика. И помогали мне изучать Typescript"
  ),
  new ChapterItem(
    ModeType.Go,
    goLessons,
    "Я хочу, чтобы вы выступили в роли Senior разработчика. И помогали мне изучать Golang"
  ),
];

export const technologies = [
  new ChapterItem(
    ModeType.React,
    reactLessons,
    "Я хочу, чтобы вы выступили в роли Senior Frontend-разработчика. И помогали мне изучать React"
  ),
  new ChapterItem(
    ModeType.Vue,
    vueLessons,
    "Я хочу, чтобы вы выступили в роли Senior Frontend-разработчика. И помогали мне изучать Vue.js"
  ),
  new ChapterItem(
    ModeType.Git,
    gitLessons,
    "Я хочу, чтобы вы выступили в роли Senior разработчика. И помогали мне изучать Git"
  ),
];

export const lessonsController = new LessonsController([
  ...languages,
  ...technologies,
]);
