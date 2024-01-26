import { LitElement, TemplateResult, css, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { TMember, TPerson } from '../types/people.d'
import { TMemberDetailsEventData } from '../types/components.d'
// import { TPriceSheet } from '../types/price-sheet.d';
import { listMemberNames } from './utils/member.utils'
import { storageAvailable } from './utils/general.utils'
import './components/member-list'

const firingTypes : Array<string> = [
  'Bisque',
  'Earthenware',
  'Midfire',
  'Stoneware',
];

const firingTemps : Array<number> = [
  1000,
  1080,
  1120,
  1210,
  1280,
];

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
    {
      id: 'evanw',
      name: 'Evan Wills',
      makersMark: 'boo'
    },
    {
      id: 'georgiep',
      name: 'Georgie Pike',
      makersMark: 'boo'
    }
  ]

  @state()
  action : string = '';

  @state()
  firingType : string = 'Bisque';

  @state()
  firingTemp : number = 1000;

  @state()
  firingCost : number = 85;

  @state()
  firingDate : string = '';

  @state()
  packedBy : Array<TMember> = [];

  @state()
  pricedBy : Array<TMember> = [];

  @state()
  useMember : boolean = true;

  @state()
  work : Array<TPerson> = [];

  @state()
  showMemberList : boolean = false;

  @state()
  maxDate : string = '';

  @state()
  minDate : string = '';

  @state()
  modal : HTMLDialogElement|null = null;

  @state()
  storageType : string = '';

  //  END:  Property/Attribute declarations
  // ------------------------------------------------------
  // START: Private methods

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

  private _notInList(list: Array<TMember|TPerson>, id: string) : boolean {
    for (let a = 0; a < list.length; a += 1) {
      if (list[a].id === id) {
        return false;
      }
    }
    return true;
  }


  private _getUniqueID(list: Array<TMember>, userName: string) : string {
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

    throw new Error(`_getUniqueID() was unable to generate a unique ID for ${userName}`);
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

  private _getLocalData(prop : string) {
    switch (this.storageType) {
      case 'localStorage':
        return localStorage.getItem(prop);

      case 'sessionStorage':
        return sessionStorage.getItem(prop);
    }
  }

  private _updateMember(event : TMemberDetailsEventData) : void {
    let { action, id, mark, name } = event.detail;
    let _id = id;

    if (_id === '') {
      _id = this._getUniqueID(this.membersList, name);
      this.membersList = [...this.membersList, {
        id: _id,
        name: event.detail.name,
        makersMark: '',
      }];
    } else {
      this.membersList = this.membersList.map((member) => (member.id === _id)
        ? ({
          ...member,
          name: name,
          makersMark: mark,
        })
        : member
      );
    }
    this._persistLocally('membersList', this.membersList);

    if (action !== '') {
      this._addUser(action, _id);
      this.showMemberList = false;
      this.modal?.close();
    }
  }

  private _useMember(event : TMemberDetailsEventData) : void {
    let { action, id } = event.detail;

    if (action !== '') {
      this._addUser(action, id);
      this.showMemberList = false;
      this.modal?.close();
    }
  }

  private _showModal() {
    console.group('_showModal()');
    console.log('this.modal (before):', this.modal);
    if (this.modal === null) {
      const tmp = this.renderRoot.querySelector('#member-dialogue');
      console.log('tmp:', tmp);


      if (typeof tmp !== 'undefined' && tmp !== null) {
        this.modal = tmp as HTMLDialogElement;
      }
    }
    console.log('this.modal (after):', this.modal);

    if (this.modal !== null && typeof this.modal !== 'undefined') {
      this.modal.showModal();
    }
  }

  private _addDoer(event : InputEvent) : void {
    const target = event.target as HTMLButtonElement;

    if (target !== null) {
      this.action = target.value;
      this._showModal();
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

  private _memberManager() : void {
    console.group('_memberManager()');
    console.log('this.action (before):', this.action);
    console.log('this.useMember (before):', this.useMember);
    this.action = '';
    this.useMember = false;
    this.membersList = [...this.membersList];

    this._showModal();
    console.log('this.action (after):', this.action);
    console.log('this.useMember (after):', this.useMember);
    console.groupEnd();
  }

  private _setProp (event : InputEvent) : void {
    const target = event.target as HTMLInputElement;

    if (target !== null) {
      console.log('target:', target);
      const { id, value } = target;
      let skip = true;

      switch (id) {
        case 'firingDate':
          this.firingDate = value;
          skip = false;
          break;

        case 'firingType':
          this.firingType = value;
          skip = false;
          break;

        case 'firingTemp':
          this.firingTemp = parseInt(value, 10);
          skip = false;
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
    .data-errors li {
      text-align: left;
      list-style: none;
      border: 0.1rem solid #fff;
      border-radius: 0.5rem;
      background-color: #a00;
      padding: 0.3rem .65rem;
      max-width: 20rem;
      margin: 0.5rem 0;
      font-weight: bold;
      font-shadow: 0 0 0.5 rgba(0, 0, 0, 0.7);
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
          <label for="firingDate">Date firing started:</label>
          <input id="firingDate"
                 max="${this.maxDate}"
                 min="${this.minDate}"
                 type="date"
                .value=${this.firingDate}
                @change=${this._setProp} />
        </li>
        <li class="key-value-pair">
          <label for="firingType">Type of firing:</label>
          <select id="firingType"
                .value=${this.firingType}
                @change=${this._setProp}>
            ${firingTypes.map((item : string) : TemplateResult => html`
              <option value="${item}" ?selected=${item === this.firingType}>${item}</option>
            `)}
          </select>
        </li>
        <li class="key-value-pair">
          <label for="firingTemp">Top temperature:</label>
          <input id="firingTemp"
                 list="standard-temps"
                 max="1320"
                 min="573"
                 step="10"
                 type="number"
                .value=${this.firingTemp}
                @change=${this._setProp} />
          <datalist id="standard-temps">
            ${firingTemps.map((item : number) : TemplateResult => html`
              <option value="${item}"></option>
            `)}
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
      ${(this.firingDate === '' || this.packedBy.length === 0 || this.pricedBy.length === 0)
        ? html`<ul class="data-errors">
          ${(this.firingDate === '')
            ? html`<li>Please enter the date the firing started</li>`
            : ''
          }
          ${(this.packedBy.length === 0)
            ? html`<li>Please list one or more of the people who packed the kiln.</li>`
            : ''
          }
          ${(this.pricedBy.length === 0)
            ? html`<li>Please list one or more of the people who unpacked the kiln.</li>`
            : ''
          }
        </ul>`
        : html`<button>Start pricing</button>`
      }
      <button @click=${this._memberManager}>Manage members</button>
      <dialog id="member-dialogue">
        <h2>${(this.useMember) ? 'Select a member' : 'Manage members'}</h2>
        <member-list .action="${this.action}"
                     ?editable=${!this.useMember}
                     .list=${this.membersList}
                     @save-member=${this._updateMember}
                     @use-member=${this._useMember} ></member-list>
      </dialog>
      <dialog id="price-report"></dialog>
    `;
  }

  //  END:  rendering
  // ------------------------------------------------------
  // START: Lifecycle methods

  connectedCallback(): void {
    super.connectedCallback();

    this.maxDate = new Date().toISOString();
    this.minDate = new Date(Date.now() - 2592000000).toISOString();

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
      console.log('members')
      if (membersList !== null) {
        this.membersList = JSON.parse(membersList);
      } else {
        this._persistLocally('membersList', this.membersList);
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
