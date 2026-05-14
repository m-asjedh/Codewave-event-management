"use strict";

import mongoose from "mongoose";

let cached = global.__codewave_mongoose;

/**
 * Reuse connection across Lambda invocations.
 */
export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }
  if (cached?.conn) return cached.conn;
  if (!cached) cached = global.__codewave_mongoose = { conn: null, promise: null };

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 8000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
