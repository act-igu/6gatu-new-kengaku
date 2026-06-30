import { useEffect, useState, type ReactNode } from 'react';
import type { Candidate, Gender } from '../types';
import {
  formatDate,
  fromDatetimeLocalValue,
  resolveGenderLabel,
  siteTags,
  supportCategories,
  toDatetimeLocalValue,
} from '../data/mockData';

interface DetailPaneProps {
  candidate: Candidate | null;
  onSave: (candidate: Candidate) => void;
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

export function DetailPane({ candidate, onSave }: DetailPaneProps) {
  const [draft, setDraft] = useState<Candidate | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (candidate) {
      setDraft(structuredClone(candidate));
      setDirty(false);
    } else {
      setDraft(null);
      setDirty(false);
    }
  }, [candidate?.id, candidate?.updated_at]);

  if (!candidate || !draft) {
    return (
      <section className="pane pane-detail">
        <header className="detail-header">
          <h2 className="pane-title">詳細情報</h2>
        </header>
        <p className="empty-message">候補者を選択してください</p>
      </section>
    );
  }

  const p = draft.pane3;

  const updatePane3 = <K extends keyof typeof p>(
    key: K,
    value: (typeof p)[K],
  ) => {
    setDraft((prev) =>
      prev
        ? { ...prev, pane3: { ...prev.pane3, [key]: value } }
        : prev,
    );
    setDirty(true);
  };

  const updateSchedule = <K extends keyof Candidate['schedule']>(
    key: K,
    value: Candidate['schedule'][K],
  ) => {
    setDraft((prev) =>
      prev
        ? { ...prev, schedule: { ...prev.schedule, [key]: value } }
        : prev,
    );
    setDirty(true);
  };

  const toggleSiteTag = (code: string) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const tags = prev.site_tags.includes(code)
        ? prev.site_tags.filter((t) => t !== code)
        : [...prev.site_tags, code];
      return { ...prev, site_tags: tags };
    });
    setDirty(true);
  };

  const handleSave = () => {
    if (draft) onSave(draft);
    setDirty(false);
  };

  return (
    <section className="pane pane-detail">
      <header className="detail-header">
        <h2 className="pane-title">詳細情報</h2>
        <button
          type="button"
          className="btn-save"
          disabled={!dirty}
          onClick={handleSave}
        >
          保存
        </button>
      </header>

      <div className="detail-section">
        <h3 className="section-title">受付・基本</h3>
        <FieldRow label="受付日">
          <span className="readonly-value">{formatDate(draft.created_at)}</span>
        </FieldRow>
        <FieldRow label="表示名">
          <input
            type="text"
            value={p.display_name}
            onChange={(e) => updatePane3('display_name', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="主連絡先">
          <input
            type="tel"
            value={p.phone_primary}
            onChange={(e) => updatePane3('phone_primary', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="二次連絡先">
          <input
            type="text"
            placeholder="氏名（例: 田中 花子・母）"
            value={p.contact_secondary_name}
            onChange={(e) =>
              updatePane3('contact_secondary_name', e.target.value)
            }
          />
          <input
            type="tel"
            className="field-sub-input"
            placeholder="電話番号"
            value={p.phone_secondary}
            onChange={(e) => updatePane3('phone_secondary', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="性別">
          <select
            value={p.gender}
            onChange={(e) => updatePane3('gender', e.target.value as Gender)}
          >
            <option value="UNKNOWN">{resolveGenderLabel('UNKNOWN')}</option>
            <option value="MALE">{resolveGenderLabel('MALE')}</option>
            <option value="FEMALE">{resolveGenderLabel('FEMALE')}</option>
            <option value="OTHER">{resolveGenderLabel('OTHER')}</option>
          </select>
        </FieldRow>
        <FieldRow label="生年月日">
          <input
            type="date"
            value={p.date_of_birth ?? ''}
            onChange={(e) =>
              updatePane3('date_of_birth', e.target.value || null)
            }
          />
        </FieldRow>
        <FieldRow label="障害支援区分">
          <select
            value={p.support_category}
            onChange={(e) => updatePane3('support_category', e.target.value)}
          >
            {supportCategories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.label}
              </option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="拠点タグ">
          <div className="tag-checkboxes">
            {siteTags.map((tag) => (
              <label key={tag.code} className="tag-checkbox">
                <input
                  type="checkbox"
                  checked={draft.site_tags.includes(tag.code)}
                  onChange={() => toggleSiteTag(tag.code)}
                />
                {tag.label}
              </label>
            ))}
          </div>
        </FieldRow>
      </div>

      <div className="detail-section">
        <h3 className="section-title">スケジュール</h3>
        <FieldRow label="見学日時">
          <input
            type="datetime-local"
            value={toDatetimeLocalValue(draft.schedule.tour_datetime)}
            onChange={(e) =>
              updateSchedule(
                'tour_datetime',
                fromDatetimeLocalValue(e.target.value),
              )
            }
          />
        </FieldRow>
        <FieldRow label="入居予定日">
          <input
            type="date"
            value={draft.schedule.move_in_planned_date ?? ''}
            onChange={(e) =>
              updateSchedule(
                'move_in_planned_date',
                e.target.value || null,
              )
            }
          />
        </FieldRow>
      </div>

      <div className="detail-section">
        <h3 className="section-title">本人・基本</h3>
        <FieldRow label="正式氏名">
          <input
            type="text"
            placeholder="未設定"
            value={p.official_name}
            onChange={(e) => updatePane3('official_name', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="住所・居住状況">
          <textarea
            placeholder="未設定"
            rows={3}
            value={p.address_situation}
            onChange={(e) => updatePane3('address_situation', e.target.value)}
          />
        </FieldRow>
      </div>

      <div className="detail-section">
        <h3 className="section-title">相談支援・紹介経路</h3>
        <FieldRow label="専門員氏名">
          <input
            type="text"
            placeholder="未設定"
            value={p.specialist_name}
            onChange={(e) => updatePane3('specialist_name', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="事業所名">
          <input
            type="text"
            placeholder="未設定"
            value={p.specialist_office}
            onChange={(e) => updatePane3('specialist_office', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="専門員電話">
          <input
            type="tel"
            placeholder="未設定"
            value={p.specialist_phone}
            onChange={(e) => updatePane3('specialist_phone', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="専門員メール">
          <input
            type="email"
            placeholder="未設定"
            value={p.specialist_email}
            onChange={(e) => updatePane3('specialist_email', e.target.value)}
          />
        </FieldRow>
        <FieldRow label="紹介・問い合わせ経路">
          <textarea
            placeholder="未設定"
            rows={2}
            value={p.referral_route}
            onChange={(e) => updatePane3('referral_route', e.target.value)}
          />
        </FieldRow>
      </div>
    </section>
  );
}
