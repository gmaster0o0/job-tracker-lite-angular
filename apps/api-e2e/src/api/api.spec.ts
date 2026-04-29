import axios from 'axios';

describe('GET /api', () => {
  it('should return health information', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data.status).toMatch(/UP|DOWN/);
    expect(res.data.database).toMatch(/UP|DOWN/);
    expect(new Date(res.data.timestamp).toString()).not.toBe('Invalid Date');
  });
});

describe('GET /api/jobs', () => {
  it('should return a jobs array', async () => {
    const res = await axios.get(`/api/jobs`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
  });
});
