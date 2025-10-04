import { BytestohumanPipe } from './bytestohuman.pipe';

describe('BytestohumanPipe', () => {
  it('create an instance', () => {
    const pipe = new BytestohumanPipe();
    expect(pipe).toBeTruthy();
  });
});
