"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
function validateRequest(request, requiredUserTypes) {
    if (request.query.accessToken) {
        let tokenFields = String(request.query.accessToken).split(",");
        if (tokenFields[0] == 'fake-jwt-token') {
            if (requiredUserTypes.includes(tokenFields[2])) {
                return true;
            }
        }
    }
    return false;
}
exports.validateRequest = validateRequest;
//# sourceMappingURL=RequestValidator.js.map