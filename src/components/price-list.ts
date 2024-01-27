import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { TPerson } from '../../types/people';
import { repeat } from 'lit/directives/repeat.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('price-list')
export class PriceList extends LitElement {
  // ------------------------------------------------------
  // START: Property/Attribute declarations

  /**
   * Additional action (if any) to be performed after the user
   * is added/updated
   */
  @property({ type: Number })
  adjustment: number = 0;

  /**
   * Additional action (if any) to be performed after the user
   * is added/updated
   */
  @property({ type: Number })
  cost: number = 0;

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Array })
  work : Array<TPerson> = [];

  //  END:  Property/Attribute declarations
  // ------------------------------------------------------
  // START: State prop declarations

  //  END:  Property/Attribute declarations
  // ------------------------------------------------------
  // START: Private methods

  private _addNewMaker() : void {
    this.dispatchEvent(new CustomEvent('add-maker', { bubbles: true, composed: true }));
  }

  private _showReport() : void {
    this.dispatchEvent(new CustomEvent('show-report', { bubbles: true, composed: true }));
  }

  private _updateMaker(event : InputEvent) : void {
    console.group('<price-list>._updateMaker()')
    const target = event.target as HTMLInputElement;

    if (target.validity.valid === false) {
      target.value = '';
    } else {
      const index = (typeof target.dataset.index === 'undefined' || target.dataset.index === 'new')
        ? null
        : parseInt(target.dataset.index, 10);
      const value = parseInt(target.value, 10);

      console.log('index:', index);
      console.log('value:', value);

      if (index !== null || value > 0 ) {
        this.dispatchEvent(new CustomEvent(
          'update-maker',
          {
            bubbles: true,
            composed: true,
            detail: {
              id: target.dataset.id,
              index: (target.dataset.index === 'new')
                ? null
                : target.dataset.index,
              value: target.value,
            }
          },
        ));
      }
    }
    console.groupEnd();
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
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    thead {
      vertical-align: bottom;
    }
    td, th {
      border-bottom: 0.05rem solid #ccc;
      padding: 0.3rem 0.5rem;
    }
    tbody td, tbody th {
      text-align: left;
      vertical-align: top;
    }
    tbody th {
      white-space: nowrap;
    }
    td:nth-child(2),
    td:nth-child(3) {
      width: 2.5rem;
      text-align: right;
    }
    td:nth-child(4) {
      width: 4.5rem;
    }
    ul {
      margin: 0;
      padding: 0;
    }
    li {
      list-style-type: none;
      margin: 0;
      padding: 0;
      display: inline-block;
    }
    input {
      display: inline-block;
      width: 3rem;
    }
  `

  //  END:  Styling
  // ------------------------------------------------------
  // START: rendering

  render() {
    return html`
      <!-- <p>Adjustment factor ${Math.round(this.adjustment * 1000) / 1000}</p> -->
      <table>
        <thead>
          <tr>
            <th id="makers-name">Maker's name</th>
            <th id="adjusted-total">True cost</th>
            <th id="raw-total">Raw cost</th>
            <th id="priced-items">Priced items</th>
          </tr>
        </thead>
        <tbody>
          ${repeat(
            this.work,
            (maker : TPerson) => `${maker.id}-${maker.total}`,
            (maker : TPerson) => html`
            <tr>
              <th id="${maker.id}" headers=" makers-name">${maker.member.name}</th>
              <td headers="${maker.id} adjusted-total">$${Math.ceil(maker.adjustedTotal)}</td>
              <td headers="${maker.id} raw-total">$${Math.ceil(maker.total)}</td>
              <td headers="${maker.id} priced-items">
                <ul>
                  ${repeat(
                    maker.pieces,
                    (piece, index) => `${index}-${piece}`,
                    (piece, index) => html`
                      <li>
                        $<input aria-label="Piece number ${index + 1} for ${maker.member.name}"
                                data-id="${maker.id}"
                                data-index="${index}"
                              .max="${this.cost}"
                                min="0"
                                pattern="^[1-9][0-9]*(?:\.[0-9]{1,2})$"
                                required
                                step="0.1"
                                type="number"
                              .value="${piece}"
                              @change=${this._updateMaker} />
                      </li>`,
                    )}
                  <li>
                    $<input aria-label="Add new piece for ${maker.member.name}"
                            data-id="${maker.id}"
                            data-index="new"
                           .max="${this.cost}"
                            min="0"
                            pattern="^[1-9][0-9]*(?:\.[0-9]{1,2})$"
                            required
                            step="0.1"
                            type="number"
                            value=""
                           @change=${this._updateMaker} />
                  </li>
                </ul>
              </td>
            </tr>
          `)}
        </tbody>
      </table>
      <p>
        <button @click=${this._addNewMaker}>Add another maker</button>
        <button @click=${this._showReport}>Show price report</button>
      </p>
    `
  }

  //  END:  rendering
  // ------------------------------------------------------
  // START: Lifecycle methods

  // connectedCallback(): void {
  //   super.connectedCallback();
  // }

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
    'price-list': PriceList
  }
}
