// https://foundryvtt.wiki/en/development/api/DataModel
export default class CztCityModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = {};

        schema.notes = new fields.HTMLField({ required: true, textSearch: true });
        
        schema.formula = new fields.SchemaField({
            value: new fields.StringField({ required: false, nullable: false, initial: "" })
        });
        
        schema.description = new fields.StringField({ required: false });

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