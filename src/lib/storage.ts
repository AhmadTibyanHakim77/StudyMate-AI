import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const fileNamePattern = /^[a-f0-9-]{36}\.pdf$/i;

export class StorageConfigurationError extends Error {
  constructor() {
    super('Private object storage is not configured.');
    this.name = 'StorageConfigurationError';
  }
}

function getS3Config() {
  const { S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT } = process.env;
  const hasAnySetting = Boolean(S3_BUCKET || S3_REGION || S3_ACCESS_KEY_ID || S3_SECRET_ACCESS_KEY || S3_ENDPOINT);
  const complete = Boolean(S3_BUCKET && S3_REGION && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY);

  if (hasAnySetting && !complete) {
    throw new StorageConfigurationError();
  }

  if (!complete) {
    if (process.env.NODE_ENV === 'production') {
      throw new StorageConfigurationError();
    }
    return null;
  }

  return {
    bucket: S3_BUCKET as string,
    client: new S3Client({
      region: S3_REGION,
      endpoint: S3_ENDPOINT || undefined,
      forcePathStyle: Boolean(S3_ENDPOINT),
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID as string,
        secretAccessKey: S3_SECRET_ACCESS_KEY as string,
      },
    }),
  };
}

function localFilePath(fileName: string): string {
  if (!fileNamePattern.test(fileName)) {
    throw new Error('Invalid private file key.');
  }
  return path.join(process.cwd(), 'uploads', fileName);
}

function parseFileLocator(locator: string): { kind: 'local' | 's3'; key: string } {
  const separatorIndex = locator.indexOf(':');
  const kind = locator.slice(0, separatorIndex);
  const key = locator.slice(separatorIndex + 1);
  if ((kind !== 'local' && kind !== 's3') || !fileNamePattern.test(key)) {
    throw new Error('Invalid private file locator.');
  }
  return { kind, key };
}

export async function storePrivatePdf(bytes: Uint8Array): Promise<string> {
  const fileName = `${randomUUID()}.pdf`;
  const s3 = getS3Config();
  if (s3) {
    await s3.client.send(new PutObjectCommand({
      Bucket: s3.bucket,
      Key: `materials/${fileName}`,
      Body: Buffer.from(bytes),
      ContentType: 'application/pdf',
      ServerSideEncryption: 'AES256',
    }));
    return `s3:${fileName}`;
  }

  const filePath = localFilePath(fileName);
  await mkdir(path.dirname(filePath), { recursive: true, mode: 0o700 });
  await writeFile(filePath, bytes, { mode: 0o600, flag: 'wx' });
  return `local:${fileName}`;
}

export async function readPrivatePdf(locator: string): Promise<Uint8Array> {
  const { kind, key } = parseFileLocator(locator);
  const s3 = getS3Config();
  if (kind === 's3') {
    if (!s3) throw new StorageConfigurationError();
    const result = await s3.client.send(new GetObjectCommand({ Bucket: s3.bucket, Key: `materials/${key}` }));
    if (!result.Body) throw new Error('Stored file is empty.');
    return new Uint8Array(await result.Body.transformToByteArray());
  }

  if (process.env.NODE_ENV === 'production') throw new StorageConfigurationError();
  return new Uint8Array(await readFile(localFilePath(key)));
}

export async function deletePrivatePdf(locator: string): Promise<void> {
  const { kind, key } = parseFileLocator(locator);
  const s3 = getS3Config();
  if (kind === 's3') {
    if (!s3) throw new StorageConfigurationError();
    await s3.client.send(new DeleteObjectCommand({ Bucket: s3.bucket, Key: `materials/${key}` }));
    return;
  }

  if (process.env.NODE_ENV === 'production') throw new StorageConfigurationError();
  try {
    await unlink(localFilePath(key));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
}
