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
        html.find('.yokarny-generate input[type=button]').click(evt => this._onGenerate(evt));
    }

    async _renderBudget(num = 1) {
        if(num > 1){
            game.budget = num;
        }else{
            game.budget = parseInt(game.budget)+1;
        }
        
        game.actors.forEach((actor) => actor.render(true));
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
        return lines[lines_rand].text;
    }

    async _onGenerate(evt) {
        evt.preventDefault();
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
            //$('.yokarny-gen-chkbox td.gen-name-result')[0].textContent = name;
            //$('textarea[name=name]').val(name);
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
            //const muscles = game.i18n.localize(`TYPES.Actor.skills.muscles.label`); 
            //const stuntman = game.i18n.localize(`TYPES.Actor.skills.stuntman.label`); 
            //const savvy = game.i18n.localize(`TYPES.Actor.skills.savvy.label`); 
            //const heroism = game.i18n.localize(`TYPES.Actor.skills.heroism.label`); 
            //const skill_text = `${muscles}: ${skills["muscles"]}, ${stuntman}: ${skills["stuntman"]}, ${savvy}: ${skills["savvy"]}, ${heroism}: ${skills["heroism"]}`;
            //$('.yokarny-gen-chkbox td.gen-skills-result')[0].innerHTML = skill_text;
            //$('textarea[name="system.skills.muscles"]').val(skills["muscles"]);
            //$('textarea[name="system.skills.stuntman"]').val(skills["stuntman"]);
            //$('textarea[name="system.skills.savvy"]').val(skills["savvy"]);
            //$('textarea[name="system.skills.heroism"]').val(skills["heroism"]);

            actor_gen["system.skills.muscles"] = skills["muscles"];
            actor_gen["system.skills.stuntman"] = skills["stuntman"];
            actor_gen["system.skills.savvy"] = skills["savvy"];
            actor_gen["system.skills.heroism"] = skills["heroism"];
        }
        
        if($('.yokarny-gen-chkbox .gen-history').is(':checked')) {
            const pack_history = await packs.filter(e => e._id === "aUpOYf5yqPvBR8Ip");
            const history = this._getRandomText(pack_history);
            //$('.yokarny-gen-chkbox td.gen-history-result')[0].innerHTML = history;
            //$('textarea[name="system.history"]').val(history.replace(/<\/?[^>]+(>|$)/g, ""));
            actor_gen["system.history"] = history;
        }

        if($('.yokarny-gen-chkbox .gen-trick').is(':checked')) {
            const pack_trick = await packs.filter(e => e._id === "OxwmnB7IizaNaSgJ");
            const trick = this._getRandomText(pack_trick);
            //$('.yokarny-gen-chkbox td.gen-trick-result')[0].innerHTML = trick;
            //$('textarea[name="system.trick"]').val(trick.replace(/<\/?[^>]+(>|$)/g, ""));
            actor_gen["system.trick"] = trick;
        }

        if($('.yokarny-gen-chkbox .gen-requisite').is(':checked')) {
            const pack_requisite = await packs.filter(e => e._id === "9aRWCukXb3Bf2kel");
            const requisite = this._getRandomText(pack_requisite);
            //$('.yokarny-gen-chkbox td.gen-requisite-result')[0].innerHTML = requisite;
            //$('textarea[name="system.requisite"]').val(requisite.replace(/<\/?[^>]+(>|$)/g, ""));
            actor_gen["system.requisite"] = requisite;
        }
        if($('.yokarny-gen-chkbox .gen-flaw').is(':checked')) {
            const pack_flaw = await packs.filter(e => e._id === "k830fDfmrdv3MeQZ");
            const flaw = this._getRandomText(pack_flaw);
            //$('.yokarny-gen-chkbox td.gen-flaw-result')[0].innerHTML = flaw;
            //$('textarea[name=""]').val(flaw.replace(/<\/?[^>]+(>|$)/g, ""));
            actor_gen["system.flaw"] = flaw;
        }
        
        this.actor.update(actor_gen);
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