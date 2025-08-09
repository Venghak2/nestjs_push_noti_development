import { users } from "@prisma/client";

export class PushNotificationPayloadDto{
  user: users;
  title: string;
  message: string;
  tokenSubscriber: string;
}
