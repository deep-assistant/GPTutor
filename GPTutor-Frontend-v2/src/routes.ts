import {
  createHashRouter,
  createModal,
  createPanel,
  createRoot,
  createView,
  RoutesConfig,
} from '@vkontakte/vk-mini-apps-router';

export const DEFAULT_ROOT = 'default_root';

export const DEFAULT_VIEW = 'default_view';

export const DEFAULT_VIEW_PANELS = {
  HOME: 'home',
  PERSIK: 'persik',
  PROFILE: 'profile',
  CHAT: 'chat',
  MODELS: 'models',
} as const;

export const MODALS = {
  TOP_UP_BALANCE: 'top-up-balance',
} as const;

export const routes = RoutesConfig.create([
  createRoot(DEFAULT_ROOT, [
    createView('home', [
      createPanel(DEFAULT_VIEW_PANELS.HOME, '/', []),
      createPanel(DEFAULT_VIEW_PANELS.PERSIK, `/${DEFAULT_VIEW_PANELS.PERSIK}`, []),
      createPanel(DEFAULT_VIEW_PANELS.MODELS, `/${DEFAULT_VIEW_PANELS.MODELS}`, []),
    ]),
    createView('profile', [
      createPanel(DEFAULT_VIEW_PANELS.PROFILE, `/${DEFAULT_VIEW_PANELS.PROFILE}`, [
        createModal(MODALS.TOP_UP_BALANCE, MODALS.TOP_UP_BALANCE),
      ]),
    ]),
    createView('chat', [
      createPanel(DEFAULT_VIEW_PANELS.CHAT, `/${DEFAULT_VIEW_PANELS.CHAT}`, []),
    ]),
  ]),
]);

export const router = createHashRouter(routes.getRoutes());
