export type TMember = {
  id: string,

  /**
   * SVG string for the makers mark of the person whose work is
   * being priced
   *
   * @property
   */
  makersMark: null|string,

  /**
   * Name of the person being priced
   *
   * @property
   */
  name: string,
  pos: number,
}

export type TPerson = {
  id: string,
  /**
   * The adjusted price based on the difference between the fixed
   * cost of the firing and the total amount charged for all the
   * work in the firing.
   *
   * @property
   */
  adjustedTotal: number,

  /**
   * Basic details about the person whose work is being priced
   *
   * @property
   */
  member: TMember,

  /**
   * List of prices for each piece that was (or is) being fired.
   *
   * @property
   */
  pieces: Array<number>,

  /**
   * Whether or not the work has already been paid for
   * (e.g. work by students in a class where the cost of firing was
   * included in the price of the course)
   *
   * @property
   */
  prepaid: boolean,

  /**
   * Total value of the prices of all the peices for this person
   * (before the price is adjusted)
   *
   * @property
   */
  total: number,
}

export type TMakerChangeData = {
  id: string,
  index: number|null,
  value: number,
}

export type TMakerEventData = {
  bubbles: boolean,
  composed: boolean,
  detail: TMakerChangeData,
};
