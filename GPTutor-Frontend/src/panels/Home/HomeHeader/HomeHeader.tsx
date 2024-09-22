import React from "react";
import { IconButton, Title } from "@vkontakte/vkui";
import { Icon28ServicesOutline } from "@vkontakte/icons";

import { useNavigationContext } from "$/NavigationContext";

import { AppPanelHeader } from "$/components/AppPanelHeader";
import { FullscreenButton } from "$/components/FullscreenButton";

import classes from "./HomeHeader.module.css";
import { appService } from "$/services/AppService";

function HomeHeader() {
  const { openApplicationInfo } = useNavigationContext();

  return (
    <AppPanelHeader
      before={
        <IconButton
          onClick={openApplicationInfo}
          className={classes.buttonService}
        >
          <Icon28ServicesOutline className={classes.iconService} />
        </IconButton>
      }
      after={<FullscreenButton />}
    >
      <div className={classes.wrapper}>
        <Title level="1" Component="h1">
          {appService.getGPTName()}
        </Title>
      </div>
    </AppPanelHeader>
  );
}

export default HomeHeader;
