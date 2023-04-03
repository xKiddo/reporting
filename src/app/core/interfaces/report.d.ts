import { Author } from "./author";
import { Observation } from "./observation";

export interface Report {
  id: number;
  author: Author | undefined;
  observations: Observation[] | undefined;
  description: string | undefined;
  edit: boolean | undefined;
}
