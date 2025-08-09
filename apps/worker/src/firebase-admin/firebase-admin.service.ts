import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin'

@Injectable()
export class FirebaseAdminService {
  private readonly messaging;
  constructor(
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        })
      })
    }
    this.messaging = admin.messaging();
  }

  getMessaging() {
    return this.messaging;
  }

}
