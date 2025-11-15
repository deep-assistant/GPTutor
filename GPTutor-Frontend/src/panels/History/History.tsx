import React, { useEffect, useState } from "react";

import {
  Div,
  IconButton,
  Panel,
  PanelHeaderBack,
  Search,
  Spinner,
  Title,
} from "@vkontakte/vkui";
import { Icon28FilterOutline } from "@vkontakte/icons";

import { AppContainer } from "$/components/AppContainer";
import { useNavigationContext } from "$/NavigationContext";
import { HistoryList } from "$/panels/History/HistoryList";
import { useInfinityScroll } from "$/hooks/useInfinityScroll";
import { chatGpt } from "$/entity/GPT";
import { AppPanelHeader } from "$/components/AppPanelHeader";

import { HistoryDelete } from "./HistoryDelete";
import { HistoryFilter } from "./HistoryFilter";

import classes from "./History.module.css";
import useDebounce from "$/hooks/useDebounce";

interface IProps {
  id: string;
}

function History({ id }: IProps) {
  const [showFilter, setShowFilter] = useState(false);
  
  const pageNumber = chatGpt.history.pageNumber;
  const loading = chatGpt.history.getHistory$.loading.get();
  const hasNextPage = chatGpt.history.hasNextHistory$.get();

  const { goBack } = useNavigationContext();
  const setScrollableElement = useInfinityScroll({
    onLoadMore: () => chatGpt.history.nextLoadHistory(),
    hasNextPage,
    loading,
  });

  const onSearchValue = useDebounce(chatGpt.history.search);

  useEffect(() => {
    chatGpt.history.loadHistory();
  }, []);

  return (
    <Panel id={id}>
      <AppContainer
        containerRef={setScrollableElement}
        className={classes.mainContainer}
        headerChildren={
          <AppPanelHeader
            before={<PanelHeaderBack onClick={goBack} />}
            after={
              <>
                <IconButton
                  onClick={() => setShowFilter(!showFilter)}
                  aria-label="Открыть фильтры"
                >
                  <Icon28FilterOutline />
                </IconButton>
                <HistoryDelete />
              </>
            }
          >
            <Title level="1" Component="h1">
              История
            </Title>
          </AppPanelHeader>
        }
      >
        <HistoryFilter 
          isOpen={showFilter}
          onClose={() => setShowFilter(false)}
        />
        <Search
          placeholder="Поиск по сообщениям"
          value={chatGpt.history.searchValue$.get()}
          onChange={(event) => {
            chatGpt.history.setSearchValue(event.target.value);
            onSearchValue();
          }}
        />
        <Div style={{ paddingTop: 0 }}>
          <HistoryList />
          {loading && (
            <div
              className={classes.loading}
              style={{ paddingTop: pageNumber > 0 ? 15 : 70 }}
            >
              <Spinner size="large" />
            </div>
          )}
        </Div>
      </AppContainer>
    </Panel>
  );
}

export default History;
