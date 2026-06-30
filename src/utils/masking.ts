import type { Role } from '../types';

export function maskPhone(phone: string, role: Role): string {
  if (!phone || role === 'editor') return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `****-****-${digits.slice(-4)}`;
}

export function maskOfficialName(name: string, role: Role): string {
  if (!name || role === 'editor') return name;
  return '（閲覧者には非表示）';
}

export function maskContactName(name: string, role: Role): string {
  if (!name || role === 'editor') return name;
  return '（非表示）';
}

export function maskEmail(email: string, role: Role): string {
  if (!email || role === 'editor') return email;
  const at = email.indexOf('@');
  if (at <= 0) return '****';
  return `${email.slice(0, 1)}***${email.slice(at)}`;
}

export function maskAddress(address: string, role: Role): string {
  if (!address || role === 'editor') return address;
  return '（閲覧者には非表示）';
}

export function maskMemoBody(body: string, role: Role): string {
  if (role === 'editor') return body;
  return '（面談記録の閲覧権限がありません）';
}

export function maskDateOfBirth(dob: string | null, role: Role): string {
  if (!dob || role === 'editor') return dob ?? '';
  const year = dob.slice(0, 4);
  return `${year}-**-**`;
}
