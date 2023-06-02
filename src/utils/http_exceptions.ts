export abstract class Exception {
  statusCode = 500;
  error = "INTERNAL_SERVER_ERROR";
  message =
    "Internal server error occurred. Please try again later. If the problem persists, please contact us.";
}

export class InternalServerErrorException implements Exception {
  statusCode = 500;
  error = "INTERNAL_SERVER_ERROR";
  message =
    "Internal server error occurred. Please try again later. If the problem persists, please contact us.";

  constructor(message?: string) {
    if (message) this.message = message;
  }
}

export class BadRequestException implements Exception {
  statusCode = 400;
  error = "BAD_REQUEST";
  message = "Bad request. Please check the request body and try again.";

  constructor(message?: string) {
    if (message) this.message = message;
  }
}

export class UnauthorizedException implements Exception {
  statusCode = 401;
  error = "UNAUTHORIZED";
  message = "Unauthorized. Please check your credentials and try again.";

  constructor(message?: string) {
    if (message) this.message = message;
  }
}

export class ForbiddenException implements Exception {
  statusCode = 403;
  error = "FORBIDDEN";
  message = "Forbidden. You do not have permission to access this resource.";

  constructor(message?: string) {
    if (message) this.message = message;
  }
}

export class NotFoundException implements Exception {
  statusCode = 404;
  error = "NOT_FOUND";
  message = "Not found. The requested resource was not found.";

  constructor(message?: string) {
    if (message) this.message = message;
  }
}

export class ConflictException implements Exception {
  statusCode = 409;
  error = "CONFLICT";
  message = "Conflict. The requested resource already exists.";

  constructor(message?: string) {
    if (message) this.message = message;
  }
}

export class UnprocessableEntityException implements Exception {
  statusCode = 422;
  error = "UNPROCESSABLE_ENTITY";
  message =
    "Unprocessable entity. Please check the request body and try again.";

  constructor(message?: string) {
    if (message) this.message = message;
  }
}

export class TooManyRequestsException implements Exception {
  statusCode = 429;
  error = "TOO_MANY_REQUESTS";
  message = "Too many requests. Please try again later.";

  constructor(message?: string) {
    if (message) this.message = message;
  }
}
