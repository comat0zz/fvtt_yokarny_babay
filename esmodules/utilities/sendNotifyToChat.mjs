import { SYSTEM } from "../configs/system.mjs";

const colors = {
  turquoise: '#00fee7',
  red: '#fe0000',
  green: '#04fe00',
  blue: '#000ffe',
  yellow: '#f6fe00',
  pink: '#fe00f6',
  orange: '#fe7f00'
};

export const sendNotifyToChat = async(data) => {
  if(!Object.hasOwn(data, 'title') || data.title == '') {
    data.title = false;
  }

  if(! data.title) return;

  if(!Object.hasOwn(data, 'speaker') || data.speaker == '') {
    data.speaker = game.i18n.localize("CZT.Common.Notify.Speaker");
  }

  if(!Object.hasOwn(data, 'message') || data.message == '') {
    data.message = false;
  }

  
  if(!Object.hasOwn(data, 'color') || data.color == '') {
    data.color = 'turquoise';
    data.selected_color = colors.turquoise;
  }else{
    data.selected_color = colors[data.color];
  }

  if(!Object.hasOwn(data, 'classes') || data.classes == '') {
    data.classes= 'czt-chat-notify';
  }

  const template = await foundry.applications.handlebars.renderTemplate(`${SYSTEM.template_path}/chats/czt-chat-notify.hbs`, data);

  ChatMessage.create({
    user: game.user._id,
    speaker: ChatMessage.getSpeaker({
      alias: data.speaker
    }),
    content: template
  });
}