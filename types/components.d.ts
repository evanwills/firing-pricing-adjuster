export type TMemberDetails = {
  action: string,
  memberId : string,
  makersMark : string,
  name : string,
  editable : boolean,
  editing : boolean,
  newName : string,
  newMark : string,
  save : string,
  edit : string,
};

export type TMemberChangeData = {
  action: string,
  id : string,
  name : string,
  mark : string,
};

export type TMemberDetailsEventData = {
  bubbles: boolean,
  composed: boolean,
  detail: TMemberChangeData
};
