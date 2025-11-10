import React, { useState } from "react";
import {
  Button,
  classNames,
  Div,
  FixedLayout,
  Separator,
  Tabs,
  TabsItem,
} from "@vkontakte/vkui";

import TabbarApp from "$/TabbarApp";

import classes from "./AppContainer.module.css";
import { log } from "@craco/craco/dist/lib/logger";

interface IProps {
  withoutTabbar?: boolean;
  className?: string;
  containerRef?: React.LegacyRef<HTMLDivElement>;
  children?: React.ReactNode;
  headerChildren: React.ReactNode;
  style?: React.CSSProperties;
  maxHeight?: boolean;
  isSecondary?: boolean;
  childrenWithHeight?: (height: string, offset: number) => JSX.Element;
  fixedBottomContent?: React.ReactNode;
}

function AppContainer({
  className,
  withoutTabbar,
  containerRef,
  children,
  headerChildren,
  style,
  maxHeight,
  isSecondary,
  childrenWithHeight,
  fixedBottomContent,
}: IProps) {
  const [headerElem, setHeaderElem] = useState<HTMLDivElement>();
  const [tabbarElem, setTabbarElem] = useState<HTMLDivElement>();
  const [fixedBottom, setFixedElem] = useState<HTMLDivElement>();

  const offsetHeightHeader = headerElem?.offsetHeight || 0;
  const offsetHeightTabbar = tabbarElem?.offsetHeight || 0;
  const offsetHeightFixedBottom = fixedBottom?.offsetHeight || 0;

  const offset =
    offsetHeightHeader + offsetHeightTabbar + offsetHeightFixedBottom;

  const height = `calc(100vh - ${offset}px)`;

  return (
    <>
      {headerChildren && <div ref={setHeaderElem as any}>{headerChildren}</div>}
      <div
        ref={containerRef}
        className={classNames(classes.container, className, {
          [classes.secondary]: isSecondary,
        })}
        style={{
          marginBottom: `${offsetHeightTabbar + offsetHeightFixedBottom}px`,
          minHeight: height,
          height: "100%",
          ...(maxHeight ? { maxHeight: height } : {}),
          ...style,
        }}
      >
        {childrenWithHeight ? childrenWithHeight(height, offset) : children}
      </div>
      {fixedBottomContent && (
        <FixedLayout
          style={{ bottom: offsetHeightTabbar }}
          getRootRef={setFixedElem as any}
          filled
          vertical="bottom"
        >
          <Separator wide />
          {fixedBottomContent}
        </FixedLayout>
      )}
      {!withoutTabbar && <TabbarApp setRef={setTabbarElem} />}
    </>
  );
}

export default AppContainer;
