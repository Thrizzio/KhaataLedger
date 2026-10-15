process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-only-secret';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
