import type { Candidate, Staff, StatusCode } from '../types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `API が JSON 以外を返しました（${res.status}）。npm run dev で API サーバーが起動しているか確認してください。`,
    );
  }
  if (!res.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : `API error (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function checkHealth(): Promise<{ ok: boolean; message: string }> {
  return request(`${API_BASE}/health`);
}

export async function fetchStaff(): Promise<Staff[]> {
  return request(`${API_BASE}/staff`);
}

export async function fetchCandidates(): Promise<Candidate[]> {
  return request(`${API_BASE}/candidates`);
}

export async function createCandidate(ownerStaffId: string): Promise<Candidate> {
  return request(`${API_BASE}/candidates`, {
    method: 'POST',
    body: JSON.stringify({ owner_staff_id: ownerStaffId }),
  });
}

export async function updateCandidate(candidate: Candidate): Promise<Candidate> {
  return request(`${API_BASE}/candidates/${candidate.id}`, {
    method: 'PATCH',
    body: JSON.stringify(candidate),
  });
}

export async function updateCandidateStatus(
  id: string,
  status: StatusCode,
): Promise<Candidate> {
  return request(`${API_BASE}/candidates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function appendMemo(
  id: string,
  body: string,
  authorStaffId: string,
): Promise<Candidate> {
  return request(`${API_BASE}/candidates/${id}/memos`, {
    method: 'POST',
    body: JSON.stringify({ body, author_staff_id: authorStaffId }),
  });
}
