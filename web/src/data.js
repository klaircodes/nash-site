import marks from './marks.json';
import gmail from './assets/marks/gmail.svg?raw';
import drive from './assets/marks/drive.svg?raw';
import calendar from './assets/marks/calendar.svg?raw';
import chat from './assets/marks/chat.svg?raw';

export const MARKS = marks;

const M = (name, ...tiers) => ({ name, tiers });
/* providers and models from librechat.yaml, names as the picker formats them */
export const PROVIDERS = [
  { label: 'OpenAI', value: 'openai', models: [M('GPT 5', 'powerful'), M('GPT 5 Chat', 'powerful'), M('GPT 5 Codex', 'powerful'), M('GPT 5 mini', 'fast'), M('GPT 5 nano', 'fast'), M('GPT 4.1', 'powerful'), M('GPT 4.1 mini', 'fast'), M('GPT 4.1 nano', 'fast'), M('GPT 4o'), M('GPT 4o mini', 'fast'), M('o3', 'powerful'), M('o3 pro', 'powerful'), M('o4 mini', 'fast'), M('GPT 4.5', 'powerful')] },
  { label: 'Anthropic', value: 'anthropic', models: [M('Claude Opus 4.7', 'powerful'), M('Claude Opus 4.6', 'powerful'), M('Claude Opus 4.5', 'powerful'), M('Claude Opus 4.1', 'powerful'), M('Claude Opus 4', 'powerful'), M('Claude Sonnet 4.6'), M('Claude Sonnet 4.5'), M('Claude Sonnet 4'), M('Claude Haiku 4.5', 'fast')] },
  { label: 'Google', value: 'google', models: [M('Gemini 3.1 Pro Preview', 'powerful'), M('Gemini 3.1 Flash Lite Preview', 'fast'), M('Gemini 3 Flash Preview', 'fast'), M('Gemini 2.5 Pro', 'powerful'), M('Gemini 2.5 Flash', 'fast'), M('Gemini 2.5 Flash Lite', 'fast')] },
  { label: 'xAI', value: 'xai', models: [M('Grok 4.20 Reasoning', 'powerful'), M('Grok 4.20 Non Reasoning'), M('Grok 4.20 Multi Agent', 'powerful'), M('Grok 4.1 Fast Reasoning', 'fast'), M('Grok 4.1 Fast Non Reasoning', 'fast'), M('Grok 4 Fast Reasoning', 'fast'), M('Grok 4 Fast Non Reasoning', 'fast'), M('Grok 4', 'powerful'), M('Grok 3'), M('Grok 3 mini', 'fast')] },
  { label: 'AWS Bedrock', value: 'bedrock', models: [M('Claude Opus 4.1', 'powerful'), M('Claude Sonnet 4.5'), M('Claude Haiku 4.5', 'fast'), M('Claude 3.7 Sonnet'), M('Claude 3.5 Sonnet v2'), M('Claude 3.5 Haiku', 'fast'), M('Llama 3.3 70B', 'free'), M('Llama 3.1 405B', 'free', 'powerful'), M('Nova Pro'), M('Nova Lite', 'fast'), M('Mistral Large'), M('DeepSeek R1', 'free', 'powerful')] },
  { label: 'Cohere', value: 'cohere', models: [M('Command A', 'powerful'), M('Command A Reasoning', 'powerful'), M('Command A Translate'), M('Command R+'), M('Command R', 'fast'), M('Command R7B', 'fast')] },
  { label: 'Cerebras', value: 'cerebras', models: [M('Llama 3.1 8B', 'free', 'fast'), M('GPT OSS 120B', 'free', 'powerful'), M('Qwen3 235B', 'free', 'powerful'), M('GLM 4.7', 'free')] },
  { label: 'OpenRouter', value: 'openrouter', count: 361, models: [M('DeepSeek V3.2', 'free', 'powerful'), M('DeepSeek R1', 'free', 'powerful'), M('Qwen3 Coder', 'free'), M('Llama 4 Maverick', 'free'), M('Llama 4 Scout', 'free', 'fast'), M('Mistral Large 3', 'free', 'powerful'), M('Mistral Small 3.2', 'free', 'fast'), M('Gemma 3 27B', 'free'), M('Kimi K2', 'free', 'powerful'), M('GLM 4.6', 'free'), M('MiniMax M2', 'free'), M('Jamba Large 1.7', 'free')] },
];
export const TIERS = [['free', 'Free'], ['fast', 'Fast'], ['powerful', 'Powerful']];
export const TOTALS = {
  models: PROVIDERS.reduce((n, p) => n + (p.count || p.models.length), 0),
  providers: PROVIDERS.length,
};

