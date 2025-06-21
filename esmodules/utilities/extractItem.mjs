export const extractItem = async function(data) {
  const cmpnd_key = `Compendium.${game.system.id}.`;
  const cmpnd_len = cmpnd_key.length;
  const uuid = data.uuid;

  if(uuid.slice(0, cmpnd_len) === cmpnd_key) {
    const tmp = uuid.slice(cmpnd_len).split(".");
    const pack = game.packs.get(game.system.id + '.' + tmp[0]);
    return await pack.getDocument(tmp[1]);

  }else if(data.type == "Item"){
    var item_id = uuid.replace("Item.", "");
    return game.items.get(item_id);

  }else if(data.type == "Actor") {
    var actor_id = uuid.replace("Actor.", "");
    return game.actors.get(actor_id);
  }
};