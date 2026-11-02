import providerModelsData from "./providerModels.json";

export interface AIModelItem {
  name: string;
  id: string; // Mongo ObjectId
  slug: string;
  icon: string;
}

export const PROVIDER_MODELS: Record<string, AIModelItem[]> = providerModelsData as Record<string, AIModelItem[]>;

// Helper to look up model id by display name or slug
export function findModelIdByNameOrSlug(nameOrSlugOrId: string): string | null {
  if (!nameOrSlugOrId) return null;
  const target = nameOrSlugOrId.trim().toLowerCase();

  // If already a 24-character hex ObjectId, return it
  if (/^[0-9a-fA-F]{24}$/.test(nameOrSlugOrId)) {
    return nameOrSlugOrId;
  }

  for (const provider of Object.keys(PROVIDER_MODELS)) {
    const list = PROVIDER_MODELS[provider];
    for (const item of list) {
      if (
        item.name.toLowerCase() === target ||
        item.slug.toLowerCase() === target ||
        item.id.toLowerCase() === target
      ) {
        return item.id;
      }
    }
  }

  return null;
}

// Helper to get model details
export function getModelInfo(nameOrSlugOrId: string): { provider: string; model: AIModelItem } | null {
  if (!nameOrSlugOrId) return null;
  const target = nameOrSlugOrId.trim().toLowerCase();

  for (const provider of Object.keys(PROVIDER_MODELS)) {
    const list = PROVIDER_MODELS[provider];
    for (const item of list) {
      if (
        item.name.toLowerCase() === target ||
        item.slug.toLowerCase() === target ||
        item.id.toLowerCase() === target
      ) {
        return { provider, model: item };
      }
    }
  }

  return null;
}

