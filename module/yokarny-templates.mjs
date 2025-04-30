/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {

  // Define template paths to load
  const templatePaths = [

    // Actor Sheet
    `${game.system_path}/templates/actor-sheet.hbs`,
    `${game.system_path}/templates/dices-roll.hbs`,
  ];

  // Load the template parts
  return loadTemplates(templatePaths);
};
