// API Client bridging Frontend to Backend
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Local development connects to port 5000
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      return `http://${host}:5000/api/v1`;
    }
    // Remote/production deployments (e.g. Vercel) target the live Render backend
    return 'https://workmojozip.onrender.com/api/v1';
  }
  return 'https://workmojozip.onrender.com/api/v1';
};

const getHealthUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '') + '/api/health';
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.')) {
      return `http://${host}:5000/api/health`;
    }
    return 'https://workmojozip.onrender.com/api/health';
  }
  return 'https://workmojozip.onrender.com/api/health';
};

const API_BASE_URL = getApiBaseUrl();

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(getHealthUrl());
      return await res.json();
    } catch {
      return { status: 'offline', mode: 'demo_fallback' };
    }
  },

  // Auth
  sendOtp: async (phone: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    return await res.json();
  },

  verifyOtp: async (phone: string, otp: string, name?: string, gender?: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, name, gender }),
    });
    return await res.json();
  },

  // Worker Directory
  getWorkerDirectory: async (filters?: any) => {
    const query = new URLSearchParams(filters || {}).toString();
    const res = await fetch(`${API_BASE_URL}/workers/directory?${query}`);
    return await res.json();
  },

  inviteWorker: async (workerId: string, jobId: string, employerName: string) => {
    const res = await fetch(`${API_BASE_URL}/workers/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId, jobId, employerName }),
    });
    return await res.json();
  },

  // Jobs
  getJobs: async () => {
    const res = await fetch(`${API_BASE_URL}/jobs`);
    return await res.json();
  },

  postJob: async (jobData: any) => {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    return await res.json();
  },

  applyForJob: async (jobId: string, workerId: string) => {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId }),
    });
    return await res.json();
  },

  confirmWorker: async (jobId: string, workerId: string) => {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}/confirm-worker`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId }),
    });
    return await res.json();
  },

  // Attendance
  getAttendance: async (jobId: string) => {
    const res = await fetch(`${API_BASE_URL}/attendance/${jobId}`);
    return await res.json();
  },

  checkInAttendance: async (jobId: string, workerId: string, qrToken?: string, lat?: number, lng?: number) => {
    const res = await fetch(`${API_BASE_URL}/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, workerId, qrToken, lat, lng }),
    });
    return await res.json();
  },

  checkOutAttendance: async (jobId: string, workerId: string) => {
    const res = await fetch(`${API_BASE_URL}/attendance/check-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, workerId }),
    });
    return await res.json();
  },

  // Protected Payments
  authorizePayment: async (paymentData: any) => {
    const res = await fetch(`${API_BASE_URL}/payments/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    return await res.json();
  },

  releasePayment: async (paymentId: string, utrNumber?: string) => {
    const res = await fetch(`${API_BASE_URL}/payments/${paymentId}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utrNumber }),
    });
    return await res.json();
  },

  disputePayment: async (paymentId: string, reason: string, details?: string, reportedBy?: string) => {
    const res = await fetch(`${API_BASE_URL}/payments/${paymentId}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, details, reportedBy }),
    });
    return await res.json();
  },

  // Admin
  getAdminOverview: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/overview`);
    return await res.json();
  },

  // Mojo AI Assistant
  chatWithMojo: async (
    message: string,
    language: string = 'en',
    role: string = 'worker',
    context?: any
  ) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language, role, context }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`AI API returned status ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.warn('[api.chatWithMojo] Request failed:', err);
      return {
        success: false,
        error: err.name === 'AbortError' ? 'timeout' : 'network_failure',
        reply: null,
      };
    }
  },

  // Machine Learning: Worker–Job Matching API (Random Forest)
  getMLDiagnostics: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/match/diagnostics`);
      return await res.json();
    } catch {
      return { success: false, mode: 'offline_fallback' };
    }
  },

  predictMatch: async (worker: any, job: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/match/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker, job }),
      });
      return await res.json();
    } catch {
      return { success: false, mode: 'offline_fallback' };
    }
  },

  rankWorkersForJob: async (workers: any[], job: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/match/rank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workers, job }),
      });
      return await res.json();
    } catch {
      return { success: false, mode: 'offline_fallback' };
    }
  },

  getJobCandidates: async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/match/jobs/${jobId}/candidates`);
      return await res.json();
    } catch {
      return { success: false, mode: 'offline_fallback' };
    }
  },
};
