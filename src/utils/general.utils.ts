// import { TemplateResult } from "lit";
import { TPerson } from "../../types/people";
// import { TFiringType } from "../../types/price-sheet";
// import { unsafeHTML } from "lit/directives/unsafe-html.js";

export const storageAvailable = (prop : string) : boolean => {
  let storage;
  try {
    // @ts-ignore
    storage = window[prop];
    const x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === "QuotaExceededError" ||
        // Firefox
        e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage &&
      storage.length !== 0
    );
  }
};

export const dateFromISO = (date : Date) => {
  const iso = date.toISOString();

  return iso.replace(/T.*$/, '');
}

export const sum = (input : Array<number>) : number => {
  let output = 0;

  for (let a = 0; a < input.length; a += 1) {
    // console.log(`input[${a}]:`, input[a], typeof input[a]);
    output += input[a];
  }

  return output;
}

export const updateTotals = (cost : number, work : Array<TPerson>) : Array<TPerson> => {
  let total = 0;

  // loop through and get the latest total
  const step1 : Array<TPerson> = work.map((member : TPerson) : TPerson => {
    let _total = sum(member.pieces);
    total += _total;

    return (_total !== member.total)
      ? { ...member, total: _total }
      : member;
  });

  const factor : number = (cost / total);

  // Loop through and update the adjusted total
  return step1.map((member : TPerson) : TPerson => {
    const adjusted = (member.total * factor);

    return (member.adjustedTotal !== adjusted)
      ? { ...member, adjustedTotal: adjusted }
      : member;
  });
};

export const renderTxtPriceList = (list : Array<TPerson>) : string => {
  let output = '';

  let maxLen = 0;

  const tmp = list.map((maker : TPerson) => {
    const name = maker.member.name.trim();
    return {
      name,
      price: `$${Math.ceil(maker.adjustedTotal)}`,
    }
  });

  tmp.sort((a, b) : number => {
    if (a.name < b.name) {
      return -1;
    }
    return (a.name > b.name)
      ? 1
      : 0;
  })

  for (let a = 0; a < tmp.length; a += 1) {
    if (tmp[a].name.length > maxLen) {
      maxLen = tmp[a].name.length;
    }
  }

  for (let a = 0; a < tmp.length; a += 1) {
    output += `\n${tmp[a].name.padEnd(maxLen)} -${tmp[a].price.padStart(4)}`;
  }

  return output;
};

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // console.log('Content copied to clipboard');
  } catch (err) {
    // console.error('Failed to copy: ', err);
  }
};

export const firingName = (name : string) : string => {
  if (name === 'Bisque' || name === 'Raku' || name.includes('glaze')) {
    return '';
  }
  if (name === 'Pit') {
    return 'firing';
  }

  return 'glaze';
};

export const normaliseName = (name : string) : string => {
  return name.replace(/[^a-z0-9]+/ig, '').toLowerCase();
};

export const filterName = (name : string, filter : string) : boolean => {
  const _name = normaliseName(name);

  return _name.includes(filter);
}
