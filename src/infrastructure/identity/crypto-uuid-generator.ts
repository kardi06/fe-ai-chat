import type { IdGenerator } from '@/domain/ports/id-generator';

export class CryptoUuidGenerator implements IdGenerator {
  generate(): string {
    return crypto.randomUUID();
  }
}
