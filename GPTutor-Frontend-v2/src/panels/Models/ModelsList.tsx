import { FC } from "react";
import { Div, Spacing } from "@vkontakte/vkui";
import { ProcessedModel } from "../../api";
import { ModelCard } from "./ModelCard";

interface ModelsListProps {
  models: ProcessedModel[];
  onCopyModelId: (modelId: string) => void;
  onTryModel: (modelId: string) => void;
}

export const ModelsList: FC<ModelsListProps> = ({
  models,
  onCopyModelId,
  onTryModel,
}) => {
  return (
    <Div>
      {models.map((model, index) => (
        <div key={model.id}>
          <ModelCard
            model={model}
            onCopyModelId={onCopyModelId}
            onTryModel={onTryModel}
          />
          {index < models.length - 1 && <Spacing size={8} />}
        </div>
      ))}
    </Div>
  );
};