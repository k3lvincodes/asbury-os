import { Hono } from 'hono';
import { Env } from '../worker';
import { createSupabaseServiceClient } from '../config/supabase';

const agreements = new Hono<{ Bindings: Env }>();

// Format cents to dollar string e.g. 22500 -> "$225"
function fmt(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}

interface Pricing {
  package_24h_price: number;
  package_3d_price: number;
  package_7d_price: number;
  extra_day_price: number;
  extra_mile_price: number;
  overweight_per_ton: number;
  failed_pickup_fee: number;
  cleaning_fee_max: number;
  included_miles: number;
}

const DEFAULT_PRICING: Pricing = {
  package_24h_price: 22500,
  package_3d_price: 37500,
  package_7d_price: 67500,
  extra_day_price: 7500,
  extra_mile_price: 300,
  overweight_per_ton: 12500,
  failed_pickup_fee: 7500,
  cleaning_fee_max: 10000,
  included_miles: 10,
};

async function fetchPricing(c: { env: Env }): Promise<Pricing> {
  try {
    if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) return DEFAULT_PRICING;
    const supabase = createSupabaseServiceClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data } = await supabase.from('pricing').select('*').limit(1).single();
    if (!data) return DEFAULT_PRICING;
    return { ...DEFAULT_PRICING, ...data };
  } catch {
    return DEFAULT_PRICING;
  }
}

