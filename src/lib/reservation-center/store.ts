import { JsonFileRepository } from "@/lib/data";
import type { ReservationFolder } from "@/lib/reservation-center/types";

type StoreShape = { folders: ReservationFolder[] };

const repository = new JsonFileRepository<StoreShape>({
  fileName: "reservation-folders.json",
  createDefault: () => ({ folders: [] }),
  normalize(value) {
    const parsed = (value ?? {}) as Partial<StoreShape>;
    return { folders: Array.isArray(parsed.folders) ? parsed.folders : [] };
  },
});

export async function listReservationFolders() {
  const store = await repository.read();
  return [...store.folders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getReservationFolder(code: string) {
  const store = await repository.read();
  return store.folders.find((folder) => folder.code === code) ?? null;
}

export async function getReservationFolderByLegacyRequestId(id: string) {
  const store = await repository.read();
  return store.folders.find((folder) => folder.legacyRequestIds.includes(id)) ?? null;
}

export async function saveReservationFolder(folder: ReservationFolder) {
  await repository.update((store) => {
    const folders = [...store.folders];
    const index = folders.findIndex((item) => item.code === folder.code);
    if (index >= 0) folders[index] = folder;
    else folders.unshift(folder);
    return { folders };
  });
  return folder;
}
