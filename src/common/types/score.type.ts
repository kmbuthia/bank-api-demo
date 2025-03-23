export type CustomerScore = {
  id: 9;
  customerNumber: number;
  score: number;
  limitAmount: number;
  exclusion: string;
  exclusionReason: string;
};

export type InitScoreEvent = {
  customerNumber: number;
};

export type CheckScoreEvent = {
  customerNumber: number;
  token: string;
  retries: number;
};
