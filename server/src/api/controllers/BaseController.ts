import { Response, Request, NextFunction } from 'express';
import { matchedData, validationResult } from "express-validator";
import { camelCase, omit } from "lodash";
import { mapKeysDeep } from 'utils'

export default class BaseController {

  /**
   * Converts plain object keys to cameCase style.
   * @param {Object} data 
   */
  private dataToCamelCase(data) {
    return mapKeysDeep(data, (v, k) => camelCase(k));
  }

  /**
   * Matches the body data from validation schema.
   * @param {Request} req 
   * @param options 
   */
  matchedBodyData(req: Request, options: any = {}) {
    const data = matchedData(req, {
      locations: ['body'],
      includeOptionals: true,
      ...omit(options, ['locations']), // override any propery except locations.
    });
    return this.dataToCamelCase(data);
  }

  /**
   * Matches the query data from validation schema.
   * @param {Request} req 
   */
  matchedQueryData(req: Request) {
    const data = matchedData(req, {
      locations: ['query'],
    });
    return this.dataToCamelCase(data);
  }

  /**
   * Validate validation schema middleware.
   * @param {Request} req 
   * @param {Response} res 
   * @param {NextFunction} next 
   */
  validationResult(req: Request, res: Response, next: NextFunction) {
    const validationErrors = validationResult(req);
    
    if (!validationErrors.isEmpty()) {
      return res.boom.badData(null, {
        code: 'validation_error',
        ...validationErrors,
      });
    }
    next();
  }
}