import {
  validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";
import { UnprocessableEntityException } from "./http_exceptions";

export const validateBody = async (what: any) => {
  await validate(what).then((errors) => {
    if (errors.length > 0) {
      const errorsString = errors
        .map((error) => {
          return error.constraints
            ? Object.values(error.constraints).join(", ")
            : "";
        })
        .join(", ");
      throw new UnprocessableEntityException(
        `Validation failed: ${errorsString}`
      );
    }
  });
};

@ValidatorConstraint({ name: "usernameValid", async: false })
export class UsernameValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    return /^[a-z0-9_.]+$/.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return "Username must be an valid username. Only lowercase letters, numbers, underscores and dots are allowed.";
  }
}

@ValidatorConstraint({ name: "emailValid", async: false })
export class EmailValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    const match = String(text)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    return !!match;
  }

  defaultMessage(args: ValidationArguments) {
    return "Email must be an valid email address.";
  }
}

@ValidatorConstraint({ name: "parameterValid", async: false })
export class ParameterValidator implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    const match = String(text)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    return !!match || /^[a-z0-9_.]+$/.test(text);
  }

  defaultMessage(args: ValidationArguments) {
    return "Parameter must be an valid email address or username. Only lowercase letters, numbers, underscores and dots are allowed.";
  }
}
