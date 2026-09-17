import { motion } from 'motion/react';
import { pop, stagger } from '../../motion.js';

/* Brand marks in their own colours: LobeHub's colour set for the providers, Google's own product icons for the tools. */
import openai from '../../assets/marks/openai.svg?raw';
import anthropic from '../../assets/marks/anthropic.svg?raw';
import google from '../../assets/marks/google.svg?raw';
import xai from '../../assets/marks/xai.svg?raw';
import bedrock from '../../assets/marks/bedrock.svg?raw';
import cohere from '../../assets/marks/cohere.svg?raw';
import cerebras from '../../assets/marks/cerebras.svg?raw';
import openrouter from '../../assets/marks/openrouter.svg?raw';
import gmail from '../../assets/marks/gmail.svg?raw';
import drive from '../../assets/marks/drive.svg?raw';
import calendar from '../../assets/marks/calendar.svg?raw';
import chat from '../../assets/marks/chat.svg?raw';

export const PROVIDER_MARKS = [
  { name: 'OpenAI', svg: openai, count: '35 models' },
  { name: 'Anthropic', svg: anthropic, count: '15 models' },
  { name: 'Google', svg: google, count: '12 models' },
  { name: 'xAI', svg: xai, count: '16 models' },
  { name: 'AWS Bedrock', svg: bedrock, count: '39 models' },
  { name: 'Cohere', svg: cohere, count: '11 models' },
  { name: 'Cerebras', svg: cerebras, count: '10 models' },
  { name: 'OpenRouter', svg: openrouter, count: '373 models' },
];
export const TOOL_MARKS = [
  { name: 'Gmail', svg: gmail },
  { name: 'Google Drive', svg: drive },
  { name: 'Google Calendar', svg: calendar },
  { name: 'Google Chat', svg: chat },
];

export const Mark = ({ svg, title, className, size }) => (
  <motion.span className={`mark${className ? ` ${className}` : ''}`} title={title} style={size ? { width: size, height: size } : undefined} variants={pop}
    dangerouslySetInnerHTML={{ __html: svg }} />
);

export function ProviderMarks({ names = ['OpenAI', 'Anthropic', 'Google', 'xAI', 'AWS Bedrock'], size }) {
  return (
    <motion.span className="mk5" variants={stagger(0.07)}>
      {PROVIDER_MARKS.filter((p) => names.includes(p.name)).map((p) => <Mark key={p.name} svg={p.svg} title={p.name} size={size} />)}
    </motion.span>
  );
}
export function ToolMarks({ size }) {
  return (
    <motion.span className="mk4" variants={stagger(0.07)}>
      {TOOL_MARKS.map((t) => <Mark key={t.name} svg={t.svg} title={t.name} size={size} />)}
    </motion.span>
  );
}
