import { photocraftAdapter } from "./photocraft";
import type { AdapterDescriptor } from "./types";

const descriptors: readonly AdapterDescriptor[] = [photocraftAdapter.descriptor];

export function listAdapterDescriptors(): readonly AdapterDescriptor[] {
  return descriptors;
}

export function getAdapterDescriptor(repository: string): AdapterDescriptor | undefined {
  return descriptors.find((descriptor) => descriptor.repository === repository);
}
