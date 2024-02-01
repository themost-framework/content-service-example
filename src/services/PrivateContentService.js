import {AttachmentFileSystemStorage} from '@themost/web/files'
import path from 'path';
import express from 'express';
import { TraceUtils, HttpServerError, HttpNotFoundError } from '@themost/common';

/**
 * @class
 */
export class PrivateContentService extends AttachmentFileSystemStorage {
    /**
     * @param {IApplication} app
     */
    // eslint-disable-next-line no-unused-vars
    constructor(app) {
        // get physical path from application configuration or use content/private as default path
        super(path.resolve( process.cwd(), 'content/private'));
        // set virtual path
        this.virtualPath = '/api/content/private/';

        app.serviceRouter.subscribe( serviceRouter => {
            if (serviceRouter == null) {
                return
            }
            // create new router
            const addRouter = express.Router();
            addRouter.get('/content/private/:file', (req, res, next) => {
                /**
                 * get private content service
                 * @type {PrivateContentService}
                 */
                let service = req.context.getApplication().getService(PrivateContentService);
                service.findOne(req.context, { alternateName: req.params.file }, function(err, result) {
                    if (err) {
                        TraceUtils.error(err);
                        return next(new HttpServerError());
                    }
                    if (result==null) {
                        return next(new HttpNotFoundError());
                    }
                    service.resolvePhysicalPath(req.context, result, function(err, executionPath) {
                        if (err) {
                            return next(err);
                        }
                       return res.sendFile(executionPath, {
                        headers: {
                            'Content-Type': result.contentType || 'application/octet-stream',
                            'Content-Disposition': 'inline; filename=' + result.name
                        }
                       },  (err) => {
                           if (err) {
                               if (err.code === 'ENOENT') {
                                   TraceUtils.error(err);
                                   return next(new HttpNotFoundError());
                               }
                               return next(err);
                           }
                       });
                    });
                });
            });
            // insert router at the beginning of serviceRouter.stack
            serviceRouter.stack.unshift.apply(serviceRouter.stack, addRouter.stack);
        });

    }
}