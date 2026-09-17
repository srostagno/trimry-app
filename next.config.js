/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // The pt "time" intent moved from que-horas-joga to horario-do-jogo:
      // Brazilians search "horário do jogo do X" (110k/mo) and almost never
      // "que horas joga o X" (3.6k/mo). Keeps any crawled URL from 404ing.
      {
        source: '/pt/:country/que-horas-joga/:slug',
        destination: '/pt/:country/horario-do-jogo/:slug',
        permanent: true,
      },
      // The hub lives at the intent with no slug, and it was in the sitemap
      // too, so it needs its own rule: :slug does not match an empty segment.
      {
        source: '/pt/:country/que-horas-joga',
        destination: '/pt/:country/horario-do-jogo',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
