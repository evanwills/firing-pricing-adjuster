import { LitElement, TemplateResult, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { TMakerEventData, TMember, TPerson } from '../types/people.d';
import { TMemberDetailsEventData } from '../types/components.d';
import { TFiringType } from '../types/price-sheet.d';
import { getUniqueID, listMemberNames, sortMembers } from './utils/member.utils';
import { copyToClipboard, dateFromISO, firingName, renderTxtPriceList, storageAvailable, updateTotals } from './utils/general.utils';
import './components/member-list';
import './components/price-list';

const firingTypes : Array<TFiringType> = [
  {
    name: 'Bisque',
    default: 1000,
    min: 900,
    max: 1100
  },
  {
    name: 'Earthenware',
    default: 1120,
    min: 1050,
    max: 1150
  },
  {
    name: 'Midfire',
    default: 1210,
    min: 1150,
    max: 1250
  },
  {
    name: 'Stoneware',
    default: 1260,
    min: 1250,
    max: 1320
  },
  {
    name: 'Onglaze/Luster',
    default: 550,
    min: 400,
    max: 700
  },
  {
    name: 'Pit',
    default: 800,
    min: 700,
    max: 900
  },
  {
    name: 'Raku',
    default: 800,
    min: 750,
    max: 1050
  },
];
const dateErrorMsg = 'Pricing cannot be done in the future';

const firingTemps : Array<number> = [
  1000,
  1080,
  1120,
  1210,
  1280,
];

const defaultType = 'Bisque';
const defaultTemp = 1000;
const defaultPrice = 85;

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('firing-pricing-adjuster')
export class FiringPricingAdjuster extends LitElement {
  /**
   * Copy for the read the docs hint.
   */
  @state()
  membersList : Array<TMember> = [
    // {
    //   id: 'evanw',
    //   name: 'Evan Wills',
    //   makersMark: '',
    //   pos: 0,
    // },
    // {
    //   id: 'georgiep',
    //   name: 'Georgie Pike',
    //   makersMark: '',
    //   pos: 1,
    // },
    // {
    //   id: 'mark',
    //   name: 'Mark Malek',
    //   makersMark: '',
    //   pos: 4,
    // },
    // {
    //   id: 'natasha',
    //   name: 'Natasha Holdem',
    //   makersMark: '',
    //   pos: 3,
    // },
    // {
    //   id: 'netta',
    //   name: 'Netta Egoz',
    //   makersMark: '',
    //   pos: 2,
    // },
  ]

  @state()
  action : string = '';

  @state()
  adjustmentFactor : number = 1;

  @state()
  dateError : string = '';

  @state()
  defaultTemp : number = 1000;

  @state()
  firingType : string = defaultType;

  @state()
  firingTemp : number = defaultTemp;

  @state()
  firingCost : number = defaultPrice;

  @state()
  firingDate : string = dateFromISO(new Date());

  @state()
  maxDate : string = '';

  @state()
  maxTemp : number = 1050;

  @state()
  minDate : string = '';

  @state()
  minTemp : number = 900;

  @state()
  memberModal : HTMLDialogElement|null = null;

  @state()
  packedBy : Array<TMember> = [];

  @state()
  pricedBy : Array<TMember> = [];

  @state()
  showMemberList : boolean = false;

  @state()
  report : string = '';

  @state()
  reportModal : HTMLDialogElement|null = null;

  @state()
  storageType : string = '';

  @state()
  tempError : TemplateResult|string = '';

  @state()
  textarea : HTMLTextAreaElement|null = null;

  @state()
  useMember : boolean = true;

  @state()
  work : Array<TPerson> = [];

  //  END:  Property/Attribute declarations
  // ------------------------------------------------------
  // START: Private methods

  private _addDoer(event : InputEvent) : void {
    const target = event.target as HTMLButtonElement;

    if (target !== null) {
      this.action = target.value;
      this._showMemberModal();
    }
  }

  private _addMaker() : void {
    this.action = 'set-potter';
    this.useMember = true;
    this.membersList = sortMembers([...this.membersList]);

    this._showMemberModal();
  }

  private _addUser(action : string, id : string) {
    const members = this.membersList.filter((member) => member.id === id);

    if (members.length !== 1) {
      throw new Error(`__addUser() could not find user matched by ID: "${id}"`);
    }

    switch (action) {
      case 'set-packed-by':
        if (this._notInList(this.packedBy, id)) {
          this.packedBy = [
            ...this.packedBy,
            members[0]
          ];
        }
        this.showMemberList = false;
        this._persistLocally('packedBy', this.packedBy);
        break;

      case 'set-priced-by':
        if (this._notInList(this.pricedBy, id)) {
          this.pricedBy = [
            ...this.pricedBy,
            members[0]
          ];
        }
        this.showMemberList = false;
        this._persistLocally('pricedBy', this.pricedBy);
        break;

      case 'set-potter':
        if (this._notInList(this.work, id)) {
          this.work = [
            ...this.work,
            this._getNewPerson(members[0])
          ]
          this._persistLocally('work', this.work);
        }
        break;

      default:
        throw new Error(`could not add user "${id} to ${action}`);
    }
  }

  private _closeMemberList() : void {
    console.group('_closeMemberList()');
    this.memberModal?.close();
    console.groupEnd();
  }

  private _closePriceReport() : void {
    this.reportModal?.close();
  }

  private _copyReport() : void {
    const tmp = this.renderRoot.querySelector('#price-report textarea');

    if (typeof tmp !== 'undefined' && tmp !== null) {
      this.textarea = tmp as HTMLTextAreaElement;
      this.textarea.focus();
      this.textarea.select();

      copyToClipboard(this.report);
    }
  }

  private _getLocalData(prop : string) {
    switch (this.storageType) {
      case 'localStorage':
        return localStorage.getItem(prop);

      case 'sessionStorage':
        return sessionStorage.getItem(prop);
    }
  }

  private _getNewPerson(member : TMember) : TPerson {
    return {
      id: member.id,
      adjustedTotal: 0,
      member: member,
      pieces: [],
      prepaid: false,
      total: 0,
    }
  }

  private _getTempError(val: number) : TemplateResult|string {
    let dir = '';
    let tmp = 0;
    if (val < this.minTemp) {
      dir = 'less';
      tmp = this.minTemp;
    } else if (val > this.maxTemp) {
      dir = 'more';
      tmp = this.maxTemp;
    }

    if (dir === '') {
      return '';
    }

    return html`Top temperature for a ${this.firingType} firing must be between ${this.minTemp}&deg;C and ${this.maxTemp}&deg;C. "${val}" is ${dir} than ${tmp}&deg;C`
  }

  private _memberManager() : void {
    this.action = '';
    this.useMember = false;
    this.membersList = sortMembers([...this.membersList]);

    this._showMemberModal();
  }

  private _notInList(list: Array<TMember|TPerson>, id: string) : boolean {
    for (let a = 0; a < list.length; a += 1) {
      if (list[a].id === id) {
        return false;
      }
    }
    return true;
  }

  private _persistLocally(prop : string, value: any) {
    let valueType : string = typeof value;
    let data : any = value;

    if (valueType !== 'undefined') {
      if (Array.isArray(value) || Object.prototype.toString.call(value) === '[object Object]') {
        data = JSON.stringify(value);
      }

      switch (this.storageType) {
        case 'localStorage':
          localStorage.setItem(prop, data);
          break;

        case 'sessionStorage':
          sessionStorage.setItem(prop, data);
      }
    }
  }

  private _removeDoer(event : InputEvent) : void {
    const target = event.target as HTMLButtonElement;

    if (target !== null) {
      let l = 0;
      switch (target.value) {
        case 'remove-priced-by':
          l = this.pricedBy.length - 1;
          this.pricedBy = this.pricedBy.slice(0, l);
          this._persistLocally('pricedBy', this.pricedBy);
          break;

        case 'remove-packed-by':
          l = this.packedBy.length - 1;
          this.packedBy = this.packedBy.slice(0, l);
          this._persistLocally('packedBy', this.packedBy);
          break;
      }
    }
  }

  private _reset() : void {
    this.firingDate = dateFromISO(new Date());
    this.firingType = defaultType;
    this.firingTemp = defaultTemp;
    this.firingCost = defaultPrice;
    this.packedBy = [];
    this.pricedBy = [];
    this.work = [];

    this._setMinMaxTemp();
    this._persistLocally('firingCost', this.firingCost);
    this._persistLocally('firingDate', this.firingDate);
    this._persistLocally('firingTemp', this.firingTemp);
    this._persistLocally('firingType', this.firingType);
    this._persistLocally('packedBy', this.packedBy);
    this._persistLocally('pricedBy', this.pricedBy);
    this._persistLocally('work', this.work);
  }

  private _setMinMaxTemp() : void {
    const fType : TFiringType = firingTypes.filter(
      (item) => (item.name === this.firingType),
    )[0];

    if (typeof fType !== 'undefined') {
      this.minTemp = fType.min;
      this.maxTemp = fType.max;
      this.defaultTemp = fType.default;
      this.firingTemp = fType.default;
    }
  }

  private _showErrors () : boolean {
    return (this.firingDate === '' || this.packedBy.length === 0 || this.pricedBy.length === 0);
  }

  private _setProp (event : InputEvent) : void {
    const target = event.target as HTMLInputElement;

    if (target !== null) {
      const { id, value } = target;
      let skip = true;

      switch (id) {
        case 'firingDate':
          console.log('target:', target);
          if (new Date(value).getTime() < Date.now()) {
            this.firingDate = value;
            this.dateError = '';
          } else {
            target.value = '';
            this.dateError = dateErrorMsg;
          }
          skip = false;
          break;

        case 'firingType':
          this.firingType = value;
          this._setMinMaxTemp();
          skip = false;
          break;

        case 'firingTemp':
          const temp = parseInt(value, 10);
          this.tempError = this._getTempError(temp);

          if (this.tempError === '') {
            this.firingTemp = temp;
            skip = false;
          } else {
            target.value = this.defaultTemp.toString();
          }
          break;

        case 'firingCost':
          this.firingCost = parseInt(value, 10);
          skip = false;
          break;
      }

      if (skip === false) {
        this._persistLocally(id, value);
      }
    }
  }

  private _showMemberModal() {
    if (this.memberModal === null) {
      const tmp = this.renderRoot.querySelector('#member-dialogue');

      if (typeof tmp !== 'undefined' && tmp !== null) {
        this.memberModal = tmp as HTMLDialogElement;
      }
    }

    if (this.memberModal !== null && typeof this.memberModal !== 'undefined') {
      this.memberModal.showModal();
    }
  }

  private _showReportModal() {
    if (this.reportModal === null) {
      const tmp = this.renderRoot.querySelector('#price-report');

      if (typeof tmp !== 'undefined' && tmp !== null) {
        this.reportModal = tmp as HTMLDialogElement;
      }
    }

    if (this.reportModal !== null && typeof this.reportModal !== 'undefined') {
      this.reportModal.showModal();
    }
  }

  private _showReport() {
    let type = 'bisque';
    let temp = '';

    if (this.firingType !== 'Bisque') {
      type = 'glaze';
      temp = ` ${this.firingType.toLowerCase()} (${this.firingTemp}°C)`;
    }

    this.report = `The last ${type}${temp} firing (packed by: `
      + `${listMemberNames(this.packedBy)}) has been upacked by `
      + `${listMemberNames(this.pricedBy)}.\n\nBelow are the for the `
      + `member's fired work:\n${renderTxtPriceList(this.work)}`;

    this._showReportModal();
  }

  private _updateMember(event : TMemberDetailsEventData) : void {
    let { action, id, mark, name } = event.detail;
    let _id = id;

    if (_id === '') {
      _id = getUniqueID(this.membersList, name);
      this.membersList = sortMembers([
        ...this.membersList, {
        id: _id,
        name: event.detail.name,
        makersMark: '',
        pos: this.membersList.length,
      }]);
    } else {
      this.membersList = sortMembers(this.membersList.map((member) => (member.id === _id)
        ? ({
          ...member,
          name: name,
          makersMark: mark,
        })
        : member
      ));
    }
    this._persistLocally('membersList', this.membersList);

    if (action !== '') {
      this._addUser(action, _id);
      this.showMemberList = false;
      this.memberModal?.close();
    }
  }

  private _updateMaker(event : TMakerEventData) : void {
    console.group('_updateMaker()');
    const { id, index, value } = event.detail;
    const _val = (typeof value === 'string')
      ? parseInt(value, 10)
      : value;
    const _ind = (index !== null && typeof index === 'string')
      ? parseInt(index)
      : index;
    console.log('index:', index, typeof index);

    this.work = updateTotals(
      this.firingCost,
      this.work.map((maker : TPerson) => {
        if (maker.id !== id) {
          return maker;
        }

        let _pieces : Array<number> = [];

        if (_ind !== null) {
          _pieces = maker.pieces.map((piece, i) => (_ind === i)
            ? _val
            : piece
          ).filter((piece: number) : boolean => piece > 0);
        } else if (_val !== 0) {
          _pieces = [...maker.pieces, _val];
        }
        return {
          ...maker,
          pieces: _pieces,
        };
      }),
    );

    this._persistLocally('work', this.work);
    console.groupEnd();
  }

  private _useMember(event : TMemberDetailsEventData) : void {
    let { action, id } = event.detail;

    if (action !== '') {
      this._addUser(action, id);
      this.showMemberList = false;
      this.memberModal?.close();
    }
  }

  //  END:  Private methods
  // ------------------------------------------------------
  // START: Styling

  static styles = css`
    :host {
      box-sizing: border-box;
      max-width: 25rem;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    :host * {
      box-sizing: border-box;
    }
    h1 {
      font-size: 1.5rem;
    }
    input[type=number] {
      display: inline-block;
      width: 4rem;
    }
    ul {
      margin: 0;
      padding: 0;
    }
    .input-fields {
      border-top: 0.05rem solid #ccc;
    }
    .input-fields li {
      align-items: flex-start;
      column-gap: 0.5rem;
      display: flex;
      flex-wrap: wrap;
      max-width: 20rem;
      margin: 0;
      padding: 0.5rem 0;
      border-bottom: 0.05rem solid #ccc;
    }
    .input-fields li:hover,
    .input-fields li:focus-within {
      background-color: #000;
    }
    .key-value-pair label {
      flex-grow: 1;
      text-align: left;
    }
    .doer-list .name-list--label {
      text-align: left;
    }
    .doer-list .name-list--list {
      flex-grow: 1;
      text-align: left;
    }
    .data-errors {
      margin: 2rem 0 0;
      padding: 0;
    }
    .error-msg {
      text-align: left;
      border: 0.1rem solid #fff;
      border-radius: 0.5rem;
      background-color: #a00;
      font-shadow: 0 0 0.5 rgba(0, 0, 0, 0.7);
      // font-weight: bold;
      list-style: none;
      max-width: 20rem;
      margin: 0.5rem 0;
      padding: 0.3rem .65rem;
      width: 100%;
    }
    dialog {
      position: relative;
      padding: 2rem;
      border: 0.05rem solid #ccc;
      border-radius: 1rem;
    }
    dialog::backdrop {
      background-color: rgba(0, 0, 0, 0.8);
    }
    .close-dialogue {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: inline-block;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 5rem;
      border: 0.05rem solid #ccc;
    }
    pre {
      text-align: left;
      max-width: 25rem;
      white-space: pre-wrap;
    }
    textarea {
      text-align: left;
      max-width: 25rem;
      white-space: pre-wrap;
      width: 100%;
      display: block;
      min-height: 15rem;
    }

    dialog h2 {
      font-size: 1.4rem;
      margin-top: 0;
    }
  `

  //  END:  Styling
  // ------------------------------------------------------
  // START: rendering

  render() {
    return html`
      <h1>Firing pricing adjuster</h1>
      <ul class="input-fields">
        <li class="key-value-pair">
          <label for="firingDate">Unpacking date:</label>
          <input id="firingDate"
                 max="${this.maxDate}"
                 min="${this.minDate}"
                 type="date"
                .value=${this.firingDate}
                @change=${this._setProp} />
          ${(this.dateError !== '')
            ? html`<p class="error-msg">${this.dateError}</p>`
            : ''}
        </li>
        <li class="key-value-pair">
          <label for="firingType">Type of firing:</label>
          <select id="firingType"
                .value=${this.firingType}
                @change=${this._setProp}>
            ${firingTypes.map((item : TFiringType) : TemplateResult => html`
              <option value="${item.name}"
                     ?selected=${item.name === this.firingType}>
                ${item.name} ${firingName(item.name)}
              </option>
            `)}
          </select>
        </li>
        <li class="key-value-pair">
          <label for="firingTemp">Top temperature:</label>
          <input id="firingTemp"
                 list="standard-temps"
                 .max="${this.maxTemp}"
                 .min="${this.minTemp}"
                 step="10"
                 type="number"
                .value=${this.firingTemp}
                @change=${this._setProp} />
          ${(this.tempError !== '')
            ? html`<p class="error-msg">${this.tempError}</p>`
            : ''}
          <datalist id="standard-temps">
            ${repeat(
              firingTemps.filter((item: number) => (item >= this.minTemp && item <= this.maxTemp)),
              (item) => item,
              (item : number) : TemplateResult => html`
              <option value="${item}"></option>`
            )}
          </datalist>
        </li>
        <li class="key-value-pair">
          <label for="firingCost">Cost of firing:</label>
          <input id="firingCost"
                 max="200"
                 min="0"
                 step="1"
                 type="number"
                .value=${this.firingCost}
                @change=${this._setProp} />
        </li>
        <li class="doer-list">
          <span class="name-list--label">Packed by:</span>
          <span class="name-list--list">${listMemberNames(this.packedBy)}</span>
          ${(this.packedBy.length < 6)
            ? html `<button value="set-packed-by" @click=${this._addDoer}>+</button>`
            : ''}

          ${(this.packedBy.length > 0)
            ? html`<button value="remove-packed-by" @click=${this._removeDoer}>-</button>`
            : ''}
        </li>
        <li class="doer-list">
          <span class="name-list--label">Unpacked by:</span>
          <span class="name-list--list">${listMemberNames(this.pricedBy)}</span>
          ${(this.pricedBy.length < 5)
            ? html `<button value="set-priced-by" @click=${this._addDoer}>+</button>`
            : ''}

          ${(this.pricedBy.length > 0)
            ? html`<button value="remove-priced-by" @click=${this._removeDoer}>-</button>`
            : ''}
        </li>
      </ul>
      ${(this._showErrors())
        ? html`<ul class="data-errors">
          ${(this.firingDate === '')
            ? html`<li class="error-msg">Please enter the date the firing was unpacked</li>`
            : ''
          }
          ${(this.packedBy.length === 0)
            ? html`<li class="error-msg">Please list one or more of the people who packed the kiln.</li>`
            : ''
          }
          ${(this.pricedBy.length === 0)
            ? html`<li class="error-msg">Please list one or more of the people who unpacked the kiln.</li>`
            : ''
          }
        </ul>`
        : ''
      }
      <p class="buttons-list">
        ${(this._showErrors() === false && this.work.length === 0)
          ? html`<button @click=${this._addMaker}>Start pricing</button>`
          : ''
        }
        <button @click=${this._memberManager}>Manage members</button>
        <button @click=${this._reset}>Reset firing</button>
      </p>
      <dialog id="member-dialogue">
        <h2>${(this.useMember) ? 'Select a member' : 'Manage members'}</h2>
        <member-list .action="${this.action}"
                     ?editable=${!this.useMember}
                     .list=${this.membersList}
                     @save-member=${this._updateMember}
                     @use-member=${this._useMember}></member-list>
        <button aria-label="Close member list" class="close-dialogue" @click=${this._closeMemberList}>X</button>
      </dialog>
      ${(this.work.length > 0)
        ? html`<price-list .adjustment=${this.adjustmentFactor}
                           .cost=${this.firingCost}
                           .work=${this.work}
                           @add-maker=${this._addMaker}
                           @update-maker=${this._updateMaker}
                           @show-report=${this._showReport}></price-list>`
        : ''
      }
      <dialog id="price-report">
        <h2>Pricing report to send to members</h2>
        <textarea>${this.report}</textarea>
        <!-- <pre>${this.report}</pre> -->
        <button aria-label="Close member list" class="close-dialogue" @click=${this._closePriceReport}>X</button>
        <button aria-label="Copy report" @click=${this._copyReport}>Copy</button>
      </dialog>
    `;
  }

  //  END:  rendering
  // ------------------------------------------------------
  // START: Lifecycle methods

  connectedCallback(): void {
    super.connectedCallback();

    this.maxDate = dateFromISO(new Date());
    this.minDate = dateFromISO(new Date(Date.now() - 2592000000));

    if (storageAvailable('localStorage')) {
      this.storageType = 'localStorage';
    } else if (storageAvailable('sessionStorage')) {
      this.storageType = 'sessionStorage';
    }

    if (this.storageType !== '') {
      const firingDate = this._getLocalData('firingDate') as string;
      if (firingDate !== null) {
        this.firingDate = firingDate;
      } else {
        this._persistLocally('firingDate', this.firingDate);
      }

      const firingType = this._getLocalData('firingType') as string;
      if (firingType !== null) {
        this.firingType = firingType;
      } else {
        this._persistLocally('firingType', this.firingType);
      }
      this._setMinMaxTemp();

      const firingTemp = this._getLocalData('firingTemp') as string;
      if (firingTemp !== null) {
        this.firingTemp = parseInt(firingTemp, 10);
      } else {
        this._persistLocally('firingTemp', this.firingTemp);
      }

      const firingCost = this._getLocalData('firingCost') as string;
      if (firingCost !== null) {
        this.firingCost = parseInt(firingCost, 10);
      } else {
        this._persistLocally('firingCost', this.firingCost);
      }

      const packedBy = this._getLocalData('packedBy') as string;
      if (packedBy !== null) {
        this.packedBy = JSON.parse(packedBy);
      } else {
        this._persistLocally('packedBy', this.packedBy);
      }

      const pricedBy = this._getLocalData('pricedBy') as string;
      if (pricedBy !== null) {
        this.pricedBy = JSON.parse(pricedBy);
      } else {
        this._persistLocally('pricedBy', this.pricedBy);
      }

      const membersList = this._getLocalData('membersList') as string;
      if (membersList !== null) {
        this.membersList = sortMembers(JSON.parse(membersList));
      } else {
        this._persistLocally('membersList', sortMembers(this.membersList));
      }

      const work = this._getLocalData('work') as string;
      if (work !== null) {
        this.work = JSON.parse(work);
      } else {
        this._persistLocally('work', this.work);
      }
    }
  }

  //  END:  Lifecycle methods
  // ------------------------------------------------------
}

declare global {
  interface HTMLElementTagNameMap {
    'firing-pricing-adjuster': FiringPricingAdjuster
  }
}
