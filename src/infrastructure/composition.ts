import { CreateSession } from '@/application/use-cases/create-session';
import { DeleteSession } from '@/application/use-cases/delete-session';
import { FinalizeAssistantMessage } from '@/application/use-cases/finalize-assistant-message';
import { GenerateTitle } from '@/application/use-cases/generate-title';
import { GetSession } from '@/application/use-cases/get-session';
import { ListSessions } from '@/application/use-cases/list-sessions';
import { PostMessage } from '@/application/use-cases/post-message';
import { RenameSession } from '@/application/use-cases/rename-session';
import { CryptoUuidGenerator } from '@/infrastructure/identity/crypto-uuid-generator';
import { HttpClaudeStreamAdapter } from '@/infrastructure/llm/http-claude-stream-adapter';
import { HttpTitleGenerator } from '@/infrastructure/llm/http-title-generator';
import { LocalStorageMessageRepository } from '@/infrastructure/persistence/local-storage-message-repository';
import { LocalStorageSessionRepository } from '@/infrastructure/persistence/local-storage-session-repository';
import { FailureSimulator } from '@/infrastructure/simulation/failure-simulator';
import { LatencyInjector } from '@/infrastructure/simulation/latency-injector';
import { SystemRng } from '@/infrastructure/simulation/seedable-rng';
import {
  SimulatedPostMessage,
  type PostMessageUseCase,
} from '@/infrastructure/simulation/simulated-post-message';
import { SystemClock } from '@/infrastructure/time/system-clock';

export interface AppContainer {
  createSession: CreateSession;
  listSessions: ListSessions;
  getSession: GetSession;
  deleteSession: DeleteSession;
  renameSession: RenameSession;
  postMessage: PostMessageUseCase;
  finalizeAssistantMessage: FinalizeAssistantMessage;
  generateTitle: GenerateTitle;
  llmStream: HttpClaudeStreamAdapter;
}

function parseRate(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : fallback;
}

export function buildContainer(): AppContainer {
  if (typeof window === 'undefined') {
    throw new Error('AppContainer must be built on the client (localStorage required)');
  }

  const sessions = new LocalStorageSessionRepository();
  const messages = new LocalStorageMessageRepository();
  const clock = new SystemClock();
  const idGen = new CryptoUuidGenerator();
  const llmStream = new HttpClaudeStreamAdapter();
  const titleGen = new HttpTitleGenerator();

  const failureRate = parseRate(process.env.NEXT_PUBLIC_FAILURE_SIM_RATE, 0.1);
  const rng = new SystemRng();
  const failureSimulator = new FailureSimulator(rng, failureRate);
  const latencyInjector = new LatencyInjector(rng, 200, 1500);

  const realPostMessage = new PostMessage(sessions, messages, clock, idGen);

  return {
    createSession: new CreateSession(sessions, clock, idGen),
    listSessions: new ListSessions(sessions),
    getSession: new GetSession(sessions, messages),
    deleteSession: new DeleteSession(sessions, messages),
    renameSession: new RenameSession(sessions, clock),
    postMessage: new SimulatedPostMessage(realPostMessage, failureSimulator, latencyInjector),
    finalizeAssistantMessage: new FinalizeAssistantMessage(sessions, messages, clock, idGen),
    generateTitle: new GenerateTitle(sessions, titleGen, clock),
    llmStream,
  };
}
