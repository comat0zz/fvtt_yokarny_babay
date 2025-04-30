

import { YB } from "./config.mjs";
import { registerSystemSettings } from "./settings.mjs";
import { preloadHandlebarsTemplates } from "./yokarny-templates.mjs";
import { YokarnyActor } from "./yokarny-actor.mjs";
import { YokarnyActorSheet } from "./yokarny-actor-sheet.mjs";

CONFIG.YB = YB;

CONFIG.Actor.documentClass = YokarnyActor;



/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("init", async function() {
  console.log(`Initializing Yokarny Babay! System`);

  game.system_path = `systems/${game.system.id}`;
  game.budget = 0;
  // Register System Settings
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet(game.system.id, YokarnyActorSheet, { 
    types: ["character"], 
    makeDefault: true 
  });

  // if v1 <= v2 and v1 != 0
  Handlebars.registerHelper('ifltNoZero', function (v1, v2, options) {
    if (v1 >= v2 && v1 != 0) return options.fn(this);
    else return options.inverse(this);
  });

    // if v1 >= v2
  Handlebars.registerHelper('ifgt', function (v1, v2, options) {
    if (v1 >= v2) return options.fn(this);
    else return options.inverse(this);
  });
  preloadHandlebarsTemplates();

});