import { TemplateResult, html } from 'lit'
import { repeat } from 'lit/directives/repeat.js';
// import { customElement, property, state } from 'lit/decorators.js'
import { TMember } from '../../types/people.d';

export const memberData = (
  editing: boolean,
  name: string,
  makersMark: string,
  handler: Function
) : TemplateResult => (editing === true)
  ? html`
    <input type="text"
          .value=${name}
           aria-label="Member name"
           placeholder="Add new member"
          @change=${handler} />`
  : html`<span class="name">${name}</span> <img src="${makersMark}" />`;

export const fullMember = (
  id : string,
  name : string,
  makersMark : string,
  editable : boolean,
  editing : boolean,
  save : string,
  edit : string,
  changeHandler : Function,
  clickHandler : Function) => html`
  <li ?id="${id !== '' ? id : undefined}">
    ${memberData(editable, name, makersMark, changeHandler)}
    <button @click=${clickHandler}>${(editing === true) ? save : edit}</button>
  </li>
`;

export const memberList = (
  list : Array<TMember>,
  editable : boolean,
  action : string,
  search : Function,
  // clearFilter : Function,
) => html`
${(list.length > 5)
  ? html`
      <input type="search"
             aria-label="Filter members"
             @keyup=${search} />`
  : ''}
<ul class="members-list">
  ${repeat(list, (member : TMember) => member.id, (member : TMember) => html`
    <member-details
      .action=${action}
      ?editable=${editable}
      .memberId=${member.id}
      .name=${member.name}
      .makersMark=${member.makersMark}></member-details>`)}
    ${(list.length < 5)
      ? html`<member-details
        .action=${action}
        editable
        member-id=""
        name=""
        makers-mark=""></member-details>`
      : ''}
</ul>
`;
