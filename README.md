# File Management with @themost/data

This project is an example of how to use `Attachment` model and `PrivateContentService` for managing files and user uploads.

It extends api services provided by `@themost/test` package at https://github.com/themost-framework/test

## Test

Start the application by running the following command:

```bash
npm start
```
Use postman collection at `test/themost-test.postman_collection.json` for testing application services

IMPORTANT NOTE: `@themost/test` package recycles the database on each test run. 

## Description

This example extends test api services and adds 3 new models:

### Attachment

This model represents a file attachment and it is used for storing file metadata. It has the following properties: 

- `id` - the unique identifier of the attachment
- `name` - the name of the attachment
- `description` - the description of the attachment
- `contentType` - the mime type of the attachment
- `size` - the size of the attachment
- `url` - the url of the attachment
- `version` - the version of the attachment
- `thumbnail` - the url of the thumbnail of the attachment
- `dateCreated` - the date and time that the attachment was created
- `dateModified` - the date and time that the attachment was modified
- `datePublished` - the date and time that the attachment was published
- `published` - a boolean value which indicates whether the attachment is published or not
- `keywords` - a collection which contains keywords for the attachment
- `attachmentType` - the type of the attachment (e.g. `image`, `video`, `audio`, `document`, `archive`, `other`)
- `owner` - a user which is the owner of this attachment
- `createdBy` - a user which created this attachment
- `modifiedBy` - a user which modified this attachment

### AttachmentType

This model represents a type of attachment. It has the following properties:

- `id` - the unique identifier of the attachment type
- `name` - the name of the attachment type
- `description` - the description of the attachment type
- `alternateName` - the alternate name of the attachment type which is also used as a key
- `description` - the description of the attachment type
- `dateCreated` - the date and time that the attachment type was created
- `dateModified` - the date and time that the attachment type was modified
- `createdBy` - a user which created this attachment
- `modifiedBy` - a user which modified this attachment

### CustomerOrder

This model represents a customer order and inherits from `Order` model provided by `@themost/test` package. It has the following properties:

- `id` - the unique identifier of the order
- `customer` - the customer which placed this order
- `dateCreated` - the date and time that the order was created
- `dateModified` - the date and time that the order was modified
- `createdBy` - a user which created this order
- `modifiedBy` - a user which modified this order
- `orderedItem` - the ordered item e.g. a product
- `orderNumber` - the order number
- `orderStatus` - the status of the order
- `paymentMethod` - the payment method of the order
- `attachments` - a collection of attachments which are associated with this order


### ExtraSchemaLoader

`ExtraSchemaLoader` is being for loading extra data models during startup. 

```javascript
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
```

### PrivateContentService

`PrivateContentService` is being used for managing content uploaded by end users. This service inherits from `ApplicationService` and it's being registered also during startup.

```javascript
// register private content service
app.useService(PrivateContentService);

```

It extends service router by adding a new route `/api/content/private/:file` for downloading files

## Customer Order Flow

1. Get access token

```bash
curl --location 'http://localhost:3000/auth/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'username=alexis.rees@example.com' \
--data-urlencode 'password=secret' \
--data-urlencode 'client_id=9165351833584149' \
--data-urlencode 'client_secret=hTgqFBUhCfHs/quf/wnoB+UpDSfUusKA' \
--data-urlencode 'grant_type=password' \
--data-urlencode 'scope=profile'
```

2. Create new order

```bash
curl --location 'http://localhost:3000/api/CustomerOrders' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <access token>' \
--data-raw '{
    "orderedItem": {
        "name": "Apple MacBook Air (13.3-inch, 2013 Version)"
    },
    "customer": {
        "email": "eric.stokes@example.com"
    }
}'
```

3. Add attachment

```bash
curl --location 'http://localhost:3000/api/CustomerOrders/811/AddAttachment' \
--header 'Authorization: Bearer <access token>' \
--form 'file=@"/tmp/lorem-ipsum.pdf"' \
--form 'attachmentType[alternateName]="Other"'
```

4. Download attachment

```bash
curl --location 'http://localhost:3000/api/content/private/5JXFsvwnxNJf' \
--header 'Authorization: Bearer <access token>'
```





