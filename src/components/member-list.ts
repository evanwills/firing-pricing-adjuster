import { LitElement, css, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { customElement, property, state } from 'lit/decorators.js'
import { TMember } from '../../types/people.d';
import './member-details';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('member-list')
export class MemberList extends LitElement {
  /**
   *
   */
  @property({ type: String })
  action: string = '';

  /**
   * Copy for the read the docs hint.
   */
  @property({ type: Array })
  list : Array<TMember> = [];
  /**
   * Copy for the read the docs hint.
   */
  @property({ type: Boolean })
  editable : boolean = false;

  @state()
  newEditable : boolean = true;


  static styles = css`
    ul {
      border-bottom: 0.05rem solid #ccc;
      margin: 0.5rem 0 0;
      padding: 0;
    }
    input[type=search] {
      display: block;
      width: 100%;
    }
  `

  render() {
    return html`
      <ul class="members-list">
        ${repeat(this.list, (member : TMember) => `${member.id}-${this.editable}`, (member : TMember) => html`
          <member-details
            .action=${this.action}
            ?editable=${this.editable}
            .memberId=${member.id}
            .name=${member.name}
            .makersMark=${member.makersMark}></member-details>`)}
        <member-details
          .action=${this.action}
          editable
          member-id=""
          name=""
          makers-mark=""></member-details>
      </ul>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'member-list': MemberList
  }
}
