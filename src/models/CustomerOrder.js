import { EdmMapping, EdmType } from '@themost/data';
import { EnableAttachmentObject, tryCloseStream } from './EnableAttachmentObject';


@EdmMapping.entityType('CustomerOrder')
class CustomerOrder extends EnableAttachmentObject {
    constructor() {
        super();
    }

    /**
     * Adds an attachment
     * @param {*} file
     * @param {*=} extraAttributes
     */
    @EdmMapping.param('extraAttributes', 'Object', true, true)
    @EdmMapping.param('file', EdmType.EdmStream, false)
    @EdmMapping.action('AddAttachment', 'Attachment')
    async addAttachment(file, extraAttributes) {
        try {
            const attachment = Object.assign({
                name: file.contentFileName,
                originalname:file.contentFileName
            }, file, extraAttributes);
            // call super method to add attachment
            const result = await super.addAttachment(attachment);
            tryCloseStream(file);
            return result;
        } catch(err) {
            // try to close stream
            tryCloseStream(file);
            // and throw error
            throw err;
        }
        
    }
    /**
     * Removes an attachment
     * @param {*} attachment
     */
    @EdmMapping.param('attachment', 'Attachment', true, true)
    @EdmMapping.action('RemoveAttachment', 'Attachment')
    async removeAttachment(attachment) {
        // call super method to remove attachment
        return await super.removeAttachment(attachment.id);
    }

}

export {
    CustomerOrder
}
