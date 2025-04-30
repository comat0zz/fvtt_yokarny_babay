/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {YokarnyActorSheet}
 */
export class YokarnyActorSheet extends ActorSheet {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["yokarny_babay", "sheet", "actor"],
            template: `${game.system_path}/templates/actor-sheet.hbs`,
            width: 900,
            height: 665,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "abilities"}]
        });
    }

    /* ---------------- Context Menu -------------- */
    skillMenu = [
        {
            name: game.i18n.localize("TYPES.Rolls.advantage"),
            icon: '',
            callback: element => {
                this._onRollAdvantage(element[0].dataset.id);
            }
        },
        {
            name: game.i18n.localize("TYPES.Rolls.hindrance"),
            icon: '',
            callback: element => {
                this._onRollHindrance(element[0].dataset.id);
            }
        }
    ];
    
    /** @override */
    async getData(options) {
        var sheetData = await super.getData(options);
        sheetData.editable = this.options.editable;
        sheetData.actor = sheetData.data;
        sheetData.budget = game.budget;
        sheetData.system = sheetData.document.system // project system data so that handlebars has the same name and value paths
        const skills = sheetData.system.skills;
        for (const [key, value] of Object.entries(skills)) {
            if(value < 0) {
                sheetData.system.skills[key] = 0;
            }else if(value > 3) {
                sheetData.system.skills[key] = 3;
            }else {
                sheetData.system.skills[key] = value;
            }
            
        }

        console.log(sheetData)
        return sheetData;
    }

    /** @override */
	activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        html.find('.yokarny-wounds').click(evt => this._onActorWoundsUp(evt));
        html.find('.yokarny-wounds').contextmenu(evt => this._onActorWoundsDown(evt));
        html.find('.yokarny-skills-table input').keyup(evt => this._onMaskInputNumber(evt));
        html.find('.yokarny-skill-label').click(evt => this._onRollSkill(evt));
        new ContextMenu(html, '.yokarny-skill-label', this.skillMenu);
        html.find('.yokarny-rating-number').keyup(evt => this._onBudgetEdit(evt));
    }

    async _renderBudget(num = 1) {
        if(num > 1){
            game.budget = num;
        }else{
            game.budget = parseInt(game.budget)+1;
        }
        
        game.actors.forEach((actor) => actor.render(true));
    }

    async _onBudgetEdit(evt) {
        evt.preventDefault();
        const inp_val = evt.target.value;
        this._renderBudget(inp_val);
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
        
        const template = await renderTemplate(`${game.system_path}/templates/dices-roll.hbs`, {
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
        
        const template = await renderTemplate(`${game.system_path}/templates/dices-roll.hbs`, {
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

    async _onRollSkill(evt) {
        evt.preventDefault();
        const skill = $(evt.currentTarget).attr('data-id');
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
        const template = await renderTemplate(`${game.system_path}/templates/dices-roll.hbs`, {
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

    async _onMaskInputNumber(evt) {
        evt.preventDefault();
        const inp_val = evt.target.value;
        const inp_name = evt.target.name;
        if(inp_val < 0) {
            this.actor.update({ [inp_name]: 0 })
        }else if(inp_val > 3){
            this.actor.update({ [inp_name]: 3 })
        }else{
            this.actor.update({ [inp_name]: inp_val })
        }        
    }

    async _onActorWoundsUp(evt) {
        evt.preventDefault();
        const wound = this.actor.system.wounds;
        if(wound >= 4) {
            this.actor.update({ ['system.wounds']: 4 })
        }else{
            this.actor.update({ ['system.wounds']: wound + 1 })
        }
    }

    async _onActorWoundsDown(evt) {
        evt.preventDefault();
        const wound = this.actor.system.wounds;
        if(wound <= 0) {
            this.actor.update({ ['system.wounds']: 0 })
        }else{
            this.actor.update({ ['system.wounds']: wound - 1 })
        }
    }
}