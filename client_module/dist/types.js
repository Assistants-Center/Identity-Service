"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientScope = exports.UserRole = void 0;
var ClientScope;
(function (ClientScope) {
    ClientScope["Admin"] = "admin";
    ClientScope["AccountRead"] = "account:read";
    ClientScope["AccountWrite"] = "account:write";
    ClientScope["AccountDelete"] = "account:delete";
    ClientScope["DbdRead"] = "dbd:read";
    ClientScope["DbdWrite"] = "dbd:write";
    ClientScope["DbdDelete"] = "dbd:delete";
    ClientScope["StoreRead"] = "store:read";
    ClientScope["StoreWrite"] = "store:write";
    ClientScope["StoreDelete"] = "store:delete";
})(ClientScope || (ClientScope = {}));
exports.ClientScope = ClientScope;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
})(UserRole || (UserRole = {}));
exports.UserRole = UserRole;
