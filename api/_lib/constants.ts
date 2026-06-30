import type { DocumentDefinition, DocumentItemState } from './types';

export const CURRENT_STAFF_ID = '7b2c1f0a-3e4d-4c5b-9a8f-1e2d3c4b5a60';
export const VIEWER_STAFF_ID = '91de4c3b-2a10-4f9e-8c7d-6b5a40392817';

export const documentDefinitions: DocumentDefinition[] = [
  { code: 'SERVICE_PLAN', label: 'サービス等利用計画' },
  { code: 'RECIPIENT_CERT', label: '受給者証' },
  { code: 'BURDEN_LIMIT', label: '利用者負担上限額管理結果表' },
  { code: 'ASSESSMENT', label: 'アセスメントシート' },
  { code: 'CONTRACT', label: '契約書類' },
  { code: 'BANK_ACCOUNT', label: '口座情報' },
  { code: 'PERSONAL_ID', label: '本人確認書類' },
  { code: 'MONITORING_CONSENT', label: 'モニタリング同意書' },
];

export function createDefaultDocuments(): DocumentItemState[] {
  return documentDefinitions.map((d) => ({
    code: d.code,
    checked: false,
    checked_at: null,
  }));
}
