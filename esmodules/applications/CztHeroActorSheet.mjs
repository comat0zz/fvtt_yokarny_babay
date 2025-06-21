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

        const generateButton = this.element.querySelectorAll(".yokarny-generate-button")
        generateButton.forEach((d) => d.addEventListener("click", this._onGenerate.bind(this)))

        const rollSkill = this.element.querySelectorAll(".yokarny-skill-label")
        rollSkill.forEach((d) => d.addEventListener("click", this._onRollSkill.bind(this)))

        const budgetEdit = this.element.querySelectorAll(".yokarny-rating-number")
        budgetEdit.forEach((d) => d.addEventListener("keyup", this._onBudgetEdit.bind(this)))
    }

    async _onBudgetEdit(event, target) {
        const inp_val = $(event.currentTarget).val();
        this._renderBudget(parseInt(inp_val));
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

        this._createContextMenu(this._menuSkillRollsContextOptions, ".yokarny-skill-label", {
            hookName: "menuSkillRollsContextOptions",
            fixed: true,
            parentClassHooks: false,
        });
    }

    _getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _getRandomText(data) {
        const lines = data[0].collections.results._source;
        const lines_len = lines.length - 1;
        const lines_rand = this._getRandomInt(0, lines_len);
        return lines[lines_rand].description;
    }

    async _onGenerate(event, target) {
        const packs = await game.packs.get(game.system.id + '.generates').getDocuments({ _id__in: [
            "78DV08JX0ly1qkUD", // Имена
            "9aRWCukXb3Bf2kel", // Реквизит
            "OxwmnB7IizaNaSgJ", // Трюки
            "aUpOYf5yqPvBR8Ip", // Прошлое
            "k830fDfmrdv3MeQZ" // Недостатки
        ] });
        let actor_gen = {}

        if($('.yokarny-gen-chkbox .gen-name').is(':checked')) {
            const pack_names = await packs.filter(e => e._id === "78DV08JX0ly1qkUD");
            const name = this._getRandomText(pack_names);
            actor_gen["name"] = name;
        }
        
        if($('.yokarny-gen-chkbox .gen-skills').is(':checked')) {
            let skills = {
                "muscles": 0,
                "stuntman": 0,
                "savvy": 0,
                "heroism": 0
            }
            let turnSkills = ["muscles", "stuntman", "savvy", "heroism"];
            const limit_point = 3;
            let points = 6;
            while(points > 0) {
                let turn_len = turnSkills.length - 1;
                let turn_index = this._getRandomInt(0, turn_len);
                let curr_key = turnSkills[turn_index];
                let skill = skills[curr_key]
                if(skill == limit_point) {
                    turnSkills = turnSkills.filter((sk) => sk !== skill);
                }else{
                    skills[curr_key] += 1;
                    points -= 1;
                }
            }

            actor_gen["system.skills.muscles"] = skills["muscles"];
            actor_gen["system.skills.stuntman"] = skills["stuntman"];
            actor_gen["system.skills.savvy"] = skills["savvy"];
            actor_gen["system.skills.heroism"] = skills["heroism"];
        }
        
        if($('.yokarny-gen-chkbox .gen-history').is(':checked')) {
            const pack_history = await packs.filter(e => e._id === "aUpOYf5yqPvBR8Ip");
            const history = this._getRandomText(pack_history);
            actor_gen["system.history"] = history;
        }

        if($('.yokarny-gen-chkbox .gen-trick').is(':checked')) {
            const pack_trick = await packs.filter(e => e._id === "OxwmnB7IizaNaSgJ");
            const trick = this._getRandomText(pack_trick);
            actor_gen["system.trick"] = trick;
        }

        if($('.yokarny-gen-chkbox .gen-requisite').is(':checked')) {
            const pack_requisite = await packs.filter(e => e._id === "9aRWCukXb3Bf2kel");
            const requisite = this._getRandomText(pack_requisite);
            actor_gen["system.requisite"] = requisite;
        }
        if($('.yokarny-gen-chkbox .gen-flaw').is(':checked')) {
            const pack_flaw = await packs.filter(e => e._id === "k830fDfmrdv3MeQZ");
            const flaw = this._getRandomText(pack_flaw);
            actor_gen["system.flaw"] = flaw;
        }
        
        this.actor.update(actor_gen);
    }

    /**
     * Context menu entries for power rolls
     * @returns {ContextMenuEntry}
     */
    _menuSkillRollsContextOptions() {
        return [
            {
                name: game.i18n.localize("TYPES.Rolls.advantage"),
                icon: '',
                callback: element => {
                    const Id = $(element).data("id");
                    this._onRollAdvantage(Id);
                }
            },
            {
                name: game.i18n.localize("TYPES.Rolls.hindrance"),
                icon: '',
                callback: element => {
                    const Id = $(element).data("id");
                    this._onRollHindrance(Id);
                }
            }
        ];
    };

    async _renderBudget(num = 1) {
        game.budget = parseInt(num);
        game.actors.forEach((actor) => actor.render(true));
    }

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
        const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/chats/dices-roll.hbs`, {
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
        
        const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/chats/dices-roll.hbs`, {
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
        
        const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/chats/dices-roll.hbs`, {
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