/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {YokarnyActorSheet}
 */
export class YokarnyActorSheet extends ActorSheet {
    /** @override */


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
	activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

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

    
}