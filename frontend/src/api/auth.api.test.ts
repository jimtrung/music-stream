// @vitest-environment node
import { describe, it, expect } from 'vitest';
import axios from 'axios';

// ============================================================
// Cấu hình
// ============================================================
const API_BASE_URL = 'http://127.0.0.1:5255';
const api = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

// ============================================================
// Mock data từ dataset_q.json – dữ liệu user thật
// ============================================================
const VALID_USERS = [
  { username: 'aretha',   plainPassword: 'NF',                isPremium: true  },
  { username: 'fenton',   plainPassword: 'joh316',            isPremium: false },
  { username: 'afif',     plainPassword: 'jboss4',            isPremium: false },
  { username: 'luuk',     plainPassword: 'AMI_SW',            isPremium: true  },
  { username: 'elmo',     plainPassword: 'CISSUS',            isPremium: true  },
  { username: 'johanna',  plainPassword: 'leviton',           isPremium: true  },
  { username: 'bambie',   plainPassword: '123123',            isPremium: false },
  { username: 'moon',     plainPassword: '456',               isPremium: false },
  { username: 'meriann',  plainPassword: '1',                 isPremium: false },
  { username: 'walley',   plainPassword: 'HPOFFICE DATA',     isPremium: false },
  { username: 'nettie',   plainPassword: '?award',            isPremium: false },
  { username: 'zain',     plainPassword: 'changeonfirstlogin',isPremium: false },
];

