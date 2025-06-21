import { SYSTEM } from "../configs/system.mjs";

// Список в отдельном месте, ибо этот момент хочу сделать один раз
import { TemplatesList } from './template_list.mjs';

/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
    // Define template paths to load
    let templatePaths = {};

    for (const [group, tpls] of Object.entries(TemplatesList)) {
        tpls.forEach(el => {
          const key = el.split(/(.*)\.hbs/)[1].replaceAll("/", '-');
          templatePaths[key] = `${SYSTEM.template_path}/${el}`;
        })
      };
    
    // Load the template parts
    return foundry.applications.handlebars.loadTemplates(templatePaths);
};