import express from 'express';
import bodyParser from 'body-parser';
import { createReadStream } from 'fs';
import crypto from 'crypto';
import http from 'http';
import mongoose from 'mongoose';
import myFunc from './app.js';
import CORS from './CORS.js';
import UserModel from './models/User.js';

const User = UserModel(mongoose);
const app = myFunc(
  express,
  bodyParser,
  createReadStream,
  crypto,
  http,
  mongoose,
  User,
  CORS
);

try {
  app.listen(process.env.PORT ?? 4321);
} catch (e) {
  console.log(e.codeName);
}
             