// ============================================================
// TEST SUITE: Đăng nhập – gửi request thật tới backend
// ============================================================
describe('POST /auth/signin – Kiểm thử API đăng nhập (real request)', () => {

  // ----------------------------------------------------------
  // TC-01: Đăng nhập thành công với từng user từ dataset_q.json
  // ----------------------------------------------------------
  describe('TC-01: Đăng nhập thành công', () => {
    VALID_USERS.forEach((user) => {
      it(`✅ ${user.username} / ${user.plainPassword}`, async () => {
        const res = await api.post('/auth/signin', {
          username: user.username,
          password: user.plainPassword,
        });

        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty('access_token');
        expect(typeof res.data.access_token).toBe('string');
        expect(res.data.access_token.length).toBeGreaterThan(0);
      });
    });
  });

  // ----------------------------------------------------------
  // TC-02: Đăng nhập thất bại – sai mật khẩu
  // ----------------------------------------------------------
  describe('TC-02: Sai mật khẩu', () => {
    it('❌ aretha / WRONG_PASSWORD → 401', async () => {
      try {
        await api.post('/auth/signin', {
          username: 'aretha',
          password: 'WRONG_PASSWORD',
        });
        expect.unreachable('Should have thrown 401');
      } catch (err: any) {
        expect(err.response.status).toBe(401);
      }
    });

    it('❌ fenton / (empty) → 400', async () => {
      try {
        await api.post('/auth/signin', {
          username: 'fenton',
          password: '',
        });
        expect.unreachable('Should have thrown 400');
      } catch (err: any) {
        expect(err.response.status).toBe(400);
      }
    });

    it('❌ fenton dùng password của afif (jboss4) → 401', async () => {
      try {
        await api.post('/auth/signin', {
          username: 'fenton',
          password: 'jboss4', // password của afif
        });
        expect.unreachable('Should have thrown 401');
      } catch (err: any) {
        expect(err.response.status).toBe(401);
      }
    });
  });

  // ----------------------------------------------------------
  // TC-03: User không tồn tại
  // ----------------------------------------------------------
  describe('TC-03: User không tồn tại', () => {
    it('❌ nonexistent_user_xyz → 404', async () => {
      try {
        await api.post('/auth/signin', {
          username: 'nonexistent_user_xyz',
          password: 'anypassword',
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.response.status).toBe(404);
      }
    });

    it('❌ username rỗng → 400', async () => {
      try {
        await api.post('/auth/signin', {
          username: '',
          password: 'NF',
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.response.status).toBe(400);
      }
    });
  });

  // ----------------------------------------------------------
  // TC-04: Mật khẩu chứa ký tự đặc biệt / khoảng trắng
  // ----------------------------------------------------------
  describe('TC-04: Mật khẩu có ký tự đặc biệt', () => {
    it('✅ nettie / ?award (ký tự ?)', async () => {
      const res = await api.post('/auth/signin', {
        username: 'nettie',
        password: '?award',
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
    });

    it('✅ walley / HPOFFICE DATA (có khoảng trắng)', async () => {
      const res = await api.post('/auth/signin', {
        username: 'walley',
        password: 'HPOFFICE DATA',
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
    });

    it('✅ bambie / 123123 (chỉ có số)', async () => {
      const res = await api.post('/auth/signin', {
        username: 'bambie',
        password: '123123',
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
    });

    it('✅ meriann / 1 (password 1 ký tự)', async () => {
      const res = await api.post('/auth/signin', {
        username: 'meriann',
        password: '1',
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
    });

    it('✅ zain / changeonfirstlogin (password dài)', async () => {
      const res = await api.post('/auth/signin', {
        username: 'zain',
        password: 'changeonfirstlogin',
      });
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
    });
  });

  // ----------------------------------------------------------
  // TC-05: Case sensitivity
  // ----------------------------------------------------------
  describe('TC-05: Case sensitivity', () => {
    it('❌ ARETHA (uppercase) / NF → 404 (case-sensitive)', async () => {
      try {
        await api.post('/auth/signin', {
          username: 'ARETHA',
          password: 'NF',
        });
        expect.unreachable('Should have thrown - username is case-sensitive');
      } catch (err: any) {
        expect(err.response.status).toBe(404);
      }
    });

    it('❌ aretha / nf (password lowercase) → 401', async () => {
      try {
        await api.post('/auth/signin', {
          username: 'aretha',
          password: 'nf', // đúng là 'NF'
        });
        expect.unreachable('Should have thrown 401');
      } catch (err: any) {
        expect(err.response.status).toBe(401);
      }
    });
  });

  // ----------------------------------------------------------
  // TC-06: Payload bất thường (SQL injection, XSS)
  // ----------------------------------------------------------
  describe('TC-06: Payload bất thường', () => {
    it('❌ SQL injection trong username → 404', async () => {
      try {
        await api.post('/auth/signin', {
          username: "' OR 1=1 --",
          password: 'anything',
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.response.status).toBe(404);
      }
    });

    it('❌ XSS trong username → 404', async () => {
      try {
        await api.post('/auth/signin', {
          username: '<script>alert("xss")</script>',
          password: 'test',
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect(err.response.status).toBe(404);
      }
    });
  });

  // ----------------------------------------------------------
  // TC-07: Thiếu trường trong payload
  // ----------------------------------------------------------
  describe('TC-07: Thiếu trường trong payload', () => {
    it('❌ thiếu password → 400 hoặc 401', async () => {
      try {
        await api.post('/auth/signin', {
          username: 'aretha',
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect([400, 401]).toContain(err.response.status);
      }
    });

    it('❌ thiếu username → 400 hoặc 401', async () => {
      try {
        await api.post('/auth/signin', {
          password: 'NF',
        });
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect([400, 401]).toContain(err.response.status);
      }
    });

    it('❌ body rỗng → 400 hoặc 401', async () => {
      try {
        await api.post('/auth/signin', {});
        expect.unreachable('Should have thrown');
      } catch (err: any) {
        expect([400, 401]).toContain(err.response.status);
      }
    });
  });

  // ----------------------------------------------------------
  // TC-08: Response format kiểm tra
  // ----------------------------------------------------------
  describe('TC-08: Response format', () => {
    it('response phải chứa access_token dạng string', async () => {
      const res = await api.post('/auth/signin', {
        username: 'aretha',
        password: 'NF',
      });

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('access_token');
      expect(typeof res.data.access_token).toBe('string');
      expect(res.data.access_token.length).toBeGreaterThan(10);
    });

    it('access_token nên có định dạng JWT (3 phần ngăn bởi dấu chấm)', async () => {
      const res = await api.post('/auth/signin', {
        username: 'fenton',
        password: 'joh316',
      });

      const token = res.data.access_token;
      const parts = token.split('.');
      expect(parts.length).toBe(3); // header.payload.signature
    });
  });
});
