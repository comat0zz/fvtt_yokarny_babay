

import { YB } from "./config.js";
import { registerSystemSettings } from "./settings.js";
import { preloadHandlebarsTemplates } from "./yokarny-templates.js";
import { YokarnyActor } from "./yokarny-actor.js";
import { YokarnyActorSheet } from "./yokarny-actor-sheet.js";

CONFIG.YB = YB;

CONFIG.Actor.documentClass = YokarnyActor;

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */
Hooks.once("init", async function() {
  console.log(`Initializing Yokarny Babay! System`);

  // Register System Settings
  registerSystemSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("yokarny", YokarnyActorSheet, { types: ["character"], makeDefault: true });


  preloadHandlebarsTemplates();

}