/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {CztItemSheet}
 */

import { SYSTEM } from "../configs/system.mjs";
import * as CztUtility from "../utilities/_module.mjs";
const { api, sheets } = foundry.applications;

export default class CztCityItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
    /**
     * Different sheet modes.r
     * @enum {number}
     */
    static SHEET_MODES = { 
        EDIT: 0, 
        PLAY: 1 
    }
    
    constructor(options = {}) {
        super(options)
    }

    /** @override */
    static DEFAULT_OPTIONS = {
        tag: "form",
        position: {
            width: 600,
            height: 600,
        },
        classes: [ SYSTEM.id, "sheet", "city" ],
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        window: {
          resizable: true,
        }
    }

    /**
     * The current sheet mode.
     * @type {number}
     */
    _sheetMode = this.constructor.SHEET_MODES.PLAY
    
    /**
     * Is the sheet currently in 'Play' mode?
     * @type {boolean}
     */
    get isPlayMode() {
        return this._sheetMode === this.constructor.SHEET_MODES.PLAY
    }

    /**
     * Is the sheet currently in 'Edit' mode?
     * @type {boolean}
     */
    get isEditMode() {
        return this._sheetMode === this.constructor.SHEET_MODES.EDIT
    }

    /** @override */
    static PARTS = {
        tabs: {
            template: "templates/generic/tab-navigation.hbs",
        },
        cities: {
            template: `${SYSTEM.template_path}/sheets/items/cities-tab-sheet.hbs`,
            scrollable: [""]
        },
        notes: {
            template: `${SYSTEM.template_path}/sheets/items/notes-tab-sheet.hbs`,
            scrollable: [""]
        }
    }

    /* -------------------------------------------- */

    /** @override */
    async _prepareContext() {

        // Default tab for first time it's rendered this session
        if (!this.tabGroups.primary){
            this.tabGroups.primary = 'cities';
        }

        var context = {
            fields: this.document.schema.fields,
            systemFields: this.document.system.schema.fields,
            item: this.document,
            system: this.document.system,
            source: this.document.toObject(),
            isEditMode: this.isEditMode,
            isPlayMode: this.isPlayMode,
            isEditable: this.isEditable,

            enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true }),
            enrichedNotes: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.notes, { async: true }),

            tabs: {
                cities: {
                    cssClass: this.tabGroups.primary === 'cities' ? 'active' : '',
                    group: 'primary',
                    id: 'cities',
                    icon: '',
                    label: 'TYPES.Item.Navs.description',
                },
                notes: {
                    cssClass: this.tabGroups.primary === 'notes' ? 'active' : '',
                    group: 'primary',
                    id: 'notes',
                    icon: '',
                    label: 'TYPES.Item.Navs.notes',
                }
            }
        }

        game.logger.log(context)
        return context
    }

    /** @override */
    _onRender(context, options) {
        super._onRender((context, options))

    }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
        case 'cities':
        case 'notes':
          context.tab = context.tabs[partId];
          break;
        default:
      }
      return context;
  }
}