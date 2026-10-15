export type ProviderMode = "local" | "cloud";
export type ProviderPhase = "not-configured" | "configured" | "verified" | "blocked";
export type DataClassification = "prompt-only" | "project-metadata" | "private-file-content";

export type OffDeviceConsent = {
  providerId: string;
  classification: Exclude<DataClassification, "prompt-only">;
  approvedAt: string;
};

export type AICompletionRequest = {
  prompt: string;
  classification: DataClassification;
  projectId?: string;
  approvedFileReferences?: string[];
  offDeviceConsent?: OffDeviceConsent;
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
    if (provider.descriptor.sendsDataOffDevice && request.classification !== "prompt-only") {
      const consent = request.offDeviceConsent;
      if (!consent || consent.providerId !== id || consent.classification !== request.classification || !consent.approvedAt) {
        throw new Error("Explicit approval is required before sending project metadata or private file content off this device.");
      }
    }
    return provider.complete(request);
  }
}
