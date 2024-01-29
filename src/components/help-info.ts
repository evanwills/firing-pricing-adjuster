import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js';
import { TFiringType } from '../../types/price-sheet';
import {
  firingTypeInfo,
  packedByInfo,
  pricedByInfo,
  topTempInfo,
  unpackingDateInfo,
} from '../utils/pure-renderers';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('help-info')
export class HelpInfo extends LitElement {
  // ------------------------------------------------------
  // START: Property/Attribute declarations

  @property({ type: Array })
  firingTypes : Array<TFiringType> = []

  //  END:  Property/Attribute declarations
  // ------------------------------------------------------
  // START: State prop declarations

  //  END:  Property/Attribute declarations
  // ------------------------------------------------------
  // START: Private methods

  //  END:  Private methods
  // ------------------------------------------------------
  // START: Styling

  static styles = css`
  `

  //  END:  Styling
  // ------------------------------------------------------
  // START: rendering

  render() {
    return html`
      <section>
        <h2>Firing pricing adjuster help</h2>

        <p>This tool provides a quick, reliable way to price work coming out of a kiln so it adds up to the total cost of the firing.</p>

        <h3 id="firing-data">Firing data</h3>

        <p>Firing data has six fields which help provide other members info about who is doing the actual work and what kind of firing was unpacked. The firing cost is never shown to end users but it is required to adjust the final prices.</p>

        ${unpackingDateInfo()}
        ${firingTypeInfo(this.firingTypes)}
        ${topTempInfo()}
        ${packedByInfo()}
        ${pricedByInfo()}

        <h3 id="managing-members">Managing members</h3>


      <section>
    `
  }

  //  END:  rendering
  // ------------------------------------------------------
  // START: Lifecycle methods


  //  END:  Lifecycle methods
  // ------------------------------------------------------
}

declare global {
  interface HTMLElementTagNameMap {
    'help-info': HelpInfo
  }
}
