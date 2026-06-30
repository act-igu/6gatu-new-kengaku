import type { ReactNode } from 'react';
import type { Candidate } from '../types';
import {
  resolveSiteTagLabels,
  resolveSupportCategoryLabel,
} from '../data/mockData';

interface DetailPaneProps {
  candidate: Candidate | null;
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="field-row">
      <label className="field-label">{label}</label>
      <div className="field-value">{children}</div>
    </div>
  );
}

export function DetailPane({ candidate }: DetailPaneProps) {
  if (!candidate) {
    return (
      <section className="pane pane-detail">
        <h2 className="pane-title">第3ペイン — 詳細情報</h2>
        <p className="empty-message">候補者を選択してください</p>
      </section>
    );
  }

  const p = candidate.pane3;

  return (
    <section className="pane pane-detail">
      <h2 className="pane-title">第3ペイン — 詳細情報</h2>

      <div className="detail-section">
        <h3 className="section-title">必須の最小セット</h3>
        <FieldRow label="表示名">
          <input type="text" defaultValue={p.display_name} />
        </FieldRow>
        <FieldRow label="主連絡先">
          <input type="tel" defaultValue={p.phone_primary} />
        </FieldRow>
        <FieldRow label="障害支援区分">
          <span className="readonly-value">
            {resolveSupportCategoryLabel(p.support_category)}
          </span>
        </FieldRow>
        <FieldRow label="拠点タグ">
          <span className="readonly-value">
            {resolveSiteTagLabels(candidate.site_tags)}
          </span>
        </FieldRow>
      </div>

      <div className="detail-section">
        <h3 className="section-title">本人・基本</h3>
        <FieldRow label="正式氏名">
          <input
            type="text"
            placeholder="未設定"
            defaultValue={p.official_name}
          />
        </FieldRow>
        <FieldRow label="住所・居住状況">
          <textarea
            placeholder="未設定"
            rows={3}
            defaultValue={p.address_situation}
          />
        </FieldRow>
      </div>

      <div className="detail-section">
        <h3 className="section-title">相談支援・紹介経路</h3>
        <FieldRow label="専門員氏名">
          <input
            type="text"
            placeholder="未設定"
            defaultValue={p.specialist_name}
          />
        </FieldRow>
        <FieldRow label="事業所名">
          <input
            type="text"
            placeholder="未設定"
            defaultValue={p.specialist_office}
          />
        </FieldRow>
        <FieldRow label="専門員電話">
          <input
            type="tel"
            placeholder="未設定"
            defaultValue={p.specialist_phone}
          />
        </FieldRow>
        <FieldRow label="専門員メール">
          <input
            type="email"
            placeholder="未設定"
            defaultValue={p.specialist_email}
          />
        </FieldRow>
        <FieldRow label="紹介・問い合わせ経路">
          <textarea
            placeholder="未設定"
            rows={2}
            defaultValue={p.referral_route}
          />
        </FieldRow>
      </div>
    </section>
  );
}
