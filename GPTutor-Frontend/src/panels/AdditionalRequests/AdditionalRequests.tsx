import React from "react";

import { AppPanelHeader } from "$/components/AppPanelHeader";
import {
  Button,
  Div,
  FixedLayout,
  Panel,
  PanelHeaderBack,
  PanelHeaderSubmit,
  Separator,
  Spacing,
  Title,
} from "@vkontakte/vkui";
import { AppContainer } from "$/components/AppContainer";
import { useNavigationContext } from "$/NavigationContext";
import { snackbarNotify } from "$/entity/notify";

import classes from "./AdditionalRequest.module.css";
import {
  Icon24AddOutline,
  Icon24DeleteOutline,
  Icon28MagicWandOutline,
  Icon28LightbulbOutline,
} from "@vkontakte/icons";
import { additionalRequests } from "$/entity/additionalRequest/AdditionalRequests";
import { AdditionalRequest } from "$/panels/AdditionalRequests/AdditionalRequest";

interface IProps {
  id: string;
}

function AdditionalRequests({ id }: IProps) {
  const { goBack, goToTopicSuggestions } = useNavigationContext();

  const onSubmit = () => {
    snackbarNotify.notify({
      type: "success",
      message: "Успешно изменено",
    });
    goBack();
  };

  return (
    <Panel id={id}>
      <AppContainer
        fixedBottomContent={
          <Div>
            <Button
              style={{ width: "100%" }}
              size="m"
              before={<Icon24AddOutline />}
              onClick={() =>
                additionalRequests.createRequest({
                  message: "",
                  title: "",
                  active: true,
                })
              }
            >
              Создать Сниппет
            </Button>
            <Spacing size={8} />
            <Button
              style={{ width: "100%" }}
              size="m"
              mode="secondary"
              before={<Icon28LightbulbOutline />}
              onClick={goToTopicSuggestions}
            >
              Предложить тему
            </Button>
          </Div>
        }
        withoutTabbar
        headerChildren={
          <AppPanelHeader
            before={<PanelHeaderBack onClick={goBack} />}
            after={<PanelHeaderSubmit onClick={onSubmit} />}
          >
            Сниппеты
          </AppPanelHeader>
        }
      >
        <div style={{ width: "100vw" }}>
          <Div>
            <Title Component="h1" className={classes.title}>
              Ваши сниппеты{" "}
              <Icon28MagicWandOutline
                width={32}
                height={32}
                className={classes.magicIcon}
              />
            </Title>
            <Spacing size={16} />
            <div className={classes.listContainer}>
              {[...additionalRequests.requests$.get()].map((request) => {
                return <AdditionalRequest request={request} key={request.id} />;
              })}
            </div>
          </Div>
        </div>
      </AppContainer>
    </Panel>
  );
}

export default AdditionalRequests;
