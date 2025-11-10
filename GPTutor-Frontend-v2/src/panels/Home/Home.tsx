import { FC } from "react";
import { NavIdProps, Panel, PanelHeader } from "@vkontakte/vkui";
import { HeroSection } from "./HeroSection";
import { StepsSection } from "./StepsSection";
import { ModelsCard } from "./ModelsCard";

export interface HomeProps extends NavIdProps {}

export const Home: FC<HomeProps> = ({ id }) => {
  return (
    <Panel id={id}>
      <PanelHeader>LLM API</PanelHeader>
      <HeroSection />
      <StepsSection />
      <ModelsCard />
    </Panel>
  );
};


