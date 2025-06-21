// https://foundryvtt.wiki/en/development/api/DataModel
export default class CztHeroModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = {};

        schema.description = new fields.HTMLField({ required: true, textSearch: true });
        schema.notes = new fields.HTMLField({ required: true, textSearch: true });

        schema.skills = new fields.SchemaField({
            muscles: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
            stuntman: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
            savvy: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 }),
            heroism:new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 3 })
        });

        schema.wounds = new fields.NumberField({ ...requiredInteger, initial: 0, min: 0, max: 4 })

        schema.history = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.trick = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.requisite = new fields.StringField({ required: false, nullable: false, initial: "" });
        schema.flaw = new fields.StringField({ required: false, nullable: false, initial: "" });

        return schema;
    }

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();
        let updates = {};

        if (Object.keys(updates).length > 0) {
            this.parent.update(updates);
        }
    }
}