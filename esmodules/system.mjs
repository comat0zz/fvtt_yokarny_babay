import { SYSTEM } from "./configs/system.mjs";
globalThis.SYSTEM = SYSTEM; // Expose the SYSTEM object to the global scope

import { registerSystemSettings } from "./configs/settings.mjs";
import { initializeHandlebars } from "./handlebars/init.mjs";

// Import modules
import * as CztUtility from "./utilities/_module.mjs";
import * as applications from "./applications/_module.mjs";
import * as documents from "./documents/_module.mjs";
import * as models from "./models/_module.mjs";

import { handleSocketEvent } from "./socket.mjs";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("init", async function() {
  registerSystemSettings();
  
  globalThis[SYSTEM.id] = game[SYSTEM.id] = Object.assign(game.system, globalThis.SYSTEM);

  game.logger = new CztUtility.Log(game.settings.get(SYSTEM.id,'isSystemDebug'));
  
  // Expose the system API
  game.system.api = {
    applications,
    models,
    documents,
  }

  game.budget = 0;

  CONFIG.Actor.documentClass = documents.CztHeroActor;
  CONFIG.Actor.dataModels = {
    hero: models.CztHeroModel
  };

  CONFIG.Item.documentClass = documents.CztCityItem;
  CONFIG.Item.dataModels = {
    city: models.CztCityModel
  }

  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet(SYSTEM.id, applications.CztHeroActorSheet, { 
    types: ["hero"], 
    makeDefault: true,
    label: "TYPES.Actor.hero"
  });

  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet)
  foundry.documents.collections.Items.registerSheet(SYSTEM.id, applications.CztCityItemSheet, { 
    types: ["city"], 
    makeDefault: true,
    label: "TYPES.Item.city"
  });

  // Activate socket handler
  game.socket.on(`system.${SYSTEM.id}`, handleSocketEvent)

  
  initializeHandlebars();

  game.logger.info(`${SYSTEM.id} | System Initialized`);
});