function buildAgreementContent(p: Pricing): string {
  return `
<div style="font-family: Georgia, 'Times New Roman', serif; color: #1a1a2e; line-height: 1.8; font-size: 14px;">

<div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #1a5632;">
  <h1 style="font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; letter-spacing: 0.5px;">DUMP TRAILER SERVICE AGREEMENT</h1>
  <p style="font-size: 13px; color: #666; margin: 0; text-transform: uppercase; letter-spacing: 2px;">&amp; Terms of Use</p>
  <p style="font-size: 13px; color: #888; margin: 12px 0 0;">Asbury Outdoor Services &mdash; Charleston, West Virginia</p>
</div>

<p style="margin: 0 0 16px; font-size: 14px;">This Dump Trailer Service Agreement (<strong>"Agreement"</strong>) is between <strong>Asbury Outdoor Services</strong> (<strong>"Company," "we," "us,"</strong> or <strong>"our"</strong>) and the customer identified in the booking (<strong>"Customer," "you,"</strong> or <strong>"your"</strong>). This Agreement applies to the specific reservation identified in the booking confirmation. By electronically signing this Agreement, you acknowledge that you have read, understood, and agree to be bound by its terms.</p>

<div style="background: #f8f9fa; border-left: 3px solid #1a5632; padding: 16px 20px; margin: 24px 0; border-radius: 0 6px 6px 0;">
  <p style="margin: 0; font-size: 13px; color: #555;"><strong>Important:</strong> Please read this Agreement carefully before completing your reservation. You may retain a copy of this Agreement with your booking records.</p>
</div>

<h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">1. Service &amp; Rental Terms</h2>
<ul style="margin: 0; padding-left: 20px;">
  <li style="margin-bottom: 10px;">Asbury Outdoor Services will deliver one 7&times;14 dump trailer to the Customer's approved location. The Customer loads the trailer, and Asbury Outdoor Services returns to pick it up and dispose of the contents.</li>
  <li style="margin-bottom: 10px;">Customers are <strong>not authorized</strong> to move, tow, relocate, or operate the trailer on public roads for any reason.</li>
  <li style="margin-bottom: 10px;">The Customer is responsible for the trailer and its contents from delivery until pickup by Asbury Outdoor Services.</li>
  <li style="margin-bottom: 10px;">Loads must remain level with or below the top rails and within the trailer's posted payload capacity.</li>
  <li style="margin-bottom: 10px;">Overloaded, unsafe, or improperly loaded trailers may be refused pickup until the Customer corrects the load.</li>
  <li style="margin-bottom: 10px;">The trailer may not be altered, modified, or have signage attached without prior written approval.</li>
  <li style="margin-bottom: 10px;">The Customer must provide a safe, legal, and reasonably accessible placement and pickup location.</li>
</ul>

<h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">2. Rental Pricing</h2>
<ul style="margin: 0; padding-left: 20px;">
  <li style="margin-bottom: 10px;">Up to 24 hours: <strong>${fmt(p.package_24h_price)}</strong></li>
  <li style="margin-bottom: 10px;">Up to 3 days: <strong>${fmt(p.package_3d_price)}</strong></li>
  <li style="margin-bottom: 10px;">Up to 7 days: <strong>${fmt(p.package_7d_price)}</strong></li>
  <li style="margin-bottom: 10px;">Each rental includes up to <strong>1 ton (2,000 lbs.)</strong> of disposed material, delivery, one final pickup, and one dump/disposal run within the included service area (first <strong>${p.included_miles} miles</strong>).</li>
  <li style="margin-bottom: 10px;">Disposal weight above the included 1 ton is charged at <strong>${fmt(p.overweight_per_ton)} per additional ton</strong>. Partial tons may be prorated based on the final scale weight.</li>
  <li style="margin-bottom: 10px;">Additional rental time beyond the purchased period is <strong>${fmt(p.extra_day_price)} per additional day</strong>, subject to availability and prior approval.</li>
  <li style="margin-bottom: 10px;">Delivery and pickup are included within ${p.included_miles} miles of Charleston, West Virginia. Locations beyond that service area are charged <strong>${fmt(p.extra_mile_price)} per additional mile</strong>.</li>
  <li style="margin-bottom: 10px;">A final dump ticket or weight slip can be provided upon request.</li>
</ul>

<h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">3. Additional Charges</h2>
<ul style="margin: 0; padding-left: 20px;">
  <li style="margin-bottom: 10px;">If the trailer is blocked, inaccessible, overloaded, or otherwise not ready for the scheduled pickup, a <strong>${fmt(p.failed_pickup_fee)} return-trip fee</strong> may be charged.</li>
  <li style="margin-bottom: 10px;">Excessive cleaning beyond normal use may result in a cleaning fee of up to <strong>${fmt(p.cleaning_fee_max)}</strong>.</li>
  <li style="margin-bottom: 10px;">Returned or failed payments may be charged <strong>$35</strong> or the maximum amount permitted by applicable law, whichever is less.</li>
  <li style="margin-bottom: 10px;">The Customer is responsible for actual disposal charges, fines, cleanup costs, damage, or other expenses resulting from prohibited materials or misuse.</li>
  <li style="margin-bottom: 10px;">The Customer authorizes Asbury Outdoor Services to charge the payment method provided for amounts properly due under this Agreement, including excess weight, approved extensions, damage, prohibited-material charges, and other applicable fees.</li>
</ul>

<h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">4. Prohibited &amp; Restricted Materials</h2>
<ul style="margin: 0; padding-left: 20px;">
  <li style="margin-bottom: 10px;">Do <strong>not</strong> load hazardous chemicals or hazardous waste, paint, oils, solvents, batteries, illegal substances, or any material prohibited by the disposal facility or applicable law.</li>
  <li style="margin-bottom: 10px;">Concrete, large logs/stumps, large appliances, and other unusually heavy or special-disposal items may not be loaded unless Asbury Outdoor Services gives prior written approval.</li>
  <li style="margin-bottom: 10px;">Do not load material above the top rails or in a way that prevents safe operation of the tailgate or dump bed.</li>
  <li style="margin-bottom: 10px;">If you are unsure whether an item is accepted, contact Asbury Outdoor Services before loading it.</li>
</ul>

<h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">5. Damage, Loss &amp; Property</h2>
<ul style="margin: 0; padding-left: 20px;">
  <li style="margin-bottom: 10px;">The Customer is responsible for damage to or loss/theft of the trailer occurring while it is in the Customer's possession, except to the extent prohibited by applicable law.</li>
  <li style="margin-bottom: 10px;">Any damage, theft, accident, or incident involving the trailer must be reported to Asbury Outdoor Services <strong>within 12 hours</strong> of discovery.</li>
  <li style="margin-bottom: 10px;">The Customer may be responsible for reasonable repair or replacement costs, missing equipment, loss of use, and reasonable claim-related administrative expenses when caused by the Customer, persons under the Customer's control, or prohibited/misused materials.</li>
  <li style="margin-bottom: 10px;">Asbury Outdoor Services is not responsible for ordinary surface marks or damage to lawns, driveways, pavement, or other property caused by normal placement or removal of the trailer, except to the extent caused by our negligence or otherwise required by law.</li>
</ul>

<h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">6. Cancellation &amp; Rescheduling</h2>
<ul style="margin: 0; padding-left: 20px;">
  <li style="margin-bottom: 10px;"><strong>More than 48 hours</strong> before the scheduled delivery: full refund of amounts paid for the rental, less any non-refundable third-party processing fees if applicable.</li>
  <li style="margin-bottom: 10px;"><strong>24&ndash;48 hours</strong> before scheduled delivery: 50% refund of the rental charge.</li>
  <li style="margin-bottom: 10px;"><strong>Less than 24 hours</strong> before scheduled delivery or no-show/inability to accept delivery: no refund.</li>
  <li style="margin-bottom: 10px;">Early pickup or unused rental time does not result in a refund or credit.</li>
  <li style="margin-bottom: 10px;">Weather, access, disposal-facility closures, or other circumstances may require reasonable rescheduling. Any agreed rescheduling will be documented in writing or electronically.</li>
</ul>

<h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">7. Liability &amp; Indemnification</h2>
<ul style="margin: 0; padding-left: 20px;">
  <li style="margin-bottom: 10px;">The Customer assumes responsibility for the Customer's loading activities and for the acts of persons the Customer allows to access or load the trailer.</li>
  <li style="margin-bottom: 10px;">To the extent permitted by West Virginia law, the Customer agrees to indemnify and hold Asbury Outdoor Services harmless from third-party claims arising from the Customer's loading, prohibited materials, misuse, or violation of this Agreement.</li>
  <li style="margin-bottom: 10px;">Nothing in this Agreement is intended to waive liability that cannot legally be waived or limit rights that cannot legally be limited under applicable law.</li>
</ul>

<h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">8. Governing Law &amp; Entire Agreement</h2>
<ul style="margin: 0; padding-left: 20px;">
  <li style="margin-bottom: 10px;">This Agreement is governed by the laws of the State of West Virginia.</li>
  <li style="margin-bottom: 10px;">Any legal dispute concerning this Agreement will be handled in a court of competent jurisdiction in West Virginia, subject to applicable venue and jurisdiction rules.</li>
  <li style="margin-bottom: 10px;">If any provision is found unenforceable, the remaining provisions remain in effect.</li>
  <li style="margin-bottom: 10px;">Changes to this Agreement must be agreed to in writing or electronically by Asbury Outdoor Services and the Customer.</li>
</ul>

<h2 style="font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 28px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">9. Electronic Acceptance</h2>
<p style="margin: 0 0 16px;">By checking the agreement box and/or electronically signing during booking, the Customer confirms that they had an opportunity to review this Agreement before completing the reservation and agrees to be bound by its terms. A copy of the completed Agreement should be retained with the booking record.</p>

<div style="background: #f0f7f2; border: 1px solid #c3e6cb; border-radius: 6px; padding: 16px 20px; margin-top: 24px;">
  <p style="margin: 0; font-size: 13px; color: #1a5632;"><strong>Acknowledgment:</strong> By signing below, you confirm that you have read, understood, and agree to all terms and conditions outlined in this Agreement.</p>
</div>

</div>`;
}

// Get current agreement â€” fetches live pricing from DB
agreements.get('/', async (c) => {
  const pricing = await fetchPricing(c);
  return c.json({
    success: true,
    data: {
      version: '1.0',
      title: 'Dump Trailer Service Agreement & Terms of Use',
      content: buildAgreementContent(pricing),
    },
  });
});

// Get specific agreement version
agreements.get('/versions/:version', async (c) => {
  const version = c.req.param('version');
  const pricing = await fetchPricing(c);
  return c.json({
    success: true,
    data: {
      version,
      title: 'Dump Trailer Service Agreement & Terms of Use',
      content: buildAgreementContent(pricing),
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
