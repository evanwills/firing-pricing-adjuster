import { TemplateResult, html } from "lit";
import { TFiringType } from "../../types/price-sheet";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { firingName } from "./general.utils";


export const firingHelp = (item : TFiringType) : TemplateResult => html`
  <li>
    ${firingName(item.name)}
    (${item.min}${unsafeHTML('&deg; &ndash;')} ${item.max}${unsafeHTML('&deg;')},
    default: ${item.default}${unsafeHTML('&deg;')})
  </li>
`;

export const unpackingDateInfo = () => html`
  <h4 id="unpack-date">Unpacking date</h4>

  <p>The unpacking date helps people know when the work was fired. This may be important if people know when their work was likely to be fired.</p>
  <p>It must be a date within the last thirty days.</p>
`;

export const firingTypeInfo = (firingTypes : Array<TFiringType>) => html`
  <h4 id="firing-type">Type of firing</h4>

  <p>The type of firing helps people know if their work was likely to be included in the firing that was is being priced here.

  <p>There are seven firing types:</p>
  <ul>
    ${firingTypes.map(firingHelp)}
  </ul>

  <p class="note"><strong>Note:<strong> Firing type sets the minimum and maximum limits on <a href=#top-temp">Top temperature</a>. When it is changed, it also updates the <a href=#top-temp">Top temperature</a> to the default for that firing type.</p>
`;

export const topTempInfo = () => html`
  <h4 id="top-temp">Top temperature</h4>

  <p>Indicatest top (target) temperature for the firing being priced. It's limits are set by the firing type.</p>

  <p class="note"><strong>Note:<strong> An error will be shown if the "Top temperature" is outside the limits defined by <a href=#firing-type">Firing type</a>.</p>
`;

export const costOfFringInfo = () => html`
  <h4 id="top-temp">Cost of firing</h4>

  <p>Defines the fixed cost per firing. This is used to adjust the prices to ensure the total cost of the work in the kiln matches the fixed cost per firing.</p>
`;

export const addToList = (field : string) => html`
<ul>
  <li>Find the name of the person you wish to add to the list and click "Use"</li>
  <li>If you cannot find the name, enter the name you want into the box with "name (e.g. Gabe)" in it. Then click "Add". This will add the new person to the list of members and add them to the ${field} list.</li>
  <li>If there are lots (more than 5) of people in the list you can filter the list using the filter box at the top then do either of the above.
<ul>
`;

export const packingInfo = (id: string, field : string, action: string) => html`
<h4 id="${id}">${field}</h4>

<p>Packed by is used to acknowledge the efforts of the people doing the actual work to ${action} a firing.</p>

<p>Packed by is a list of people's names who packed the kiln whose work is being priced here.</p>

<p>To add a name here:</p>
<ol>
  <li>Click on the "+" button on the right.</li>
  <li>${addToList('Packed by')}</li>
  <li>Add the names of everyone helping ${action} the kiln.</li>
</ol>

<p>To remove the last person from the ${field} list, just click "-" button on the right.</p>

<p class="note"><strong>Note:<strong> If the person you wish to remove is not the last person, you'll have to remove all the people after them and re-add them later.</p>`;

export const packedByInfo = () => packingInfo('packed-by', 'Packed by', 'packing');
export const pricedByInfo = () => packingInfo('unpacked-by', 'Unpacked by', 'unpacking');
