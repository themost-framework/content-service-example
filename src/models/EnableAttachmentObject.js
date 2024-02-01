import { DataObject } from '@themost/data';
import { DataNotFoundError } from '@themost/common';
import { HttpServerError, HttpBadRequestError } from '@themost/common';
import { TraceUtils } from '@themost/common';
import path from 'path';

export class MimeTypeError extends HttpBadRequestError {
    constructor(message) {
        super(message);
        this.code = "ERR_MIME_TYPE";
    }
}

function convertFileName(file)
{
    let fileName = file.name;
    if (typeof file.originalname === 'string') {
        fileName = file.originalname;
        // TODO: change this if busboy default encoding changes to utf-8 instead of latin1
        // buffer original name with latin1 encoding and back
        const buffer = Buffer.from(file.originalname, 'latin1');
        const testConversion = buffer.toString('latin1');
        // then check if the produced name is the same with originalName and parse it as utf-8
        if (testConversion == file.originalname) {
            fileName = Buffer.from(file.originalname, 'latin1').toString('utf-8');
        }
        fileName = fileName.replace(/\.[A-Z0-9]+$/ig, function (x) {
            return x.toLowerCase();
        });
    }
    return fileName;
}

function tryCloseStream(stream) {
	if (stream && typeof stream.close === 'function') {
		try {
			stream.close();
		} catch (error) {
			TraceUtils.warn(
				`(tryCloseStream) An error occurred while trying to close a stream.`
			);
			TraceUtils.warn(error);
		}
	}
}

class EnableAttachmentObject extends DataObject {
    constructor() {
        super();
    }

    /**
     * @param {*} file 
     * @returns Promise<*>
     */
    addAttachment(file) {
        const context = this.context;
        const self = this;
        let finalResult;
        return new Promise((resolve, reject) => {
            this.context.db.executeInTransaction((transactionCallback) => {
                file.name = convertFileName(file);
                const mime = file.mimetype || file.contentType;
                if (mime == null) {
                    return transactionCallback(new MimeTypeError('The specified file type is not supported by the system.'))
                }
                const addAttributes = {};
                // get attachment attributes
                const { attributeNames } = context.model('Attachment');
                attributeNames.forEach((attribute) => {
                    if (Object.prototype.hasOwnProperty.call(file, attribute)) {
                        addAttributes[attribute] = file[attribute];
                    }
                });
                // set content type
                const newAttachment = Object.assign(addAttributes,
                    {
                        contentType: mime
                    });
                // get content service
                const svc = context.getApplication().getService(function PrivateContentService() {});
                if (svc == null) {
                    return transactionCallback(new HttpServerError('The specified service is not available.'));
                }
                //add attachment to attachments
                context.unattended((unattendedCallback) => {
                    let filePath;
                    if (file.destination && file.filename) {
                        filePath = path.resolve(file.destination, file.filename);
                    } else {
                        filePath = file.path;
                    }
                    svc.copyFrom(context, filePath, newAttachment, function (err) {
                        if (err) {
                            TraceUtils.error(err);
                            return unattendedCallback(new HttpServerError());
                        }
                        return unattendedCallback();
                    });

                }, (err) => {
                    if (err) {
                        return transactionCallback(err);
                    }
                    const attachments = self.property('attachments');
                    // set attachment ownership
                    attachments.insert(newAttachment, (err) => {
                        if (err) {
                            return transactionCallback(err);
                        }
                        svc.resolveUrl(context, newAttachment, function (err, url) {
                            if (err) {
                                transactionCallback(err);
                            }
                            else {
                                finalResult = Object.assign({
                                }, newAttachment, {
                                    url: url,
                                    name: newAttachment.filename
                                });
                                return transactionCallback();
                            }
                        });
                    });
                });

            }, (err) => {
                if (err) {
                    return reject(err);
                }
                return resolve(finalResult);
            });
        })

    }

    /**
     * 
     * @param {number} id 
     * @returns Promise<*> 
     */
    removeAttachment(id) {
        const context = this.context;
        const self = this;
        let result;
        return new Promise((resolve, reject)=> {
            self.context.db.executeInTransaction((transactionCallback)=> {
                //get attachment
                return context.model('Attachment').where('id').equal(id).getItem().then((attachment)=> {
                   if (attachment) {
                       //remove attachment connection
                       return self.property('attachments').remove(attachment,(err)=> {
                           //remove attachment
                           if (err) {
                               return transactionCallback(err);
                           }
                           return context.model('Attachment').silent().remove(attachment).then(()=> {
                               result = attachment;
                               return transactionCallback();
                           }).catch((err)=> {
                               return transactionCallback(err);
                           });
                       });
                   }
                   return transactionCallback(new DataNotFoundError());
                }).catch((err)=> {
                    return transactionCallback(err);
                });
            }, (err)=> {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }
}

export {
    EnableAttachmentObject,
    tryCloseStream
}
