'use client'

import { useCallback, useEffect, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import {
  fetchAdminSportsSyncStatus,
  runAdminSportsSync,
  type SportsSyncStatus,
  type SportsSyncSummary,
} from '@/lib/admin-send-campaigns'
import { interpolate, languageToIntlLocale } from '@/lib/i18n'

function formatDate(value: string | null, locale: string) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function AdminSportsSync() {
  const { language, messages } = useLanguage()
  const copy = messages.dashboard.sportsSync
  const locale = languageToIntlLocale(language)
  const [status, setStatus] = useState<SportsSyncStatus | null>(null)
  const [summary, setSummary] = useState<SportsSyncSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const payload = await fetchAdminSportsSyncStatus(copy.loadError)
      setStatus(payload.status)
      setError('')
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.loadError)
    } finally {
      setLoading(false)
    }
  }, [copy.loadError])

  useEffect(() => {
    void load()
  }, [load])

  const run = async (force: boolean) => {
    setRunning(true)
    setError('')

    try {
      const payload = await runAdminSportsSync(copy.loadError, force)
      setSummary(payload.summary)
      setStatus(payload.status)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : copy.loadError)
    } finally {
      setRunning(false)
    }
  }

  return (
    <section className="tr-shell p-6 sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="tr-eyebrow">{messages.dashboard.adminBadge}</p>
          <h2 className="mt-2 text-2xl">{copy.title}</h2>
          <p className="tr-copy mt-2 max-w-2xl text-sm">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void run(false)}
            disabled={running}
            className="tr-btn-primary tr-btn-sm"
          >
            {running ? copy.running : copy.runButton}
          </button>
          <button
            type="button"
            onClick={() => void run(true)}
            disabled={running}
            className="tr-btn-secondary tr-btn-sm"
          >
            {copy.forceButton}
          </button>
        </div>
      </div>

      {status ? (
        <p className="tr-alert-info mt-5">
          {interpolate(copy.providerNote, {
            model: status.model,
            days: status.fetchWindowDays,
            hours: status.ttlHours,
          })}
        </p>
      ) : null}

      {error ? <p className="tr-alert-error mt-5">{error}</p> : null}

      {summary ? (
        <p className="tr-alert-success mt-5">
          {interpolate(copy.summary, {
            targets: summary.targets,
            fetched: summary.fetched,
            skipped: summary.skipped,
            failed: summary.failed,
            events: summary.eventsUpserted,
          })}
        </p>
      ) : null}

      {loading && !status ? (
        <p className="tr-meta mt-5">{messages.common.loading}</p>
      ) : status ? (
        <>
          <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="tr-card-muted p-4">
              <dt className="tr-eyebrow">{copy.eventCount}</dt>
              <dd className="mt-1 text-2xl font-extrabold text-trimry-ink">{status.eventCount}</dd>
            </div>
            <div className="tr-card-muted p-4">
              <dt className="tr-eyebrow">{copy.upcomingCount}</dt>
              <dd className="mt-1 text-2xl font-extrabold text-trimry-ink">{status.upcomingCount}</dd>
            </div>
            <div className="tr-card-muted p-4">
              <dt className="tr-eyebrow">{copy.lastFetched}</dt>
              <dd className="mt-1 text-sm font-bold text-trimry-ink">
                {formatDate(status.lastFetchedAt, locale)}
              </dd>
              <dd className="tr-meta text-xs">TTL {status.ttlHours}h · {status.provider} / {status.model}</dd>
            </div>
          </dl>

          <h3 className="mt-8 text-base text-trimry-ink">{copy.statesTitle}</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-trimry-muted">
                <tr>
                  <th className="py-2 pr-4">Target</th>
                  <th className="py-2 pr-4">Kind</th>
                  <th className="py-2 pr-4">Events</th>
                  <th className="py-2 pr-4">{copy.lastFetched}</th>
                  <th className="py-2">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-trimry-line">
                {status.states.map((state) => (
                  <tr key={state.id}>
                    <td className="py-2 pr-4 font-semibold text-trimry-ink">{state.label}</td>
                    <td className="py-2 pr-4 text-trimry-slate">{state.kind}</td>
                    <td className="py-2 pr-4 text-trimry-slate">{state.lastEventCount}</td>
                    <td className="py-2 pr-4 text-trimry-slate">
                      {formatDate(state.lastSucceededAt ?? state.lastFetchedAt, locale)}
                    </td>
                    <td className="py-2 text-xs text-rose-600">{state.lastError ?? ''}</td>
                  </tr>
                ))}
                {status.states.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-trimry-muted">
                      —
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  )
}
