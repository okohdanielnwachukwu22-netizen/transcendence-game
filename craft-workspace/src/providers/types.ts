export type ProviderMode = "local" | "cloud";
export type ProviderPhase = "not-configured" | "configured" | "verified" | "blocked";
export type DataClassification = "prompt-only" | "project-metadata" | "private-file-content";

export type AICompletionRequest = {
  prompt: string;
  classification: DataClassification;
  projectId?: string;
  approvedFileReferences?: string[];
  signal?: AbortSignal;
};

export type AICompletion = {
  text: string;
  providerId: string;
  modelId: string;
  usage?: { inputTokens?: number; outputTokens?: number };
};

export type AIProviderDescriptor = {
  id: string;
  name: string;
  mode: ProviderMode;
  phase: ProviderPhase;
  accepts: readonly DataClassification[];
  sendsDataOffDevice: boolean;
};

export interface AIProviderAdapter {
  readonly descriptor: AIProviderDescriptor;
  complete(request: AICompletionRequest): Promise<AICompletion>;
}

export class AIProviderRegistry {
  private readonly providers = new Map<string, AIProviderAdapter>();

  register(provider: AIProviderAdapter): void {
    if (this.providers.has(provider.descriptor.id)) {
      throw new Error("An AI provider with this ID is already registered.");
    }
    this.providers.set(provider.descriptor.id, provider);
  }

  get(id: string): AIProviderAdapter | undefined {
    return this.providers.get(id);
  }

  list(): readonly AIProviderDescriptor[] {
    return Array.from(this.providers.values(), (provider) => provider.descriptor);
  }

  async complete(id: string, request: AICompletionRequest): Promise<AICompletion> {
    const provider = this.providers.get(id);
    if (!provider) throw new Error("The selected AI provider is not configured.");
    if (!provider.descriptor.accepts.includes(request.classification)) {
      throw new Error("The selected provider is not approved for this data classification.");
    }
    return provider.complete(request);
  }
}
