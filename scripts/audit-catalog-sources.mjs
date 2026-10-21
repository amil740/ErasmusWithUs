import { appendFileSync } from 'node:fs'

const apiBaseUrl = (process.env.API_BASE_URL ?? 'https://erasmuswithus-api.onrender.com').replace(/\/$/, '')
const staleAfterDays = Number(process.env.STALE_AFTER_DAYS ?? 90)
const timeoutMs = 60_000

async function loadSources() {
  const response = await fetch(`${apiBaseUrl}/api/sources/status`, {
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) throw new Error(`Source catalogue endpoint returned HTTP ${response.status}.`)

  const payload = await response.json()
  if (!Array.isArray(payload)) throw new Error('Source catalogue endpoint did not return a list.')
  return payload.map((item) => ({
    university: item.university ?? item.University ?? 'Unknown university',
    url: item.sourceUrl ?? item.SourceUrl,
    lastReviewed: item.lastVerifiedAt ?? item.LastVerifiedAt,
    verificationStatus: item.verificationStatus ?? item.VerificationStatus ?? 'Unknown',
  }))
}

async function checkSource(source) {
  if (!source.url) return { ...source, status: 'missing URL', reachable: false }

  try {
    let response = await fetch(source.url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    })

    if ([403, 405, 501].includes(response.status)) {
      response = await fetch(source.url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
      })
      await response.body?.cancel()
    }

    return { ...source, status: `HTTP ${response.status}`, reachable: response.ok }
  } catch (error) {
    return { ...source, status: error instanceof Error ? error.message : 'Request failed', reachable: false }
  }
}

const sources = await loadSources()
const queue = [...sources]
const results = []
await Promise.all(Array.from({ length: 5 }, async () => {
  while (queue.length > 0) {
    const source = queue.shift()
    results.push(await checkSource(source))
  }
}))

const now = Date.now()
const report = results.map((result) => {
  const reviewedAt = Date.parse(result.lastReviewed ?? '')
  const ageDays = Number.isNaN(reviewedAt) ? null : Math.floor((now - reviewedAt) / 86_400_000)
  const stale = ageDays === null || ageDays > staleAfterDays
  return { ...result, ageDays, stale }
}).sort((a, b) => a.university.localeCompare(b.university))

const needsAttention = report.filter((item) => !item.reachable || item.stale)
const lines = [
  '## ErasmusWithUs source link audit',
  '',
  `Checked ${report.length} source links. ${needsAttention.length} require review.`,
  '',
  '> This check verifies URL availability and review-date freshness only. It does not confirm that deadlines, GPA requirements, grants, or other opportunity details are correct.',
  '',
  '| University | Link check | Source | Review date | Record status |',
  '| --- | --- | --- | --- | --- |',
  ...report.map((item) => {
    const url = item.url ? `[source](${item.url.replaceAll(')', '%29')})` : 'missing'
    const reviewed = item.ageDays === null ? 'missing date' : `${item.lastReviewed} (${item.ageDays} days old${item.stale ? ', stale' : ''})`
    return `| ${item.university.replaceAll('|', '\\|')} | ${item.status} ${item.reachable ? '✓' : '✗'} | ${url} | ${reviewed} | ${item.verificationStatus} |`
  }),
]

const summary = `${lines.join('\n')}\n`
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary)
else process.stdout.write(summary)

if (needsAttention.length > 0) {
  console.error(`${needsAttention.length} source records need human review.`)
  process.exitCode = 1
}
