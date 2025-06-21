/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {CztActorSheet}
 */

import { SYSTEM } from "../configs/system.mjs";
import * as CztUtility from "../utilities/_module.mjs";
const { api, sheets } = foundry.applications;

export default class CztHeroActorSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
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
            width: 1036,
            height: 850
        },
        classes: [ SYSTEM.id, "sheet", "actor", "yokarny_babay", "actor-sheet" ],
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
        abilities: {
            template: `${SYSTEM.template_path}/sheets/actors/hero-tab-sheet.hbs`
        },
        description: {
            template: `${SYSTEM.template_path}/sheets/actors/notes-tab-sheet.hbs`
        },
        generate: {
            template: `${SYSTEM.template_path}/sheets/actors/generate-tab-sheet.hbs`
        }
    }


    /* -------------------------------------------- */

    /** @override */
    async _prepareContext() {

        // Default tab for first time it's rendered this session
        if (!this.tabGroups.primary){
            this.tabGroups.primary = 'abilities';
        }

        var context = {
          fields: this.document.schema.fields,
          systemFields: this.document.system.schema.fields,
          actor: this.document,
          system: this.document.system,
          source: this.document.toObject(),
          enrichedDescription: await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.document.system.description, { async: true }),
          isEditMode: this.isEditMode,
          isPlayMode: this.isPlayMode,
          isEditable: this.isEditable,
          budget: game.budget,

          tabs: {
                abilities: {
                    cssClass: this.tabGroups.primary === 'abilities' ? 'active' : '',
                    group: 'primary',
                    id: 'abilities',
                    icon: '',
                    label: 'SETTINGS.tabs.abilities',
                },
                description: {
                    cssClass: this.tabGroups.primary === 'description' ? 'active' : '',
                    group: 'primary',
                    id: 'description',
                    icon: '',
                    label: 'SETTINGS.tabs.description',
                },
                generate: {
                    cssClass: this.tabGroups.primary === 'generate' ? 'active' : '',
                    group: 'primary',
                    id: 'generate',
                    icon: '',
                    label: 'SETTINGS.tabs.generate',
                },
            }
        }

        const skills = this.document.system.skills;
        for (const [key, value] of Object.entries(skills)) {
            if(value < 0) {
                context.system.skills[key] = 0;
            }else if(value > 3) {
                context.system.skills[key] = 3;
            }else {
                context.system.skills[key] = value;
            }
        }

        game.logger.log(context)
        return context
    }

    /** @override */
    _onRender(context, options) {
        super._onRender((context, options));

        const wounds = this.element.querySelectorAll(".yokarny-wounds");
        wounds.forEach((d) => d.addEventListener("click", this._onActorWoundsUp.bind(this)));
        const wounds2 = this.element.querySelectorAll(".yokarny-wounds")
        wounds2.forEach((d) => d.addEventListener("contextmenu", this._onActorWoundsDown.bind(this)))
    }

    async _onActorWoundsUp(event, target) {
        const wound = this.document.system.wounds;
        if(wound >= 4) {
            this.actor.update({ ['system.wounds']: 4 })
        }else{
            this.actor.update({ ['system.wounds']: wound + 1 })
        }
    }

    async _onActorWoundsDown(event, target) {
        const wound = this.document.system.wounds;
        if(wound <= 0) {
            this.actor.update({ ['system.wounds']: 0 })
        }else{
            this.actor.update({ ['system.wounds']: wound - 1 })
        }
    }

    /** @inheritdoc */
    async _onFirstRender(context, options) {
        await super._onFirstRender(context, options);

        this._createContextMenu(this._moveListContextOptions, ".tab-move-list .move-item", {
            hookName: "getMoveListContextOptions",
            fixed: true,
            parentClassHooks: false,
        });
    }

    /**
     * Context menu entries for power rolls
     * @returns {ContextMenuEntry}
     */
    _moveListContextOptions() {
        return [
            {
                name: game.i18n.localize("CZT.Rolls.Simple"),
                icon: '',
                condition: (el) => (el.dataset.type == 'base'),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._rollDicesSimple(moveId);
                }
            },
            {
                name: game.i18n.localize("CZT.Rolls.Advance"),
                icon: '',
                condition: (el) => (el.dataset.type == 'base'),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._rollDicesSimple(moveId, true);
                }
            },
            {
                name: game.i18n.localize("CZT.Moves.EnableDisable"),
                icon: '',
                condition: (el) => (el.dataset.type == 'uniq'),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._moveEnable(moveId);
                }
            },
            {
                name: game.i18n.localize("CZT.Moves.Navs.examples"),
                icon: '',
                condition: (el) => (el.dataset.type == 'base'),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._showExamples(moveId);
                }
            },
            {
                name: game.i18n.localize("CZT.Moves.AddContact"),
                icon: '',
                condition: (el) => (el.dataset.type == 'uniq' && el.dataset.relation),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._AddContact(moveId);
                }
            },
            {
                name: game.i18n.localize("CZT.Moves.DellContact"),
                icon: '',
                condition: (el) => (el.dataset.type == 'uniq' && el.dataset.relation),
                callback: element => {
                    const moveId = $(element).data("moveid");
                    this._DellContact(moveId);
                }
            }
        ];
    };

    /** @override */
    async _preparePartContext(partId, context) {
        switch (partId) {
            case 'abilities':
            case 'description':
            case 'generate':
                context.tab = context.tabs[partId];
                break;
            default:
        }
      return context;
    }
    
    async _rollDicesSimple(moveId, isHelp = false) {

    }

    async _onRollSkill(event, target) {
        const skill = $(event.currentTarget).attr('data-id');
        const skill_val = this.actor.system.skills[skill];
        const skill_name = game.i18n.localize(`TYPES.Actor.skills.${skill}.label`);
        const formula = `2d6+${skill_val}`;
        let roll = await new Roll(formula).evaluate();
        const terms = roll.terms[0].results;
        const dice_1 = terms[0].result;
        const dice_2 = terms[1].result;
        let isCritical = false;
        if(dice_1 == dice_2) {
            isCritical = true;
        }
        const template = await renderTemplate(`${SYSTEM.template_path}/chats/dices-roll.hbs`, {
            formula: formula,
            result: roll.result,
            total: roll.total,
            skill_val: skill_val,
            skill_name: skill_name,
            isCritical: isCritical,
            dice_1: dice_1,
            dice_2: dice_2        
        });
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: template
        });
    }

    // Из трех убрать наименьшее
    async _onRollAdvantage(skill) {
        const skill_val = this.actor.system.skills[skill];
        const skill_name = game.i18n.localize(`TYPES.Actor.skills.${skill}.label`);
        const formula = `3d6+${skill_val}`;
        let roll = await new Roll(formula).evaluate();
        const terms = roll.terms[0].results;
        let dice_1 = terms[0].result;
        let dice_2 = terms[1].result;
        let dice_3 = terms[2].result;
        let isCritical = false;
        let arrValues = [dice_1, dice_2, dice_3]
        const min = Math.min.apply(null, arrValues);
        let filteredNumbers = arrValues.filter((number) => number !== min);
        // ух, тут говнокод ща будет :)
        // может быть ситуация, когда выпало три одинаковых или два, 
        // в итоге выше уберет больше одного, 
        // а раз кубы убрало, значит надо дополнить, мы знаем какие - min
        while(filteredNumbers.length < 2) {
            filteredNumbers.push(min) 
        }
        // console.log(arrValues, min, filteredNumbers)
        // Раскидаем дайсы повторно
        dice_1 = filteredNumbers[0];
        dice_2 = filteredNumbers[1];
        dice_3 = min;
        // Собираем новый total 
        const total = dice_1 + dice_2 + skill_val;
        if(dice_1 == dice_2) {
            isCritical = true;
        }
        
        const template = await renderTemplate(`${SYSTEM.template_path}/chats/dices-roll.hbs`, {
            formula: formula,
            result: roll.result,
            total: total,
            skill_val: skill_val,
            skill_name: skill_name,
            isCritical: isCritical,
            dice_1: dice_1,
            dice_2: dice_2,
            dice_3: dice_3,
            advantage: true        
        });
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: template
        });
    }

    // Из трех убрать наибольшее
    async _onRollHindrance(skill) {
        this._renderBudget();
        const skill_val = this.actor.system.skills[skill];
        const skill_name = game.i18n.localize(`TYPES.Actor.skills.${skill}.label`);
        const formula = `3d6+${skill_val}`;
        let roll = await new Roll(formula).evaluate();
        const terms = roll.terms[0].results;
        let dice_1 = terms[0].result;
        let dice_2 = terms[1].result;
        let dice_3 = terms[2].result;
        let isCritical = false;
        let arrValues = [dice_1, dice_2, dice_3]
        const max = Math.max.apply(null, arrValues);
        let filteredNumbers = arrValues.filter((number) => number !== max);

        while(filteredNumbers.length < 2) {
            filteredNumbers.push(max) 
        }
        // console.log(arrValues, min, filteredNumbers)
        // Раскидаем дайсы повторно
        dice_1 = filteredNumbers[0];
        dice_2 = filteredNumbers[1];
        dice_3 = max;
        // Собираем новый total 
        const total = dice_1 + dice_2 + skill_val;
        if(dice_1 == dice_2) {
            isCritical = true;
        }
        
        const template = await renderTemplate(`${SYSTEM.template_path}/chats/dices-roll.hbs`, {
            formula: formula,
            result: roll.result,
            total: total,
            skill_val: skill_val,
            skill_name: skill_name,
            isCritical: isCritical,
            dice_1: dice_1,
            dice_2: dice_2,
            dice_3: dice_3,
            hindrance: true        
        });
        ChatMessage.create({
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: template
        });
    }


}