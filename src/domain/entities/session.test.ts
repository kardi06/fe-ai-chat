import { describe, expect, it } from 'vitest';
import { InvalidTitleError } from '@/domain/errors';
import { makeSessionId } from '@/domain/value-objects/session-id';
import { DEFAULT_TITLE, MAX_TITLE_LENGTH, Session } from './session';

const TEST_ID = makeSessionId('00000000-0000-4000-8000-000000000001');
const TEST_CREATED_AT = new Date('2025-05-12T10:00:00.000Z');
const TEST_UPDATED_AT = new Date('2025-05-12T11:00:00.000Z');

describe('Session', () => {
  describe('create', () => {
    it('uses default title when none provided', () => {
      const session = Session.create({ id: TEST_ID, createdAt: TEST_CREATED_AT });
      expect(session.title).toBe(DEFAULT_TITLE);
    });

    it('uses custom title when provided', () => {
      const session = Session.create({
        id: TEST_ID,
        createdAt: TEST_CREATED_AT,
        title: 'My chat',
      });
      expect(session.title).toBe('My chat');
    });

    it('trims surrounding whitespace from title', () => {
      const session = Session.create({
        id: TEST_ID,
        createdAt: TEST_CREATED_AT,
        title: '  Spaced  ',
      });
      expect(session.title).toBe('Spaced');
    });

    it('rejects empty title', () => {
      expect(() =>
        Session.create({ id: TEST_ID, createdAt: TEST_CREATED_AT, title: '' }),
      ).toThrow(InvalidTitleError);
    });

    it('rejects whitespace-only title', () => {
      expect(() =>
        Session.create({ id: TEST_ID, createdAt: TEST_CREATED_AT, title: '   ' }),
      ).toThrow(InvalidTitleError);
    });

    it('rejects title exceeding MAX_TITLE_LENGTH', () => {
      const tooLong = 'x'.repeat(MAX_TITLE_LENGTH + 1);
      expect(() =>
        Session.create({ id: TEST_ID, createdAt: TEST_CREATED_AT, title: tooLong }),
      ).toThrow(InvalidTitleError);
    });

    it('accepts title at MAX_TITLE_LENGTH (boundary)', () => {
      const atLimit = 'x'.repeat(MAX_TITLE_LENGTH);
      expect(() =>
        Session.create({ id: TEST_ID, createdAt: TEST_CREATED_AT, title: atLimit }),
      ).not.toThrow();
    });

    it('initializes updatedAt equal to createdAt', () => {
      const session = Session.create({ id: TEST_ID, createdAt: TEST_CREATED_AT });
      expect(session.updatedAt).toEqual(TEST_CREATED_AT);
    });
  });

  describe('rename', () => {
    it('returns a new instance with the new title and updatedAt', () => {
      const session = Session.create({ id: TEST_ID, createdAt: TEST_CREATED_AT });
      const renamed = session.rename('Renamed', TEST_UPDATED_AT);

      expect(renamed.title).toBe('Renamed');
      expect(renamed.updatedAt).toEqual(TEST_UPDATED_AT);
      expect(renamed.createdAt).toEqual(TEST_CREATED_AT);
      expect(renamed.id).toBe(TEST_ID);
    });

    it('does not mutate the original session', () => {
      const session = Session.create({ id: TEST_ID, createdAt: TEST_CREATED_AT });
      session.rename('Renamed', TEST_UPDATED_AT);

      expect(session.title).toBe(DEFAULT_TITLE);
      expect(session.updatedAt).toEqual(TEST_CREATED_AT);
    });

    it('rejects empty new title', () => {
      const session = Session.create({ id: TEST_ID, createdAt: TEST_CREATED_AT });
      expect(() => session.rename('', TEST_UPDATED_AT)).toThrow(InvalidTitleError);
    });
  });

  describe('touch', () => {
    it('updates only updatedAt', () => {
      const session = Session.create({
        id: TEST_ID,
        createdAt: TEST_CREATED_AT,
        title: 'Original',
      });
      const touched = session.touch(TEST_UPDATED_AT);

      expect(touched.title).toBe('Original');
      expect(touched.createdAt).toEqual(TEST_CREATED_AT);
      expect(touched.updatedAt).toEqual(TEST_UPDATED_AT);
    });
  });

  describe('reconstitute', () => {
    it('preserves all fields verbatim', () => {
      const session = Session.reconstitute({
        id: TEST_ID,
        title: 'Restored',
        createdAt: TEST_CREATED_AT,
        updatedAt: TEST_UPDATED_AT,
      });

      expect(session.id).toBe(TEST_ID);
      expect(session.title).toBe('Restored');
      expect(session.createdAt).toEqual(TEST_CREATED_AT);
      expect(session.updatedAt).toEqual(TEST_UPDATED_AT);
    });

    it('trusts persistence and skips title validation', () => {
      // An empty title would fail Session.create's invariants, but reconstitute
      // is meant to rehydrate already-validated data from storage without re-checking.
      expect(() =>
        Session.reconstitute({
          id: TEST_ID,
          title: '',
          createdAt: TEST_CREATED_AT,
          updatedAt: TEST_UPDATED_AT,
        }),
      ).not.toThrow();
    });
  });
});
