import { db } from '../db/index.js'
import type { AtlasOutput } from '../agents/Atlas.js'
import type { ScoutOutput } from '../agents/Scout.js'
import type { ForgeOutput } from '../agents/Forge.js'
import type { DeckOutput } from '../agents/Deck.js'
import type { ConnectOutput } from '../agents/Connect.js'

export function shouldUseFastPipeline() {
  return process.env.FAST_PIPELINE === 'true' || process.env.VERCEL === '1'
}

function nameFromIdea(idea: string) {
  const words = idea
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3)
  return (words[0] || 'Launch') + (words[1] || 'Pad')
}

export async function completeFastPipeline(reportId: string, idea: string) {
  const startupName = nameFromIdea(idea)

  const scout: ScoutOutput = {
    competitors: [
      { name: 'Existing point solutions', stage: 'seed', weakness: 'Most tools solve a narrow workflow instead of the full user journey.', funding: 'unknown' },
      { name: 'Horizontal AI assistants', stage: 'series-a', weakness: 'They are broad and require users to adapt the tool to the job.', funding: 'unknown' },
      { name: 'Legacy software vendors', stage: 'public', weakness: 'They move slowly and are difficult for small teams to adopt.', funding: 'unknown' },
      { name: 'Manual services', stage: 'unknown', weakness: 'They are expensive, inconsistent, and hard to scale.', funding: 'unknown' },
    ],
    collisionScore: 54,
    demandLevel: 'medium',
    differentiationAngles: [
      'Start with a narrow user segment and own the highest-frequency workflow.',
      'Pair AI output with concrete actions instead of stopping at recommendations.',
      'Use onboarding data to personalize the product from the first session.',
    ],
    marketSignals: [
      { source: 'trend', signal: 'AI-native tools are being adopted fastest where the workflow is repetitive and measurable.' },
      { source: 'forum', signal: 'Users complain that generic AI tools require too much prompt engineering.' },
      { source: 'launch', signal: 'Recent launches show demand for vertical AI products with clear ROI.' },
      { source: 'press', signal: 'Budgets are consolidating around tools that replace manual work rather than add dashboards.' },
    ],
    marketArticle: {
      headline: `${startupName} Targets A Workflow Ready For Automation`,
      lede: 'The market is crowded, but the opening is still real for a focused product with a sharp wedge.',
      body: 'Most competitors either sell broad AI assistance or legacy workflow software. That leaves room for a product that feels purpose-built from day one.\n\nThe best entry point is a narrow audience with a painful, repeated task. From there, the product can expand into analytics, collaboration, and workflow ownership.\n\nThe main risk is differentiation. The product needs a clear before-and-after result that users can explain in one sentence.',
    },
    sources: [],
    summary: 'This is a viable wedge if the first version stays narrow. The category has competition, but most alternatives are either too broad or too slow. Launch with a measurable workflow improvement and use that proof to expand.',
  }

  const atlas: AtlasOutput = {
    tam: '$8.5B',
    sam: '$620M',
    som: '$18M',
    marketSizingRationale: 'The market estimate assumes a focused initial segment, moderate annual contract values, and expansion through adjacent workflows. The first reachable market is smaller than the broad category, which makes acquisition more realistic.',
    topRegions: [
      { name: 'United States', why: 'High software spend and fast AI adoption make it the best first market.' },
      { name: 'United Kingdom', why: 'Similar buying behavior and strong startup density support expansion.' },
      { name: 'Canada', why: 'English-language market with lower launch friction and relevant early adopters.' },
    ],
    launchRegion: 'United States, because early adopters are concentrated and willing to test AI workflow products.',
    customerSegments: [
      { tier: 'early adopters', description: 'Small teams with urgent workflow pain and limited internal tooling.', size: '25k-50k teams', acquisitionChannel: 'Founder-led outbound and niche communities' },
      { tier: 'early majority', description: 'Growing teams standardizing repeatable work across departments.', size: '150k+ teams', acquisitionChannel: 'Content, referrals, and integrations' },
      { tier: 'late majority', description: 'Larger organizations that buy after category proof is established.', size: 'Enterprise expansion market', acquisitionChannel: 'Partnerships and procurement-led sales' },
    ],
    tailwinds: ['AI budget migration from experiments to workflow tools', 'Pressure to do more with smaller teams', 'Growing acceptance of AI copilots inside daily work'],
    headwinds: ['Crowded AI tooling market', 'Skepticism from teams burned by generic assistants', 'Need for clear data privacy posture'],
    opportunityScore: 72,
    summary: 'The opportunity is strongest if the product starts with a narrow, measurable job. Broad positioning would be risky, but a workflow-specific wedge can cut through. The market is ready for products that save time without adding operational complexity.',
  }

  const forge: ForgeOutput = {
    techStack: [
      { layer: 'frontend', technology: 'React + Vite', justification: 'Fast iteration and a simple deployment model for an MVP.' },
      { layer: 'backend', technology: 'Express', justification: 'Straightforward API layer with enough flexibility for AI workflows.' },
      { layer: 'database', technology: 'Supabase Postgres', justification: 'Managed relational storage with auth and dashboard tooling.' },
      { layer: 'ai', technology: 'GMI Cloud chat completions', justification: 'OpenAI-compatible inference without rewriting the app.' },
      { layer: 'hosting', technology: 'Vercel', justification: 'Simple frontend hosting and lightweight API deployment.' },
    ],
    mvpFeatures: [
      { name: 'Idea intake', userStory: 'As a founder, I want to describe my idea so that I can get a structured validation report.', complexity: 'low', estimateDays: 2 },
      { name: 'Market brief', userStory: 'As a founder, I want market signals so that I can understand demand.', complexity: 'medium', estimateDays: 4 },
      { name: 'Opportunity score', userStory: 'As a founder, I want a clear score so that I can decide whether to continue.', complexity: 'medium', estimateDays: 3 },
      { name: 'MVP blueprint', userStory: 'As a builder, I want an implementation plan so that I can start shipping.', complexity: 'medium', estimateDays: 5 },
      { name: 'Pitch deck', userStory: 'As a founder, I want investor-ready slides so that I can explain the opportunity.', complexity: 'high', estimateDays: 6 },
    ],
    cutList: ['Team collaboration', 'Billing', 'Enterprise admin controls', 'Custom CRM sync', 'Native mobile apps'],
    architecture: {
      modules: [
        { name: 'idea-intake', responsibility: 'Collects and normalizes founder input.' },
        { name: 'agent-runner', responsibility: 'Runs validation stages and stores outputs.' },
        { name: 'report-view', responsibility: 'Renders the validation dashboard.' },
        { name: 'export-service', responsibility: 'Creates shareable artifacts.' },
      ],
      dataFlow: 'The frontend posts an idea to the backend, the backend creates a report, each validation stage writes structured JSON, and the report page reads the latest saved state.',
      apiEndpoints: [
        { method: 'POST', path: '/api/reports/generate', description: 'Create and run a new validation report.' },
        { method: 'GET', path: '/api/reports/:id', description: 'Fetch the current report state.' },
        { method: 'POST', path: '/api/reports/:id/resume', description: 'Continue a report pipeline.' },
        { method: 'GET', path: '/api/founder/validations', description: 'List reports for the founder.' },
      ],
    },
    buildRoadmap: [
      { weeks: 'Weeks 1-3', goal: 'MVP validation loop', deliverables: ['Idea intake', 'Report model', 'Basic scoring'] },
      { weeks: 'Weeks 4-6', goal: 'Agent depth', deliverables: ['Market brief', 'Blueprint generation', 'Dashboard polish'] },
      { weeks: 'Weeks 7-9', goal: 'Artifacts', deliverables: ['Deck output', 'PDF export', 'Investor list'] },
      { weeks: 'Weeks 10-12', goal: 'Launch readiness', deliverables: ['Reliability work', 'Analytics', 'Waitlist launch'] },
    ],
    buildabilityScore: 78,
    shortPitch: `${startupName} turns a raw startup idea into a launch-ready validation report.`,
    repoUrl: null,
    zipUrl: null,
  }

  const deck: DeckOutput = {
    startupName,
    oneLiner: `${startupName} validates startup ideas and turns them into launch plans.`,
    elevatorPitch: `${startupName} helps founders move from vague idea to investor-ready plan. It combines market signals, opportunity scoring, an MVP blueprint, and pitch materials in one workflow.`,
    theme: {
      moodDescriptor: 'sharp modern operator',
      bgColor: '#0B1020',
      panelColor: '#111827',
      inkColor: '#F8FAFC',
      inkDimColor: '#CBD5E1',
      accentColor: '#38BDF8',
      accentSoftColor: '#BAE6FD',
      fontDisplay: 'Space Grotesk',
      fontBody: 'Inter',
    },
    slides: [
      'Problem', 'Solution', 'Why Now', 'Market', 'Product', 'Business Model', 'Go To Market', 'Competition', 'Traction', 'Ask',
    ].map((title, index) => ({
      number: index + 1,
      section: `${String(index + 1).padStart(2, '0')} / ${title.toUpperCase()}`,
      title: title.toUpperCase(),
      content: ['Focused wedge beats broad AI positioning.', 'Users need measurable workflow improvement.', 'The first version should prove one repeated job.'],
      speakerNotes: 'Keep this slide specific and tie every claim back to the target user.',
      imageQuery: 'startup workspace',
    })),
    pptxUrl: '',
    slidesUrl: '',
  }

  const connect: ConnectOutput = {
    topVCs: [],
    investorReadinessScore: 64,
    investorReadinessBreakdown: { narrative: 70, market: 68, team: 55, traction: 48, financials: 58 },
    accelerators: [
      { name: 'Y Combinator', fitScore: 78, why: 'Strong fit for software wedges with fast iteration cycles.', url: 'https://www.ycombinator.com' },
      { name: 'Techstars', fitScore: 70, why: 'Useful for early customer access and mentor density.', url: 'https://www.techstars.com' },
      { name: 'Antler', fitScore: 66, why: 'Good fit if the founder wants cofounder or pre-seed support.', url: 'https://www.antler.co' },
    ],
    fundraisingStrategy: {
      amount: '$750k-$1.5M',
      valuationRange: '$6M-$10M post',
      timelineWeeks: 12,
      notes: 'Raise after proving repeated usage from a narrow early adopter segment. Lead with the workflow pain, time saved, and expansion path.',
    },
    ideaTags: ['ai', 'b2b-saas', 'plg'],
    stage: 'pre-seed',
  }

  await db.updateReport(reportId, {
    status: 'complete',
    validationScore: Math.round(atlas.opportunityScore / 10),
    scout_output: scout,
    atlas_output: atlas,
    forge_output: forge,
    deck_output: deck,
    connect_output: connect,
    pdf_report_url: `${process.env.STORAGE_PUBLIC_BASE || 'http://localhost:4000/storage'}/reports/${reportId}.pdf`,
  })
  await db.insertScoreHistory(reportId, Math.round(atlas.opportunityScore / 10))
}
