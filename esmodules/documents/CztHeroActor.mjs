/**
 * Extend the basic Actor
 * @extends {Actor}
 */
import { SYSTEM } from "../configs/system.mjs";


export default class CztHeroActor extends Actor {
  
  constructor(data = {}, context) {

    super(data, context);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();

  }
};