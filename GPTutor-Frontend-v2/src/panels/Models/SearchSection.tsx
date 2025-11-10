import { FC } from "react";
import { Button, Card, Div, Flex, Search, Text } from "@vkontakte/vkui";
import {
  Icon12ArrowDown,
  Icon12ArrowUp,
  Icon20SortOutline,
} from "@vkontakte/icons";

interface SearchSectionProps {
  searchQuery: string;
  sortOrder: "asc" | "desc";
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSortToggle: () => void;
}

export const SearchSection: FC<SearchSectionProps> = ({
  searchQuery,
  sortOrder,
  onSearchChange,
  onSortToggle,
}) => {
  const getSortIcon = () => {
    if (sortOrder === "asc") {
      return <Icon12ArrowUp />;
    }
    return <Icon12ArrowDown />;
  };

  const getSortText = () => {
    return sortOrder === "asc" ? "Дешевые сначала" : "Дорогие сначала";
  };

  return (
    <>
      <Search
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Найти модель по названию..."
      />
      <Div>
        <Card mode="outline" style={{ padding: "12px 16px" }}>
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="s">
              <Icon20SortOutline
                style={{
                  color: "var(--vkui--color_icon_secondary)",
                }}
              />
              <Text
                weight="2"
                style={{
                  color: "var(--vkui--color_text_primary)",
                  fontSize: "15px",
                }}
              >
                Цена
              </Text>
            </Flex>

            <Button
              mode="tertiary"
              size="s"
              onClick={onSortToggle}
              before={getSortIcon()}
              style={{
                color: "var(--vkui--color_text_accent)",
                fontWeight: 500,
              }}
            >
              {getSortText()}
            </Button>
          </Flex>
        </Card>
      </Div>
    </>
  );
};
