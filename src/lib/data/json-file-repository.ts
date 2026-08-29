import { promises as fs } from "node:fs";
import path from "node:path";

export type JsonRepositoryOptions<T> = {
  fileName: string;
  createDefault: () => T;
  normalize?: (value: unknown) => T;
};

const writeQueues = new Map<string, Promise<unknown>>();

function resolveStorageDirectory() {
  const configured = process.env.BREEZE_STORAGE_DIR?.trim();
  return configured
    ? path.resolve(configured)
    : path.join(process.cwd(), "storage");
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

export class JsonFileRepository<T> {
  readonly filePath: string;

  constructor(private readonly options: JsonRepositoryOptions<T>) {
    this.filePath = path.join(resolveStorageDirectory(), options.fileName);
  }

  private async ensureFile() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await this.writeAtomic(this.options.createDefault());
    }
  }

  private normalize(value: unknown): T {
    return this.options.normalize
      ? this.options.normalize(value)
      : (value as T);
  }

  private async writeAtomic(value: T) {
    const temporaryPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(temporaryPath, JSON.stringify(value, null, 2), "utf8");
    await fs.rename(temporaryPath, this.filePath);
  }

  async read(): Promise<T> {
    await this.ensureFile();

    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      return this.normalize(JSON.parse(raw));
    } catch {
      return cloneValue(this.options.createDefault());
    }
  }

  async write(value: T): Promise<T> {
    await this.ensureFile();

    const previous = writeQueues.get(this.filePath) ?? Promise.resolve();
    const next = previous
      .catch(() => undefined)
      .then(() => this.writeAtomic(value));

    writeQueues.set(this.filePath, next);

    try {
      await next;
      return value;
    } finally {
      if (writeQueues.get(this.filePath) === next) {
        writeQueues.delete(this.filePath);
      }
    }
  }

  async update(mutator: (current: T) => T | Promise<T>): Promise<T> {
    const previous = writeQueues.get(this.filePath) ?? Promise.resolve();
    let result!: T;

    const next = previous
      .catch(() => undefined)
      .then(async () => {
        await this.ensureFile();
        const current = await this.read();
        result = await mutator(current);
        await this.writeAtomic(result);
      });

    writeQueues.set(this.filePath, next);

    try {
      await next;
      return result;
    } finally {
      if (writeQueues.get(this.filePath) === next) {
        writeQueues.delete(this.filePath);
      }
    }
  }
}
