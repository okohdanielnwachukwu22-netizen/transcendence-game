export type AdapterPhase =
  | "scaffolded"
  | "native-tested"
  | "integrated-and-verified"
  | "blocked";

export type CapabilityEffect = "read" | "write" | "destructive" | "external";

export type CapabilityDefinition = {
  id: string;
  label: string;
  effect: CapabilityEffect;
  localOnly: boolean;
  userInitiated: boolean;
  confirmationRequired: boolean;
};

export type AdapterDescriptor = {
  repository: string;
  displayName: string;
  phase: AdapterPhase;
  capabilities: readonly CapabilityDefinition[];
  notes: string;
};
