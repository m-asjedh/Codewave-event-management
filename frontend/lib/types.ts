export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  /** ISO 8601 */
  startsAt: string;
  location: string;
  bannerUrl: string;
  createdBy: string;
  createdAt: string;
};

export type RegistrationRecord = {
  id: string;
  eventId: string;
  userEmail: string;
  userName: string;
  createdAt: string;
};
