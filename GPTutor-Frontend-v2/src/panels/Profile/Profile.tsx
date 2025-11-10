import { FC, useEffect } from "react";
import {
  NavIdProps,
  Panel,
  PanelHeader,
  Placeholder,
  ScreenSpinner,
} from "@vkontakte/vkui";
import { useProfileViewModel } from "../../viewModels/ProfileViewModel";
import { BalanceSection } from "./BalanceSection";
import { ApiKeySection } from "./ApiKeySection";
import { CodeExamplesSection } from "./CodeExamplesSection";
import "../../styles/prism.css";
import { observer } from "mobx-react-lite";

export interface ProfileProps extends NavIdProps {}

export const Profile: FC<ProfileProps> = observer(({ id }) => {
  const {
    profile,
    vkData,
    loading,
    updatingToken,
    activeCodeExample,
    setActiveCodeExample,
    loadProfile,
    updateToken,
  } = useProfileViewModel();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <Panel id={id}>
        <PanelHeader>Профиль</PanelHeader>
        <Placeholder>
          <ScreenSpinner />
        </Placeholder>
      </Panel>
    );
  }

  if (!profile || !vkData) {
    return (
      <Panel id={id}>
        <PanelHeader>Профиль</PanelHeader>
        <Placeholder>Не удалось загрузить данные профиля</Placeholder>
      </Panel>
    );
  }

  return (
    <Panel id={id}>
      <PanelHeader>Профиль</PanelHeader>

      <BalanceSection balance={profile.balance} onReload={loadProfile} />

      <ApiKeySection
        apiKey={profile.apiKey}
        updatingToken={updatingToken}
        onUpdateToken={updateToken}
      />

      <CodeExamplesSection
        apiKey={profile.apiKey}
        activeCodeExample={activeCodeExample}
        onCodeExampleChange={setActiveCodeExample}
      />
    </Panel>
  );
});
