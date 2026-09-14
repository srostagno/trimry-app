'use client'

import clsx from 'clsx'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useLanguage } from '@/components/language-provider'
import { interpolate } from '@/lib/i18n'
import {
  fetchLeaguesForSport,
  fetchSportsCatalog,
  searchTeams,
  type CatalogSport,
  type DigestFrequency,
  type LeaguePreference,
  type LeagueSearchResult,
  type SportKey,
  type SportsPreferences,
  type TeamPreference,
  type TeamSearchResult,
  MAX_LOOKAHEAD_DAYS,
} from '@/lib/sports'

export function useSportsCatalog() {
  const { language } = useLanguage()
  const [catalog, setCatalog] = useState<CatalogSport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    setLoading(true)

    fetchSportsCatalog(language)
      .then((payload) => {
        if (!cancelled) {
          setCatalog(payload.sports)
          setError('')
        }
      })
      .catch((nextError: unknown) => {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : 'Unable to load sports.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [language])

  return { catalog, loading, error }
}

export function sportLabelFromCatalog(catalog: CatalogSport[], sport: SportKey) {
  return catalog.find((entry) => entry.key === sport)?.label ?? sport
}

export function sportEmojiFromCatalog(catalog: CatalogSport[], sport: SportKey) {
  return catalog.find((entry) => entry.key === sport)?.emoji ?? '🏟️'
}

export function SportPicker({
  catalog,
  loading,
  value,
  onChange,
}: {
  catalog: CatalogSport[]
  loading: boolean
  value: SportKey[]
  onChange: (next: SportKey[]) => void
}) {
  if (loading && catalog.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-trimry-surface" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {catalog.map((sport) => {
        const active = value.includes(sport.key)

        return (
          <button
            key={sport.key}
            type="button"
            aria-pressed={active}
            onClick={() =>
              onChange(
                active ? value.filter((entry) => entry !== sport.key) : [...value, sport.key],
              )
            }
            className={clsx(
              'flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border p-3.5 text-left transition sm:p-4',
              active
                ? 'border-transparent bg-brand-gradient text-white shadow-glow'
                : 'border-trimry-line bg-white text-trimry-ink hover:border-trimry-blue/40',
            )}
          >
            <span className="text-2xl leading-none" aria-hidden="true">
              {sport.emoji}
            </span>
            <span className="min-w-0 break-words text-sm font-bold leading-tight">{sport.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function TeamBadge({ badge, name }: { badge: string | null; name: string }) {
  if (!badge) {
    return (
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-trimry-surface text-xs font-black text-trimry-slate">
        {name.slice(0, 2).toUpperCase()}
      </span>
    )
  }

  return (
    <Image
      src={badge}
      alt=""
      width={36}
      height={36}
      unoptimized
      className="h-9 w-9 shrink-0 rounded-full bg-white object-contain"
    />
  )
}

export function TeamSearch({
  sports,
  value,
  onChange,
}: {
  sports: SportKey[]
  value: TeamPreference[]
  onChange: (next: TeamPreference[]) => void
}) {
  const { language, messages } = useLanguage()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TeamSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const requestRef = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < 2) {
      setResults([])
      setSearched(false)
      return
    }

    const requestId = requestRef.current + 1
    requestRef.current = requestId
    setSearching(true)

    const timeout = window.setTimeout(() => {
      searchTeams(trimmed, sports.length === 1 ? sports[0] : null, language)
        .then((payload) => {
          if (requestRef.current !== requestId) {
            return
          }

          const filtered =
            sports.length > 1
              ? payload.teams.filter((team) => team.sport && sports.includes(team.sport))
              : payload.teams

          setResults(filtered.length > 0 ? filtered : payload.teams)
          setError('')
          setSearched(true)
        })
        .catch((nextError: unknown) => {
          if (requestRef.current !== requestId) {
            return
          }

          setError(nextError instanceof Error ? nextError.message : messages.notifications.error)
          setSearched(true)
        })
        .finally(() => {
          if (requestRef.current === requestId) {
            setSearching(false)
          }
        })
    }, 320)

    return () => window.clearTimeout(timeout)
  }, [language, messages.notifications.error, query, sports])

  const followedIds = useMemo(() => new Set(value.map((team) => team.id)), [value])

  const toggleTeam = (team: TeamSearchResult) => {
    if (!team.sport) {
      return
    }

    if (followedIds.has(team.id)) {
      onChange(value.filter((entry) => entry.id !== team.id))
      return
    }

    onChange([
      ...value,
      {
        id: team.id,
        name: team.name,
        sport: team.sport,
        leagueId: team.leagueId,
        leagueName: team.leagueName,
        badge: team.badge,
      },
    ])
  }

  return (
    <div className="space-y-4">
      <label className="tr-label">
        {messages.onboarding.teamsSearchLabel}
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={messages.onboarding.teamsSearchPlaceholder}
          className="tr-input mt-2"
          autoComplete="off"
        />
      </label>

      {searching ? <p className="tr-meta text-xs">{messages.onboarding.teamsSearching}</p> : null}
      {error ? <p className="tr-alert-error text-xs">{error}</p> : null}

      {results.length > 0 ? (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {results.map((team) => {
            const active = followedIds.has(team.id)

            return (
              <li key={team.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => toggleTeam(team)}
                  disabled={!team.sport}
                  className={clsx(
                    'grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-2xl border p-3 text-left transition',
                    active
                      ? 'border-trimry-blue bg-trimry-blue/5 ring-2 ring-trimry-blue/20'
                      : 'border-trimry-line bg-white hover:border-trimry-blue/40',
                  )}
                >
                  <TeamBadge badge={team.badge} name={team.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-trimry-ink">
                      {team.name}
                    </span>
                    <span className="block truncate text-xs text-trimry-muted">
                      {team.sportLabel}
                      {team.leagueName ? ` · ${team.leagueName}` : ''}
                      {team.country ? ` · ${team.country}` : ''}
                    </span>
                  </span>
                  <span
                    className={clsx(
                      'tr-badge shrink-0',
                      active ? 'tr-badge-blue' : 'tr-badge-slate',
                    )}
                  >
                    {active ? messages.onboarding.followedLabel : messages.onboarding.followLabel}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : searched && !searching ? (
        <p className="tr-meta text-sm">{messages.onboarding.teamsNoResults}</p>
      ) : null}

      {value.length > 0 ? (
        <div>
          <p className="tr-eyebrow mb-2">{messages.onboarding.teamsFollowing}</p>
          <ul className="flex flex-wrap gap-2">
            {value.map((team) => (
              <li key={team.id}>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((entry) => entry.id !== team.id))}
                  className="tr-chip tr-chip-active"
                  title={messages.onboarding.unfollowLabel}
                >
                  {team.name}
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function LeaguePicker({
  catalog,
  sports,
  value,
  onChange,
}: {
  catalog: CatalogSport[]
  sports: SportKey[]
  value: LeaguePreference[]
  onChange: (next: LeaguePreference[]) => void
}) {
  const { messages } = useLanguage()
  const [activeSport, setActiveSport] = useState<SportKey | null>(sports[0] ?? null)
  const [leagues, setLeagues] = useState<LeagueSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const followedIds = useMemo(() => new Set(value.map((league) => league.id)), [value])

  useEffect(() => {
    if (!activeSport || !sports.includes(activeSport)) {
      setActiveSport(sports[0] ?? null)
    }
  }, [activeSport, sports])

  useEffect(() => {
    if (!activeSport) {
      setLeagues([])
      return
    }

    let cancelled = false
    setLoading(true)

    fetchLeaguesForSport(activeSport)
      .then((payload) => {
        if (!cancelled) {
          setLeagues(payload.leagues)
        }
      })
      .catch(() => {
        if (!cancelled) {
          const featured =
            catalog
              .find((entry) => entry.key === activeSport)
              ?.featuredLeagues.map((league) => ({
                id: league.id,
                name: league.name,
                country: league.country,
                featured: true,
              })) ?? []
          setLeagues(featured)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeSport, catalog])

  const visibleLeagues = useMemo(() => {
    const normalizedFilter = filter.trim().toLowerCase()
    const filtered = normalizedFilter
      ? leagues.filter(
          (league) =>
            league.name.toLowerCase().includes(normalizedFilter) ||
            (league.country ?? '').toLowerCase().includes(normalizedFilter),
        )
      : leagues

    return [...filtered].sort((left, right) => {
      const leftFollowed = followedIds.has(left.id) ? 0 : 1
      const rightFollowed = followedIds.has(right.id) ? 0 : 1

      if (leftFollowed !== rightFollowed) {
        return leftFollowed - rightFollowed
      }

      if (left.featured !== right.featured) {
        return left.featured ? -1 : 1
      }

      return left.name.localeCompare(right.name)
    })
  }, [filter, followedIds, leagues])

  const toggleLeague = (league: LeagueSearchResult) => {
    if (!activeSport) {
      return
    }

    if (followedIds.has(league.id)) {
      onChange(value.filter((entry) => entry.id !== league.id))
      return
    }

    onChange([...value, { id: league.id, name: league.name, sport: activeSport }])
  }

  if (sports.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {sports.length > 1 ? (
        <div className="tr-chip-strip">
          {sports.map((sport) => (
            <button
              key={sport}
              type="button"
              onClick={() => {
                setActiveSport(sport)
                setFilter('')
              }}
              className={clsx('tr-chip', sport === activeSport && 'tr-chip-active')}
            >
              <span aria-hidden="true">{sportEmojiFromCatalog(catalog, sport)}</span>
              {sportLabelFromCatalog(catalog, sport)}
            </button>
          ))}
        </div>
      ) : null}

      <input
        type="search"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder={messages.onboarding.leaguesFilterPlaceholder}
        className="tr-input"
      />

      {loading && leagues.length === 0 ? (
        <p className="tr-meta text-xs">{messages.onboarding.leaguesLoading}</p>
      ) : (
        <ul className="grid grid-cols-1 max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {visibleLeagues.map((league) => {
            const active = followedIds.has(league.id)

            return (
              <li key={league.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => toggleLeague(league)}
                  className={clsx(
                    'grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition',
                    active
                      ? 'border-trimry-blue bg-trimry-blue/5 ring-2 ring-trimry-blue/20'
                      : 'border-trimry-line bg-white hover:border-trimry-blue/40',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-trimry-ink">
                      {league.name}
                    </span>
                    <span className="block truncate text-xs text-trimry-muted">
                      {league.country ?? ''}
                      {league.featured ? ` · ${messages.onboarding.featuredLabel}` : ''}
                    </span>
                  </span>
                  <span className={clsx('tr-badge shrink-0', active ? 'tr-badge-blue' : 'tr-badge-slate')}>
                    {active ? messages.onboarding.followedLabel : messages.onboarding.followLabel}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((league) => (
            <li key={league.id}>
              <button
                type="button"
                onClick={() => onChange(value.filter((entry) => entry.id !== league.id))}
                className="tr-chip tr-chip-active"
                title={messages.onboarding.unfollowLabel}
              >
                {league.name}
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function RhythmPicker({
  frequency,
  lookaheadDays,
  onFrequencyChange,
  onLookaheadChange,
}: {
  frequency: DigestFrequency
  lookaheadDays: number
  onFrequencyChange: (next: DigestFrequency) => void
  onLookaheadChange: (next: number) => void
}) {
  const { messages } = useLanguage()
  const options: Array<{ value: DigestFrequency; title: string; hint: string; icon: string }> = [
    {
      value: 'daily',
      title: messages.onboarding.frequencyDaily,
      hint: messages.onboarding.frequencyDailyHint,
      icon: '🌅',
    },
    {
      value: 'weekly',
      title: messages.onboarding.frequencyWeekly,
      hint: messages.onboarding.frequencyWeeklyHint,
      icon: '🗓️',
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <p className="tr-label mb-2">{messages.onboarding.frequencyLabel}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const active = option.value === frequency

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onFrequencyChange(option.value)}
                className={clsx(
                  'flex items-start gap-3 rounded-2xl border p-4 text-left transition',
                  active
                    ? 'border-trimry-blue bg-trimry-blue/5 ring-2 ring-trimry-blue/20'
                    : 'border-trimry-line bg-white hover:border-trimry-blue/40',
                )}
              >
                <span className="text-xl leading-none" aria-hidden="true">
                  {option.icon}
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-trimry-ink">{option.title}</span>
                  <span className="mt-1 block text-sm text-trimry-slate">{option.hint}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label htmlFor="lookahead-days" className="tr-label">
          {messages.onboarding.lookaheadLabel}
          <span className="ml-2 text-trimry-blue">
            {interpolate(messages.onboarding.lookaheadDays, { count: lookaheadDays })}
          </span>
        </label>
        <input
          id="lookahead-days"
          type="range"
          min={1}
          max={MAX_LOOKAHEAD_DAYS}
          value={lookaheadDays}
          onChange={(event) => onLookaheadChange(Number.parseInt(event.target.value, 10))}
          className="mt-3 w-full accent-trimry-blue"
        />
        <p className="tr-meta mt-1 text-xs">{messages.onboarding.lookaheadHint}</p>
      </div>
    </div>
  )
}

export function PreferencesSummary({
  catalog,
  preferences,
}: {
  catalog: CatalogSport[]
  preferences: SportsPreferences
}) {
  const { messages } = useLanguage()

  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="tr-card-muted p-4">
        <dt className="tr-eyebrow">{messages.onboarding.reviewSports}</dt>
        <dd className="mt-2 flex flex-wrap gap-1.5 text-sm text-trimry-ink">
          {preferences.sports.length > 0
            ? preferences.sports.map((sport) => (
                <span key={sport} className="tr-badge tr-badge-slate normal-case tracking-normal">
                  {sportEmojiFromCatalog(catalog, sport)} {sportLabelFromCatalog(catalog, sport)}
                </span>
              ))
            : '—'}
        </dd>
      </div>
      <div className="tr-card-muted p-4">
        <dt className="tr-eyebrow">{messages.onboarding.reviewLeagues}</dt>
        <dd className="mt-2 text-sm text-trimry-ink">
          {preferences.leagues.length > 0
            ? preferences.leagues.map((league) => league.name).join(', ')
            : messages.onboarding.skipTeamsHint}
        </dd>
      </div>
      <div className="tr-card-muted p-4">
        <dt className="tr-eyebrow">{messages.onboarding.reviewTeams}</dt>
        <dd className="mt-2 text-sm text-trimry-ink">
          {preferences.teams.length > 0
            ? preferences.teams.map((team) => team.name).join(', ')
            : '—'}
        </dd>
      </div>
    </dl>
  )
}

export function SportsPreferencesEditor({
  value,
  onChange,
}: {
  value: SportsPreferences
  onChange: (next: SportsPreferences) => void
}) {
  const { messages } = useLanguage()
  const { catalog, loading, error } = useSportsCatalog()

  const update = (patch: Partial<SportsPreferences>) => {
    const next = { ...value, ...patch }

    // Drop leagues and teams that no longer belong to a selected sport, and
    // make sure every followed league/team keeps its sport selected.
    const sports = new Set(next.sports)

    for (const league of next.leagues) {
      sports.add(league.sport)
    }

    for (const team of next.teams) {
      sports.add(team.sport)
    }

    onChange({ ...next, sports: Array.from(sports) })
  }

  return (
    <div className="space-y-8">
      {error ? <p className="tr-alert-error">{error}</p> : null}

      <section>
        <h3 className="text-lg text-trimry-ink">{messages.onboarding.sportsTitle}</h3>
        <p className="tr-meta mt-1">{messages.onboarding.sportsSubtitle}</p>
        <div className="mt-4">
          <SportPicker
            catalog={catalog}
            loading={loading}
            value={value.sports}
            onChange={(sports) =>
              update({
                sports,
                leagues: value.leagues.filter((league) => sports.includes(league.sport)),
                teams: value.teams.filter((team) => sports.includes(team.sport)),
              })
            }
          />
        </div>
      </section>

      {value.sports.length > 0 ? (
        <>
          <section>
            <h3 className="text-lg text-trimry-ink">{messages.onboarding.teamsSearchLabel}</h3>
            <p className="tr-meta mt-1">{messages.onboarding.teamsSubtitle}</p>
            <div className="mt-4">
              <TeamSearch
                sports={value.sports}
                value={value.teams}
                onChange={(teams) => update({ teams })}
              />
            </div>
          </section>

          <section>
            <h3 className="text-lg text-trimry-ink">{messages.onboarding.leaguesTitle}</h3>
            <p className="tr-meta mt-1">{messages.onboarding.leaguesHint}</p>
            <div className="mt-4">
              <LeaguePicker
                catalog={catalog}
                sports={value.sports}
                value={value.leagues}
                onChange={(leagues) => update({ leagues })}
              />
            </div>
          </section>
        </>
      ) : null}

      <section>
        <RhythmPicker
          frequency={value.frequency}
          lookaheadDays={value.lookaheadDays}
          onFrequencyChange={(frequency) => update({ frequency })}
          onLookaheadChange={(lookaheadDays) => update({ lookaheadDays })}
        />
      </section>
    </div>
  )
}
