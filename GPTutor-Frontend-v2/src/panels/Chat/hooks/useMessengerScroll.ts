import { useCallback, useEffect, useRef, useState } from "react";

function getScrollBottom(elem: HTMLDivElement) {
  return elem.scrollHeight - elem.scrollTop - elem.clientHeight;
}

const maxAutoScrollValue = 400;
const autoScrollTimeValue = 50;

export function useMessengerScroll(isTyping: boolean) {
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalId = useRef<any>();
  const blockScrollBottom = useRef(false);
  const afterTypingTimeout = useRef<any>(null);

  const scrollTimeout = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current?.scrollHeight;
  }, []);

  useEffect(scrollToBottom, []);

  useEffect(() => {
    const handleScrollStart = () => {
      blockScrollBottom.current = true;
    };

    const handleScrollEnd = () => {
      blockScrollBottom.current = false;
    };

    const currentRef = scrollRef.current;

    currentRef?.addEventListener("touchstart", handleScrollStart);
    currentRef?.addEventListener("touchend", handleScrollEnd);

    return () => {
      currentRef?.removeEventListener("touchstart", handleScrollStart);
      currentRef?.removeEventListener("touchend", handleScrollEnd);
    };
  }, []);

  useEffect(() => {
    const onScrollDetect = () => {
      if (scrollTimeout.current) return;

      scrollTimeout.current = setTimeout(() => {
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = null;
      }, autoScrollTimeValue);
    };

    const currentRef = scrollRef.current;
    currentRef?.addEventListener("scroll", onScrollDetect);

    return () => {
      scrollTimeout.current && clearTimeout(scrollTimeout.current);
      currentRef?.removeEventListener("scroll", onScrollDetect);
    };
  }, []);

  useEffect(() => {
    if (!isTyping) {
      clearInterval(intervalId.current);

      afterTypingTimeout.current = setTimeout(() => {
        scrollToBottom();
      }, 100);

      return () => {
        if (afterTypingTimeout.current) {
          clearTimeout(afterTypingTimeout.current);
        }
      };
    }

    intervalId.current = setInterval(() => {
      if (blockScrollBottom.current) return;

      if (!scrollRef.current) return;

      if (scrollTimeout.current) return;

      const scrollBottom = getScrollBottom(scrollRef.current);

      if (scrollBottom <= maxAutoScrollValue) {
        scrollToBottom();
      }
    }, autoScrollTimeValue);

    return () => clearInterval(intervalId.current);
  }, [isTyping, scrollToBottom]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;

      if (getScrollBottom(scrollRef.current) > maxAutoScrollValue) {
        setShowScrollDown(true);
        return;
      }
      setShowScrollDown(false);
    };

    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return { scrollRef, scrollToBottom, showScrollDown };
}
