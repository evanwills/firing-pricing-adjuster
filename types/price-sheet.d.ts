import { TMember, TPerson } from "./people"

export enum EFiringType  {
  Bisque,
  Earthenware,
  Midfire,
  Stoneware,
}

export type TFiringType = {
  name: string,
  default: number,
  min: number,
  max: number,
}

export type TPriceSheet = {
  firingDate: string,
  firingType: EFiringType,
  firingTemp: number,
  packedBy: string,
  pricedBy: string,
  firingCost: number,
  work: Array<TPerson>,
  members: Array<TMember>,
}
