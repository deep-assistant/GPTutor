import { CSSProperties } from "react";
import {
  HEADER_HEIGHT,
  HEADER_Z_INDEX,
  CONTAINER_Z_INDEX,
  SCROLL_ARROW_Z_INDEX,
  INPUT_BOTTOM_OFFSET,
  SCROLL_ARROW_RIGHT_OFFSET,
} from "./constants";

/**
 * Стили для панели чата
 */

export const chatContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: CONTAINER_Z_INDEX,
};

export const chatHeaderStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: `${HEADER_HEIGHT}px`,
  background: "var(--vkui--color_background_contrast_themed)",
  borderBottom: "1px solid var(--vkui--color_separator_primary)",
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
  zIndex: HEADER_Z_INDEX,
};

export const messagesScrollContainerStyle: CSSProperties = {
  flexGrow: 1,
  overflow: "auto",
  scrollBehavior: "smooth",
  background: "var(--vkui--color_background_content)",
  marginTop: `${HEADER_HEIGHT}px`,
};

export const messagesInnerContainerStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  minHeight: "100%",
  display: "flex",
  flexDirection: "column",
};

export const scrollArrowContainerStyle: CSSProperties = {
  position: "fixed",
  bottom: `${INPUT_BOTTOM_OFFSET}px`,
  right: `${SCROLL_ARROW_RIGHT_OFFSET}px`,
  zIndex: SCROLL_ARROW_Z_INDEX,
};




