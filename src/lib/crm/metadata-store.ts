import { JsonFileRepository } from "@/lib/data";

export type CustomerMetadata = {
  customerId: string;
  tags: string[];
  notes: string[];
  updatedAt: string;
};

type StoreShape = { customers: Record<string, CustomerMetadata> };

const repository = new JsonFileRepository<StoreShape>({
  fileName: "crm-customers.json",
  createDefault: () => ({ customers: {} }),
  normalize(value) {
    const parsed = (value ?? {}) as Partial<StoreShape>;
    return {
      customers:
        parsed.customers && typeof parsed.customers === "object"
          ? parsed.customers
          : {},
    };
  },
});

export async function getCustomerMetadata(customerId: string): Promise<CustomerMetadata> {
  const store = await repository.read();
  return store.customers[customerId] ?? {
    customerId,
    tags: [],
    notes: [],
    updatedAt: new Date(0).toISOString(),
  };
}

export async function updateCustomerMetadata(
  customerId: string,
  input: { tags?: string[]; notes?: string[] }
) {
  let next!: CustomerMetadata;

  await repository.update((store) => {
    const current = store.customers[customerId] ?? {
      customerId,
      tags: [],
      notes: [],
      updatedAt: new Date(0).toISOString(),
    };

    next = {
      customerId,
      tags: input.tags
        ? [...new Set(input.tags.map((tag) => tag.trim()).filter(Boolean))].slice(0, 20)
        : current.tags,
      notes: input.notes
        ? input.notes.map((note) => note.trim()).filter(Boolean).slice(0, 100)
        : current.notes,
      updatedAt: new Date().toISOString(),
    };

    return {
      customers: {
        ...store.customers,
        [customerId]: next,
      },
    };
  });

  return next;
}
