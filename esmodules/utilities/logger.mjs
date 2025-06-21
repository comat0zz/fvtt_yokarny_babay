const style = "font-size: 15px; padding: 3px 10px;";

const logLevel = {
  info: "background:#136E46;color:#fff;padding: 3px 10px;",
  debug: "background:#027BC4;color:#fff;padding: 3px 10px;"
}

export class Log {
  constructor(dbg = false) { 
    this.debug = dbg;

    if(this.debug){
      console.log(`%c${game.system.id} | init system`, `${logLevel.info}${style}`);
    }
  }

  log(m) {
    if(this.debug){
      console.log("%cDebug: "+ (typeof m), `${logLevel.debug}`)
      console.log(m)
    }
  }

  info(m) {
    if(this.debug){
      console.log(`%c${m}`, `${logLevel.info}`)
    }
  }
}