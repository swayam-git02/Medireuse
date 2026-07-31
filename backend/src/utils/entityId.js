import crypto from 'crypto';

const ENTITY_ID_PATTERN = /^[a-f0-9]{24}$/;

export const createEntityId = () => crypto.randomBytes(12).toString('hex');

export const isValidEntityId = (value) =>
  typeof value === 'string' && ENTITY_ID_PATTERN.test(value);

export default createEntityId;
