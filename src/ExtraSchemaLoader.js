import { FileSchemaLoaderStrategy } from '@themost/data';
import path from 'path';

export class ExtraSchemaLoader extends FileSchemaLoaderStrategy {
    /**
     * @param {ConfigurationBase} config
     */
    constructor(config) {
        super(config);
        // set configuration path
        this.setModelPath(path.resolve(__dirname, 'config/models'));
    }

    /**
     * Override FileSchemaLoaderStrateg.getModelDefinition(name) method in order to load event listeners and class path
     * which are relative to this module and should be converted to absolute paths
     * This operation is very important in order to load event listeners and class path correctly
     * @param {*} name 
     * @returns 
     */
    getModelDefinition(name) {
        /**
         * get model definition
         * @type {import('@themost/common').DataModelProperties|undefined}
         */
        const model = super.getModelDefinition.bind(this)(name);
        if (model) {
            model.eventListeners = model.eventListeners || [];
            model.eventListeners.forEach(eventListener => {
                if (eventListener.type.indexOf('.') === 0) {
                    // set absolute path
                    eventListener.type = path.resolve(__dirname, eventListener.type);
                }
            });
            if (model.classPath && model.classPath.indexOf('.') === 0) {
                // set absolute path
                model.classPath = path.resolve(__dirname, model.classPath);
            }
        }
        return model;
    }
}