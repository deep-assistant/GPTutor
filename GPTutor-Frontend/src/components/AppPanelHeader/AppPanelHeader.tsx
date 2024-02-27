import React from "react";
import {
  classNames,
  PanelHeader,
  Platform,
  usePlatform,
} from "@vkontakte/vkui";

import classes from "./AppPanelHeader.module.css";
import { telegramService } from "$/services/TelegramService";

interface IProps {
  before?: React.ReactNode;
  after?: React.ReactNode;
  children: React.ReactNode;
}

function AppPanelHeader({ after, before, children }: IProps) {
  const platform = usePlatform();

  return (
    <PanelHeader
      className={classNames(classes.panelHeader, {
        [classes.panelHeaderVkApps]:
          platform === Platform.VKCOM || telegramService.hasTgInstance(),
      })}
      before={before}
    >
      <div className={classes.wrapper}>
        {children}
        <span className={classes.after}>{after}</span>
      </div>
    </PanelHeader>
  );
}

export default AppPanelHeader;
