import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { getEventDetails } from '../utils/member.utils';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('member-details')
export class MemberDetails extends LitElement {
  // ------------------------------------------------------
  // START: Property/Attribute declarations

  /**
   * Additional action (if any) to be performed after the user
   * is added/updated
   */
  @property({ type: String })
  action: string = '';

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Boolean })
  editable : boolean = false;

  /**
   * Copy for the read the docs hint.
   */
  @property({ type: String })
  memberId : string = '';

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: String })
  makersMark : string = '';

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: String })
  name : string= '';

  //  END:  Property/Attribute declarations
  // ------------------------------------------------------
  // START: State prop declarations

  /**
   * Whether or not the component is in edit mode
   */
  @state()
  editing : boolean = false;

  /**
   * Whether or not the component is in edit mode
   */
  @state()
  newName : string = '';

  /**
   * Whether or not the component is in edit mode
   */
  @state()
  newMark : string = '';

  @state()
  save : string = 'Save';

  @state()
  edit : string = 'Edit';

  //  END:  Property/Attribute declarations
  // ------------------------------------------------------
  // START: Private methods

  private _onClick() {
    if (this.newName !== '') {
      if (this.editable === false && this.editing === false) {
        this.dispatchEvent(new CustomEvent('use-member', getEventDetails(this)));
      } else {
        if (this.editing === true) {
          console.log('dispatching "save-member"');
          this.dispatchEvent(new CustomEvent('save-member', getEventDetails(this)));
        }

        if (this.memberId !== '') {
          this.editing = !this.editing;
        } else {
          this.newName = '';
        }
      }
    } else {
      console.warn('Prevented adding/saving member');
    }
  }

  private _memberChange(event: InputEvent) {
    const target = event.target as HTMLInputElement;

    this.newName = target.value;
  }

  //  END:  Private methods
  // ------------------------------------------------------
  // START: Styling

  static styles = css`
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0rem;
      text-align: center;
    }
    img, label, input[file] {
      display: none;
    }
    li {
      display: flex;
      column-gap: 0.5rem;
      text-align: left;
      margin: 0;
      padding: 0.75rem 0;
      border-top: 0.05rem solid #ccc;
    }
    li + li {
    }
    li *:first-child {
      flex-grow: 1;
    }
    button {
      border-radius: 5rem;
      padding: 0.2rem 0.5rem;
      border: 0.1rem solid #ccc;
    }
  `

  //  END:  Styling
  // ------------------------------------------------------
  // START: rendering

  render() {
    return html`
      <li ?id="${this.memberId !== '' ? this.memberId : undefined}">
        ${(this.editing === true)
          ? html`
            <input type="text"
                  .value=${this.newName}
                   aria-label="Member name"
                   placeholder="name (e.g. Gabe)"
                  @change=${this._memberChange}
                  @keyup=${this._memberChange} />`
          : html`
            <span class="name">${this.name}</span>
            <img src="${this.makersMark}" />`}
        <button ?disabled=${this.newName.trim() === ''}
                @click=${this._onClick}>
          ${(this.editing === true)
            ? this.save
            : this.edit}
        </button>
      </li>
    `
  }

  //  END:  rendering
  // ------------------------------------------------------
  // START: Lifecycle methods

  connectedCallback(): void {
    super.connectedCallback();

    if (this.memberId === '') {
      this.editing = true;
      this.save = 'Add';
    } else if (this.editable === false) {
      this.edit = 'Use';
    }
    this.newName = this.name;
  }

  // attributeChangedCallback() : void {
  //   console.group('attributeChangedCallback()')
  //   console.log('this:', this);
  //   console.log('this.memberId:', this.memberId);
  //   console.log('this.name:', this.name);
  //   console.log('this.makersMark:', this.makersMark);
  //   console.log('this.editable:', this.editable);
  //   console.log('this.editing:', this.editing);
  //   console.log('this.save:', this.save);
  //   console.log('this.edit:', this.edit);
  //   console.groupEnd();
  // }

  //  END:  Lifecycle methods
  // ------------------------------------------------------
}

declare global {
  interface HTMLElementTagNameMap {
    'member-details': MemberDetails
  }
}