export const CONNECTORS = [
  { name: 'Gmail', mark: gmail, tools: 6 },
  { name: 'Google Drive', mark: drive, tools: 5 },
  { name: 'Google Calendar', mark: calendar, tools: 4 },
  { name: 'Google Chat', mark: chat, tools: 3 },
];

/* sample chats for a signed-out demo — the product's own list is empty */
export const FOLDERS = [
  { key: 'work', label: 'Work', chats: ['Q3 roadmap draft', 'Pricing research'], open: true },
  { key: 'research', label: 'Research', chats: ['Competitor teardown', 'Naming a design pattern'], open: false },
  { key: 'personal', label: 'Personal', chats: ['Resume review'], open: false },
];
export const CHATS = [
  { title: 'Connector permissions review', group: 'Today', pinned: false },
  { title: 'Comparing models', group: 'Today', pinned: false },
  { title: 'Bug triage — render loop', group: 'Yesterday', pinned: false },
  { title: 'Why .map() returns a new array', group: 'Previous 7 days', pinned: false },
  { title: 'Voice chat', group: 'Previous 7 days', pinned: true },
];
export const GROUPS = ['Today', 'Yesterday', 'Previous 7 days', 'Previous 30 days'];

export const ASKS = [
  { ph: 3, q: 'What did Priya say about the launch date?', model: 'Claude Sonnet 5', a: 'Thursday the 24th. She moved it from the 17th in her reply to Tom on Monday.' },
  { ph: 7, q: 'Summarise the Q3 plan in the shared drive.', model: 'GPT 4.1', a: 'Three priorities: ship the mobile app, cut onboarding to under a day, open two enterprise pilots.' },
  { ph: 1, q: 'What am I walking into on Monday?', model: 'Gemini 2.5 Pro', a: 'Four meetings, one that matters: the security review at 11 with Lena’s team.' },
  { ph: 9, q: 'Compare SOC 2 and ISO 27001 for a 40-person company.', model: 'Claude Sonnet 5', a: 'SOC 2 first. It is what US customers ask for and most controls carry over.' },
  { ph: 5, q: 'Turn my notes into a customer update. Keep it short.', model: 'GPT 4.1', a: 'Draft below, 120 words, two headings. The good news is at the top.' },
  { ph: 11, q: 'Catch me up on #launch since Thursday.', model: 'Grok 4', a: 'Eleven messages. The date moved to the 24th and QA found two blockers, both fixed.' },
  { ph: 13, q: 'Find the contract Dana sent and pull out the renewal terms.', model: 'Claude Sonnet 5', a: 'Twelve months, auto-renews unless you give notice 30 days before term.' },
  { ph: 2, q: 'Which version of the deck did we actually present?', model: 'Gemini 2.5 Pro', a: '“Board deck v7 FINAL” was opened at 9:52 that morning. I have linked it.' },
  { ph: 8, q: 'Draft an intro for the new hire, the way we usually write them.', model: 'GPT 4.1', a: 'Done, in the same shape as the last three. I left the odd fact blank for you.' },
];

/* the hero sequence: one ask, one answer, with the words that matter marked */
export const SEQUENCE = [
  { ask: 'What did Priya say about the launch date?', model: 'Claude Sonnet 5',
    reply: 'Thursday the **24th**. She moved it from the 17th in her reply to Tom on Monday, because of the App Store review window.' },
  { ask: 'What am I walking into on Monday?', model: 'Gemini 2.5 Pro',
    reply: 'Four meetings, one that matters: the **security review at 11** with Lena’s team. You still owe them the data-flow diagram.' },
  { ask: 'Catch me up on #launch since Thursday.', model: 'Grok 4',
    reply: 'Eleven messages. The date moved to the 24th, QA found **two blockers** in checkout, both fixed Friday.' },
];

/* each model's maker has a colour of its own; the name wears it */
export const modelColor = (m) => (/claude/i.test(m) ? '#D97757' : /gpt|^o\d/i.test(m) ? '#10A37F' : /gemini/i.test(m) ? '#4285F4' : /grok/i.test(m) ? '#131211' : 'var(--t4)');

export const photo = (n) => new URL(`./assets/ph${n}.jpg`, import.meta.url).href;
