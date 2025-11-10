import { FC } from "react";
import {
  Button,
  Div,
  Flex,
  Group,
  IconButton,
  Link,
  Spacing,
  Title,
  useAdaptivityWithJSMediaQueries,
} from "@vkontakte/vkui";
import { Icon28MoneySendOutline, Icon24RefreshOutline } from "@vkontakte/icons";
import { useRouteNavigator } from "@vkontakte/vk-mini-apps-router";
import { createCodeHTML } from "../../utils/codeFormatter";
import { userViewModel } from "../../viewModels/UserViewModel";
import { CopyButton } from "../../components";
import { MODALS } from "../../routes";
import { observer } from "mobx-react-lite";

interface BalanceSectionProps {
  balance: number;
  onReload?: () => void;
}

export const BalanceSection: FC<BalanceSectionProps> = observer(
  ({ balance, onReload }) => {
    const routeNavigator = useRouteNavigator();
    const { isDesktop } = useAdaptivityWithJSMediaQueries();

    const handleTopUp = () => {
      routeNavigator.showModal(MODALS.TOP_UP_BALANCE);
    };

    return (
      <Group>
        <Div>
          <Title level="3">Профиль</Title>
          <Spacing size={12} />
          <Flex
            align="center"
            style={{ flexWrap: "nowrap" }}
            wrap="nowrap"
            gap={6}
          >
            <div
              style={{ width: "100%", fontWeight: 700 }}
              className="code-block"
              dangerouslySetInnerHTML={{
                __html: createCodeHTML(
                  `ID: ${userViewModel.getUserId()}`,
                  "python"
                ),
              }}
            />
            <CopyButton
              textToCopy={String(userViewModel.getUserId())}
              size={24}
            />
          </Flex>

          {isDesktop && (
            <>
              <Spacing size={12} />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  background: "var(--vkui--color_background_secondary)",
                  borderRadius: "8px",
                }}
              >
                <Icon28MoneySendOutline />
                <div style={{ flex: 1 }}>
                  <Title level="1">{balance.toFixed(4)}₽</Title>
                  <div style={{ color: "#9c9c9c", fontSize: "14px" }}>
                    Доступно для использования
                  </div>
                </div>
                {onReload && (
                  <IconButton onClick={onReload}>
                    <Icon24RefreshOutline />
                  </IconButton>
                )}
              </div>
              <Spacing size={16} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Button
                  size="m"
                  mode="outline"
                  style={{ width: "100%" }}
                  onClick={handleTopUp}
                >
                  Пополнить баланс
                </Button>
              </div>
              <Spacing size={8} />
              <div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  <div>
                    <Link
                      href="https://telegra.ph/Polzovatelskoe-soglashenie-Giga-Router-10-25"
                      target="_blank"
                      style={{ fontSize: "14px" }}
                    >
                      Пользовательское соглашение
                    </Link>
                    ,
                  </div>
                  <Link
                    href="https://telegra.ph/Politika-konfidencialnosti-Giga-Router-10-25"
                    target="_blank"
                    style={{ fontSize: "14px" }}
                  >
                    Политика конфиденциальности
                  </Link>
                </div>
                <span style={{ color: "#9c9c9c", fontSize: "14px" }}>
                  ИНН:{" "}
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--vkui--color_text_primary)",
                    }}
                  >
                    027701131663
                  </span>
                </span>
              </div>
            </>
          )}
        </Div>
      </Group>
    );
  }
);
