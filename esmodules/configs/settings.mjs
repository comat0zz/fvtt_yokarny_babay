// https://foundryvtt.wiki/en/development/guides/handling-data
import { SYSTEM } from "./system.mjs";

export const registerSystemSettings = function() {

  game.settings.register(SYSTEM.id, 'isSystemDebug', {
    name: game.i18n.localize("CZT.Common.Debug.Label"),
    hint: game.i18n.localize("CZT.Common.Debug.Info"),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true
  });
  
};