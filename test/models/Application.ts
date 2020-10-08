import { Base } from '../../src/Base'
import { BaseObject } from '../../src/types'
import { db } from '../plugins/firebase'

export class Application<T extends BaseObject> extends Base<T> {
  get baseProps(): typeof Base.prototype.props {
    return { db }
  }
}
