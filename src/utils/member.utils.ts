import { TMemberDetails, TMemberDetailsEventData } from '../../types/components';
import { TMember, TPerson } from '../../types/people'


export const notInList = (list: Array<TMember|TPerson>, id: string) : boolean => {
  for (let a = 0; a < list.length; a += 1) {
    if (list[a].id === id) {
      return false;
    }
  }
  return true;
};

export const getNewPerson = (member : TMember) : TPerson => ({
  id: member.id,
  adjustedTotal: 0,
  member: member,
  pieces: [],
  prepaid: false,
  total: 0,
});

export const getUniqueID = (list: Array<TMember>, userName: string) : string => {
  const id = userName.toLowerCase().replace(/[^a-z0-9-]+/g, '');
  const l = list.length;
  let c = 0;
  let tmp = id;

  for (let a = 0; a < l; a += 1) {
    let match = false;

    c += 1;

    for (let b = 0; b < l; b += 1) {
      if (list[a].id === tmp) {
        match = true;
        break;
      }
    }

    if (match === false) {
      return tmp;
    }

    tmp = `${id}${c}`;
  }

  throw new Error(`getUniqueID() was unable to generate a unique ID for ${userName}`);
};

export const getEventDetails = (member: TMemberDetails) : TMemberDetailsEventData => ({
  bubbles: true,
  composed: true,
  detail: {
    action: member.action,
    id: member.memberId,
    name: member.newName,
    mark: member.newMark,
  },
})

export const listMemberNames = (list: Array<TMember>) : string => {
  const names = list.map((item : TMember) : string => item.name).join(', ');

  return names.replace(/,(?= [^,]+$)/ig, ' &');
}
