import { Request } from 'express';

export function validateRequest(request: Request, requiredUserTypes: string[]): boolean {

    if (request.query.accessToken)
    {
      let tokenFields: string[] = String(request.query.accessToken).split(",");

      if(tokenFields[0] == 'fake-jwt-token')
      {
        if(requiredUserTypes.includes(tokenFields[2]))
        {
          return true;
        }
      }
    }

    return false;
  }