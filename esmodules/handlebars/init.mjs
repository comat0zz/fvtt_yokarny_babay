import { registerHandlebarsShareHelpers } from "./share_helpers.mjs";
import { registerHandlebarsCommonHelpers } from "./common_helpers.mjs";
import { preloadHandlebarsTemplates } from "./templates.mjs";

export const initializeHandlebars = () => {
  registerHandlebarsShareHelpers();
  registerHandlebarsCommonHelpers();
  preloadHandlebarsTemplates();
};