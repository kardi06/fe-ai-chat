export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidIdError extends DomainError {
  constructor(kind: string, value: string) {
    super(`Invalid ${kind}: ${JSON.stringify(value)}`);
  }
}

export class InvalidTitleError extends DomainError {
  constructor(reason: string) {
    super(`Invalid session title: ${reason}`);
  }
}

export class SessionNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Session not found: ${id}`);
  }
}

export class EmptyMessageContentError extends DomainError {
  constructor() {
    super('Message content cannot be empty');
  }
}

export class MessageStateError extends DomainError {
  constructor(from: string, action: string) {
    super(`Cannot ${action} a message in state '${from}'`);
  }
}
