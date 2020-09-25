import { Base } from '../../src/Base'
import { db } from '../plugins/firebase'

export class Application<T extends Record<string, unknown>> extends Base<T> {
  get baseProps(): typeof Base.prototype.props {
    return { db }
  }
}
