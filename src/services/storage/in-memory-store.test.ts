import { InMemoryStore } from './in-memory-store';

describe('InMemoryStore', () => {
  it('devuelve null para una clave inexistente', async () => {
    const store = new InMemoryStore();
    expect(await store.get('missing')).toBeNull();
  });

  it('guarda y recupera un valor', async () => {
    const store = new InMemoryStore();
    await store.set('k', 'v');
    expect(await store.get('k')).toBe('v');
  });

  it('elimina un valor', async () => {
    const store = new InMemoryStore();
    await store.set('k', 'v');
    await store.remove('k');
    expect(await store.get('k')).toBeNull();
  });
});
