import { InvalidIdError } from '@/domain/errors';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type MessageId = string & { readonly __brand: 'MessageId' };

export function makeMessageId(value: string): MessageId {
  if (!UUID_REGEX.test(value)) {
    throw new InvalidIdError('MessageId', value);
  }
  return value as MessageId;
}
