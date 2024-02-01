import { getApplication, serveApplication }  from '@themost/test';
import { ExpressDataApplication } from '@themost/express';
import { PrivateContentService } from './services/PrivateContentService';
import { SchemaLoaderStrategy, ODataModelBuilder } from '@themost/data';
import { ExtraSchemaLoader } from './ExtraSchemaLoader';

/**
 * get container which is an express application
 * @type {import('express').Application}
 */
const container = getApplication();
/**
 * get data application
 * @type {import('@themost/express').ExpressDataApplication}
 */
const app = container.get(ExpressDataApplication.name);
// use content service for managing attachments
app.useService(PrivateContentService);
// now try to embed a new schema loader which adds a collection of models
// get application configuration
const configuration = app.getConfiguration();
/**
 * Get the default schema loader strategy
 * @type {import('@themost/data').DefaultSchemaLoaderStrategy}
 */
const schemaLoader = configuration.getStrategy(SchemaLoaderStrategy);
// extend DefaultSchemaLoaderStrategy.loaders collection and add our extra schema loader
// which loads models from config/models folder
schemaLoader.loaders.push(
    new ExtraSchemaLoader(configuration)
);
// OData model builder should be reset after adding new entities via schema loaders
const builder = app.getService(ODataModelBuilder);
// clean entities
builder.clean(true);
// and initialize metadata
builder.initializeSync();
// serve application listening on port 3000
serveApplication(container, 3000);