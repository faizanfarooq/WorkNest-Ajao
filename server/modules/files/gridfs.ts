import mongoose, { Types } from 'mongoose';
import { Readable } from 'node:stream';

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db!, { bucketName: 'resumes' });

export async function storeFile(buffer: Buffer, fileName: string, contentType: string, ownerId: string) {
  const upload = bucket().openUploadStream(fileName, { metadata: { ownerId, contentType } });
  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer).pipe(upload).on('finish', () => resolve()).on('error', reject);
  });
  return upload.id as Types.ObjectId;
}

export async function findFile(id: Types.ObjectId) {
  return bucket().find({ _id: id }).next();
}

export const openFile = (id: Types.ObjectId) => bucket().openDownloadStream(id);

export async function deleteFile(id: Types.ObjectId) {
  try {
    await bucket().delete(id);
  } catch {
    // Already gone; nothing to clean up.
  }
}
