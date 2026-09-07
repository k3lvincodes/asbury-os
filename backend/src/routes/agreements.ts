import { Hono } from 'hono';

const AGREEMENT_CONTENT = `<h1>Dump Trailer Service Agreement &amp; Terms of Use</h1>
<p><em>Charleston, West Virginia &amp; Surrounding Areas</em></p>
<p>This Dump Trailer Service Agreement ("Agreement") is between Asbury Outdoor Services ("Company," "we," "us," or "our") and the customer identified in the booking ("Customer," "you," or "your"). This Agreement applies to the specific reservation identified in the booking confirmation. By electronically signing this Agreement, you acknowledge that you have read, understood, and agree to these terms.</p>

<h2>1. Service &amp; Rental Terms</h2>
<ul>
  <li>Asbury Outdoor Services will deliver one 7×14 dump trailer to the Customer's approved location. The Customer loads the trailer, and Asbury Outdoor Services returns to pick it up and dispose of the contents.</li>
  <li>Customers are not authorized to move, tow, relocate, or operate the trailer on public roads for any reason.</li>
  <li>The Customer is responsible for the trailer and its contents from delivery until pickup by Asbury Outdoor Services.</li>
  <li>Loads must remain level with or below the top rails and within the trailer's posted payload capacity.</li>
  <li>Overloaded, unsafe, or improperly loaded trailers may be refused pickup until the Customer corrects the load.</li>
  <li>The trailer may not be altered, modified, or have signage attached without prior written approval.</li>
  <li>The Customer must provide a safe, legal, and reasonably accessible placement and pickup location.</li>
</ul>

<h2>2. Rental Pricing</h2>
<ul>
  <li>Up to 24 hours: $225.</li>
  <li>Up to 3 days: $400.</li>
  <li>Up to 7 days: $600.</li>
  <li>Each rental includes up to 1 ton (2,000 lbs.) of disposed material, delivery, one final pickup, and one dump/disposal run within the included service area.</li>
  <li>Disposal weight above the included 1 ton is charged at $125 per additional ton. Partial tons may be prorated based on the final scale weight.</li>
  <li>Additional rental time beyond the purchased period is $75 per additional day, subject to availability and prior approval.</li>
  <li>Delivery and pickup are included within 10 miles of Charleston, West Virginia. Locations beyond that service area are charged $3.00 per additional mile.</li>
  <li>A final dump ticket or weight slip can be provided upon request.</li>
</ul>

<h2>3. Additional Charges</h2>
<ul>
  <li>If the trailer is blocked, inaccessible, overloaded, or otherwise not ready for the scheduled pickup, a $75 return-trip fee may be charged.</li>
  <li>Excessive cleaning beyond normal use may result in a cleaning fee of up to $100.</li>
  <li>Returned or failed payments may be charged $35 or the maximum amount permitted by applicable law, whichever is less.</li>
  <li>The Customer is responsible for actual disposal charges, fines, cleanup costs, damage, or other expenses resulting from prohibited materials or misuse.</li>
  <li>The Customer authorizes Asbury Outdoor Services to charge the payment method provided for amounts properly due under this Agreement, including excess weight, approved extensions, damage, prohibited-material charges, and other applicable fees.</li>
</ul>

<h2>4. Prohibited &amp; Restricted Materials</h2>
<ul>
  <li>Do not load hazardous chemicals or hazardous waste, paint, oils, solvents, batteries, illegal substances, or any material prohibited by the disposal facility or applicable law.</li>
  <li>Concrete, large logs/stumps, large appliances, and other unusually heavy or special-disposal items may not be loaded unless Asbury Outdoor Services gives prior written approval.</li>
  <li>Do not load material above the top rails or in a way that prevents safe operation of the tailgate or dump bed.</li>
  <li>If you are unsure whether an item is accepted, contact Asbury Outdoor Services before loading it.</li>
</ul>

<h2>5. Damage, Loss &amp; Property</h2>
<ul>
  <li>The Customer is responsible for damage to or loss/theft of the trailer occurring while it is in the Customer's possession, except to the extent prohibited by applicable law.</li>
  <li>Any damage, theft, accident, or incident involving the trailer must be reported to Asbury Outdoor Services within 12 hours of discovery.</li>
  <li>The Customer may be responsible for reasonable repair or replacement costs, missing equipment, loss of use, and reasonable claim-related administrative expenses when caused by the Customer, persons under the Customer's control, or prohibited/misused materials.</li>
  <li>Asbury Outdoor Services is not responsible for ordinary surface marks or damage to lawns, driveways, pavement, or other property caused by normal placement or removal of the trailer, except to the extent caused by our negligence or otherwise required by law.</li>
</ul>

<h2>6. Cancellation &amp; Rescheduling</h2>
<ul>
  <li>More than 48 hours before the scheduled delivery: full refund of amounts paid for the rental, less any non-refundable third-party processing fees if applicable.</li>
  <li>24–48 hours before scheduled delivery: 50% refund of the rental charge.</li>
  <li>Less than 24 hours before scheduled delivery or no-show/inability to accept delivery: no refund.</li>
  <li>Early pickup or unused rental time does not result in a refund or credit.</li>
  <li>Weather, access, disposal-facility closures, or other circumstances may require reasonable rescheduling. Any agreed rescheduling will be documented in writing or electronically.</li>
</ul>

<h2>7. Liability &amp; Indemnification</h2>
<ul>
  <li>The Customer assumes responsibility for the Customer's loading activities and for the acts of persons the Customer allows to access or load the trailer.</li>
  <li>To the extent permitted by West Virginia law, the Customer agrees to indemnify and hold Asbury Outdoor Services harmless from third-party claims arising from the Customer's loading, prohibited materials, misuse, or violation of this Agreement.</li>
  <li>Nothing in this Agreement is intended to waive liability that cannot legally be waived or limit rights that cannot legally be limited under applicable law.</li>
</ul>

<h2>8. Governing Law &amp; Entire Agreement</h2>
<ul>
  <li>This Agreement is governed by the laws of the State of West Virginia.</li>
  <li>Any legal dispute concerning this Agreement will be handled in a court of competent jurisdiction in West Virginia, subject to applicable venue and jurisdiction rules.</li>
  <li>If any provision is found unenforceable, the remaining provisions remain in effect.</li>
  <li>Changes to this Agreement must be agreed to in writing or electronically by Asbury Outdoor Services and the Customer.</li>
</ul>

<h2>9. Electronic Acceptance</h2>
<p>By checking the agreement box and/or electronically signing during booking, the Customer confirms that they had an opportunity to review this Agreement before completing the reservation and agrees to be bound by its terms. A copy of the completed Agreement should be retained with the booking record.</p>`;

const agreements = new Hono();

// Get current agreement
agreements.get('/', async (c) => {
  return c.json({
    success: true,
    data: {
      version: '1.0',
      title: 'Dump Trailer Service Agreement & Terms of Use',
      content: AGREEMENT_CONTENT,
    },
  });
});

// Get specific agreement version
agreements.get('/:version', async (c) => {
  const version = c.req.param('version');
  return c.json({
    success: true,
    data: {
      version,
      title: 'Dump Trailer Service Agreement & Terms of Use',
      content: AGREEMENT_CONTENT,
    },
  });
});

// Get signed agreement for a reservation
agreements.get('/signed/:reservationId', async (c) => {
  const reservationId = c.req.param('reservationId');
  return c.json({
    success: true,
    data: {
      reservationId,
      signed: true,
      signedAt: '2026-09-03T10:00:00Z',
      pdfUrl: 'https://res.cloudinary.com/...',
    },
  });
});

export default agreements;
