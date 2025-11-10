import { FC, ReactNode } from "react";
import {
  Button,
  Card,
  Counter,
  DisplayTitle,
  Div,
  Flex,
  Spacing,
} from "@vkontakte/vkui";

interface StepCardProps {
  stepNumber: string;
  title: string;
  icon: ReactNode;
  description: ReactNode;
  buttonText: string;
  buttonIcon: ReactNode;
  onButtonClick: () => void;
}

export const StepCard: FC<StepCardProps> = ({
  stepNumber,
  title,
  icon,
  description,
  buttonText,
  buttonIcon,
  onButtonClick,
}) => {
  return (
    <Card mode="shadow" style={{ minWidth: "320px" }}>
      <Div>
        <Flex align="center" gap={stepNumber === "3" ? 8 : 6}>
          <Counter
            mode="primary"
            style={{
              width: stepNumber === "3" ? 32 : 38,
              height: stepNumber === "3" ? 32 : 38,
              borderRadius: "50%",
            }}
          >
            <DisplayTitle level="2">{stepNumber}</DisplayTitle>
          </Counter>
          <DisplayTitle level="2">{title}</DisplayTitle>
        </Flex>
        <Spacing size={8} />
        <Flex align="center" gap={12}>
          {icon}
          <DisplayTitle level="2">—</DisplayTitle>
          {description}
        </Flex>
        <Spacing size={14} />
        <Button
          onClick={onButtonClick}
          mode="outline"
          size="m"
          after={buttonIcon}
          style={{ width: "100%" }}
        >
          {buttonText}
        </Button>
      </Div>
    </Card>
  );
};
