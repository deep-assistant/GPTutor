import { useCallback, useEffect, useState } from "react";
import { ProcessedModel } from "../api";
import { ModelsService } from "../services/ModelsService";
import { chatViewModel } from "../panels/Chat/models";
import { useSnackbar } from "../hooks";

export interface ModelsViewModelState {
  models: ProcessedModel[];
  filteredModels: ProcessedModel[];
  searchQuery: string;
  sortOrder: "asc" | "desc";
  loading: boolean;
}

export const useModelsViewModel = () => {
  const [state, setState] = useState<ModelsViewModelState>({
    models: [],
    filteredModels: [],
    searchQuery: "",
    sortOrder: "asc",
    loading: false,
  });
  const { showSuccess, showError } = useSnackbar();

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState((prev) => ({ ...prev, searchQuery }));
  }, []);

  const setSortOrder = useCallback((sortOrder: "asc" | "desc") => {
    setState((prev) => ({ ...prev, sortOrder }));
  }, []);

  const filterModels = useCallback((query: string) => {
    setState((prev) => {
      const filtered = ModelsService.filterModels(
        prev.models,
        query,
        prev.sortOrder
      );
      return {
        ...prev,
        filteredModels: filtered,
      };
    });
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchQuery(value);
      filterModels(value);
    },
    [filterModels, setSearchQuery]
  );

  const handleQuickSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      filterModels(query);
    },
    [filterModels, setSearchQuery]
  );

  const handleSortToggle = useCallback(() => {
    const newOrder = state.sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
  }, [state.sortOrder, setSortOrder]);

  const copyModelId = useCallback(async (modelId: string) => {
    const success = await ModelsService.copyModelId(modelId);

    if (success) {
      showSuccess(`ID скопирован: ${modelId}`);
    } else {
      showError("Не удалось скопировать");
    }
  }, []);

  const tryModel = useCallback((modelId: string) => {
    chatViewModel.setModel(modelId);
  }, []);

  const loadModels = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const models = await ModelsService.fetchModels();
      setState((prev) => ({
        ...prev,
        models,
        filteredModels: models,
        loading: false,
      }));
    } catch (error) {
      showError(
        `Ошибка загрузки моделей: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );

      setState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    filterModels(state.searchQuery);
  }, [state.sortOrder, filterModels, state.searchQuery]);

  return {
    ...state,
    handleSearchChange,
    handleQuickSearch,
    handleSortToggle,
    copyModelId,
    tryModel,
    loadModels,
  };
};
