export interface FSRSParameters {
  request_retention: number;
  maximum_interval: number;
  w: number[] | readonly number[];
  enable_fuzz: boolean;
  enable_short_term: boolean;
}
