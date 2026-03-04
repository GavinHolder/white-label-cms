import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed with styled Bootstrap content...');

  // Create admin user
  console.log('Creating admin user...');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@sonicinternet.co.za',
      passwordHash: await hashPassword('sonic2026'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ Admin: ${admin.username}`);

  // Create landing page
  const landingPage = await prisma.page.upsert({
    where: { slug: '/' },
    update: {},
    create: {
      slug: '/',
      title: 'SONIC - Home',
      type: 'LANDING',
      status: 'PUBLISHED',
      createdBy: admin.id,
      publishedAt: new Date(),
    },
  });
  console.log(`✅ Page: ${landingPage.title}`);

  // Delete existing sections
  await prisma.section.deleteMany({ where: { pageId: landingPage.id } });

  let order = 0;

  // ============================================
  // HERO SECTION - Full-screen carousel
  // ============================================
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'HERO',
      enabled: true,
      order: order++,
      displayName: 'Hero Carousel',
      paddingTop: 0,
      paddingBottom: 0,
      background: 'transparent',
      content: {
        slides: [
          {
            id: 'slide-1',
            type: 'image',
            src: '/images/sonic-dc.jpeg',
            gradient: {
              enabled: true,
              type: 'preset',
              preset: { direction: 'bottom', startOpacity: 80, endOpacity: 20, color: '#1e3a8a' }
            },
            overlay: {
              heading: {
                text: 'Lightning-Fast Fiber Internet',
                fontSize: 64,
                fontWeight: 800,
                color: '#ffffff',
                animation: 'slideUp',
                animationDuration: 800,
                animationDelay: 200
              },
              subheading: {
                text: 'Up to 1Gbps speeds • No contracts • Local support',
                fontSize: 28,
                fontWeight: 400,
                color: '#ffffff',
                animation: 'slideUp',
                animationDuration: 800,
                animationDelay: 400
              },
              buttons: [
                {
                  text: 'Check Coverage',
                  href: '#coverage',
                  backgroundColor: '#2563eb',
                  textColor: '#ffffff',
                  variant: 'filled',
                  animation: 'slideUp',
                  animationDelay: 600
                },
                {
                  text: 'View Plans',
                  href: '#plans',
                  backgroundColor: 'transparent',
                  textColor: '#ffffff',
                  variant: 'outline',
                  animation: 'slideUp',
                  animationDelay: 700
                }
              ],
              position: 'center',
              spacing: { betweenHeadingSubheading: 20, betweenSubheadingButtons: 40, betweenButtons: 16 }
            }
          }
        ],
        autoPlay: true,
        autoPlayInterval: 6000,
        showDots: true,
        showArrows: true,
        transitionDuration: 800
      },
      createdBy: admin.id,
    },
  });

  // ============================================
  // TEXT-ONLY SECTIONS - Rich Typography
  // ============================================

  // 1. Centered Hero Text
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'NORMAL',
      enabled: true,
      order: order++,
      displayName: 'About Us - Centered',
      navLabel: 'About',
      paddingTop: 100,
      paddingBottom: 100,
      background: 'white',
      content: {
        heading: 'Connecting the Overberg Since 2010',
        subheading: 'South Africa\'s Most Trusted Regional ISP',
        body: `
          <div class="text-center">
            <p class="lead fs-3 fw-light text-muted mb-4">
              We believe fast, reliable internet is no longer a luxury—it's a necessity.
            </p>
            <p class="fs-5 mb-4">
              SONIC brings world-class fiber connectivity to homes and businesses across
              Hermanus, Gansbaai, Stanford, and the greater Overberg region. Our locally-based team
              provides 24/7 support, ensuring you're always connected when it matters most.
            </p>
            <p class="fs-5 text-primary fw-semibold">
              Join <strong>15,000+ satisfied customers</strong> enjoying lightning-fast speeds up to 1Gbps.
            </p>
          </div>
        `,
        layout: 'text-only',
        layoutPreset: 'centered'
      },
      createdBy: admin.id,
    },
  });

  // 2. Split Column Comparison
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'NORMAL',
      enabled: true,
      order: order++,
      displayName: 'Plans Overview - Split Column',
      navLabel: 'Plans',
      paddingTop: 80,
      paddingBottom: 80,
      background: 'lightblue',
      content: {
        heading: 'Choose Your Perfect Plan',
        subheading: 'Flexible options for homes and businesses',
        body: `
          <div class="row g-5">
            <div class="col-md-6">
              <div class="d-flex align-items-center mb-4">
                <div class="bg-primary text-white rounded-circle p-3 me-3" style="width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-house-fill fs-4"></i>
                </div>
                <h3 class="h4 fw-bold mb-0">Home Plans</h3>
              </div>
              <p class="lead mb-4">Perfect for streaming, gaming, and remote work.</p>
              <ul class="list-unstyled fs-5 mb-4">
                <li class="mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i> Unlimited data</li>
                <li class="mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i> Free router rental</li>
                <li class="mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i> 24/7 support</li>
                <li class="mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i> No contracts</li>
              </ul>
              <div class="badge bg-primary-subtle text-primary fs-6 px-3 py-2">
                From R399/month
              </div>
            </div>

            <div class="col-md-6">
              <div class="d-flex align-items-center mb-4">
                <div class="bg-success text-white rounded-circle p-3 me-3" style="width: 56px; height: 56px; display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-building fs-4"></i>
                </div>
                <h3 class="h4 fw-bold mb-0">Business Plans</h3>
              </div>
              <p class="lead mb-4">Enterprise-grade connectivity with SLA guarantees.</p>
              <ul class="list-unstyled fs-5 mb-4">
                <li class="mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i> Static IP included</li>
                <li class="mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i> Priority support</li>
                <li class="mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i> 99.9% uptime SLA</li>
                <li class="mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i> Dedicated account manager</li>
              </ul>
              <div class="badge bg-success-subtle text-success fs-6 px-3 py-2">
                From R999/month
              </div>
            </div>
          </div>
        `,
        layout: 'text-only',
        layoutPreset: 'split-column'
      },
      createdBy: admin.id,
    },
  });

  // ============================================
  // TEXT-IMAGE SECTIONS - Side-by-side layouts
  // ============================================

  // 3. Text Left, Image Right - Feature Showcase
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'NORMAL',
      enabled: true,
      order: order++,
      displayName: 'Why Choose Us - Text + Image',
      navLabel: 'Benefits',
      paddingTop: 100,
      paddingBottom: 100,
      background: 'white',
      content: {
        heading: 'Why 15,000+ Customers Trust Sonic',
        subheading: 'Experience the difference of true fiber speed',
        body: `
          <div class="mb-5">
            <div class="d-flex align-items-start mb-4">
              <div class="bg-primary bg-opacity-10 rounded p-3 me-3">
                <i class="bi bi-lightning-charge-fill text-primary fs-2"></i>
              </div>
              <div>
                <h4 class="fw-bold mb-2">Lightning-Fast Speeds</h4>
                <p class="text-muted mb-0">
                  Fiber speeds up to 1Gbps—stream 4K, game online, and video conference
                  simultaneously without buffering.
                </p>
              </div>
            </div>

            <div class="d-flex align-items-start mb-4">
              <div class="bg-success bg-opacity-10 rounded p-3 me-3">
                <i class="bi bi-shield-check-fill text-success fs-2"></i>
              </div>
              <div>
                <h4 class="fw-bold mb-2">99.9% Uptime Guarantee</h4>
                <p class="text-muted mb-0">
                  Redundant network infrastructure monitored 24/7. Issues resolved before
                  they affect you.
                </p>
              </div>
            </div>

            <div class="d-flex align-items-start mb-4">
              <div class="bg-info bg-opacity-10 rounded p-3 me-3">
                <i class="bi bi-people-fill text-info fs-2"></i>
              </div>
              <div>
                <h4 class="fw-bold mb-2">Local Support Team</h4>
                <p class="text-muted mb-0">
                  Real people based in the Overberg. Call anytime and speak to someone who
                  knows your area.
                </p>
              </div>
            </div>

            <div class="d-flex align-items-start">
              <div class="bg-warning bg-opacity-10 rounded p-3 me-3">
                <i class="bi bi-calendar-x-fill text-warning fs-2"></i>
              </div>
              <div>
                <h4 class="fw-bold mb-2">No Contracts Required</h4>
                <p class="text-muted mb-0">
                  Month-to-month flexibility. Stay because you love the service, not because
                  you're locked in.
                </p>
              </div>
            </div>
          </div>
        `,
        layout: 'text-image',
        layoutPreset: 'text-left-image-right',
        imageSrc: '/images/sonic-dc.jpeg',
        imageAlt: 'Fiber optic cables glowing with data'
      },
      createdBy: admin.id,
    },
  });

  // 4. Text Overlay Center - Hero style with image background
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'NORMAL',
      enabled: true,
      order: order++,
      displayName: 'Coverage Map - Text Overlay',
      navLabel: 'Coverage',
      paddingTop: 120,
      paddingBottom: 120,
      background: 'transparent',
      content: {
        heading: 'Expanding Across the Overberg',
        subheading: 'Check if fiber is available in your neighborhood',
        body: `
          <div class="text-center text-white">
            <p class="lead fs-3 mb-5">
              We're constantly expanding our fiber network to reach more communities.
            </p>

            <div class="row g-4 justify-content-center">
              <div class="col-md-4">
                <div class="bg-white bg-opacity-10 backdrop-blur rounded p-4">
                  <i class="bi bi-geo-alt-fill text-white fs-1 mb-3 d-block"></i>
                  <h5 class="fw-bold mb-2">Hermanus</h5>
                  <p class="mb-0 small">Full fiber coverage</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="bg-white bg-opacity-10 backdrop-blur rounded p-4">
                  <i class="bi bi-geo-alt-fill text-white fs-1 mb-3 d-block"></i>
                  <h5 class="fw-bold mb-2">Gansbaai</h5>
                  <p class="mb-0 small">60% coverage</p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="bg-white bg-opacity-10 backdrop-blur rounded p-4">
                  <i class="bi bi-geo-alt-fill text-white fs-1 mb-3 d-block"></i>
                  <h5 class="fw-bold mb-2">Stanford</h5>
                  <p class="mb-0 small">Full village coverage</p>
                </div>
              </div>
            </div>
          </div>
        `,
        layout: 'text-image',
        layoutPreset: 'text-overlay-center',
        imageSrc: '/images/sonic-dc.jpeg',
        imageAlt: 'Overberg region coverage map',
        gradient: {
          enabled: true,
          type: 'preset',
          preset: {
            direction: 'bottom',
            startOpacity: 85,
            endOpacity: 40,
            color: '#1e3a8a'
          }
        }
      },
      createdBy: admin.id,
    },
  });

  // ============================================
  // GRID SECTIONS - Card layouts
  // ============================================

  // 5. Standard Grid - Features
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'NORMAL',
      enabled: true,
      order: order++,
      displayName: 'Features Grid',
      navLabel: 'Features',
      paddingTop: 80,
      paddingBottom: 80,
      background: 'gray',
      content: {
        heading: 'Everything You Need, Nothing You Don\'t',
        subheading: 'All plans include these premium features at no extra cost',
        body: `
          <div class="row g-4">
            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i class="bi bi-infinity text-primary fs-2"></i>
                  </div>
                  <h5 class="card-title fw-bold">Unlimited Data</h5>
                  <p class="card-text text-muted">
                    No caps, no throttling, no fair usage policies. Stream and download as much as you want.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="bg-success bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i class="bi bi-router text-success fs-2"></i>
                  </div>
                  <h5 class="card-title fw-bold">Free Router</h5>
                  <p class="card-text text-muted">
                    High-performance WiFi 6 router included free with installation. No rental fees.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="bg-info bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i class="bi bi-clock-history text-info fs-2"></i>
                  </div>
                  <h5 class="card-title fw-bold">24/7 Support</h5>
                  <p class="card-text text-muted">
                    Local technicians available around the clock. Average response time under 2 hours.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="bg-warning bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i class="bi bi-speedometer2 text-warning fs-2"></i>
                  </div>
                  <h5 class="card-title fw-bold">Guaranteed Speeds</h5>
                  <p class="card-text text-muted">
                    Get the speeds you pay for, not "up to". We guarantee minimum performance.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="bg-danger bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i class="bi bi-shield-lock text-danger fs-2"></i>
                  </div>
                  <h5 class="card-title fw-bold">Secure Network</h5>
                  <p class="card-text text-muted">
                    Enterprise-grade security with automatic threat detection and DDoS protection.
                  </p>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <div class="card h-100 border-0 shadow-sm">
                <div class="card-body p-4">
                  <div class="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-flex mb-3">
                    <i class="bi bi-tools text-primary fs-2"></i>
                  </div>
                  <h5 class="card-title fw-bold">Free Installation</h5>
                  <p class="card-text text-muted">
                    Professional installation within 48 hours. No hidden setup fees or charges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        `,
        layout: 'grid',
        layoutPreset: 'standard-grid'
      },
      createdBy: admin.id,
    },
  });

  // ============================================
  // CTA SECTIONS - Call to action
  // ============================================

  // 6. CTA Banner Style
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'CTA',
      enabled: true,
      order: order++,
      displayName: 'CTA: Quick Action Banner',
      paddingTop: 60,
      paddingBottom: 60,
      background: 'blue',
      content: {
        heading: 'Ready to Experience True Fiber Speed?',
        subheading: 'Join 15,000+ happy customers in the Overberg',
        buttons: [
          { text: 'Check Coverage', href: '#coverage', variant: 'light' },
          { text: 'View Plans', href: '#plans', variant: 'outline-light' }
        ],
        style: 'banner'
      },
      createdBy: admin.id,
    },
  });

  // 7. CTA Card Style
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'CTA',
      enabled: true,
      order: order++,
      displayName: 'CTA: Elevated Card',
      paddingTop: 80,
      paddingBottom: 80,
      background: 'white',
      content: {
        heading: 'Special Offer: Free Installation',
        subheading: 'Sign up this month and save R999 on installation fees. Limited time offer.',
        buttons: [
          { text: 'Get Started', href: '#signup', variant: 'primary' },
          { text: 'Learn More', href: '#about', variant: 'outline-primary' }
        ],
        style: 'card'
      },
      createdBy: admin.id,
    },
  });

  // 8. CTA Full Width with Background
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'CTA',
      enabled: true,
      order: order++,
      displayName: 'CTA: Hero Style',
      paddingTop: 120,
      paddingBottom: 120,
      background: 'transparent',
      content: {
        heading: 'Your Business Deserves Better Internet',
        subheading: 'Enterprise fiber with dedicated support, static IP, and 99.9% uptime SLA. Installation in 48 hours.',
        buttons: [
          { text: 'Contact Sales', href: '#contact', variant: 'light' },
          { text: 'Download Brochure', href: '#brochure', variant: 'outline-light' }
        ],
        style: 'fullwidth',
        backgroundImage: '/images/sonic-dc.jpeg',
        gradient: {
          enabled: true,
          type: 'preset',
          preset: {
            direction: 'bottom',
            startOpacity: 80,
            endOpacity: 30,
            color: '#059669'
          }
        }
      },
      createdBy: admin.id,
    },
  });

  // ============================================
  // TALL SECTIONS - 3+ Viewport Heights (for inner scroll testing)
  // ============================================

  // 9. Extra Tall Section #1 - FAQ Accordion (4 viewport heights)
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'NORMAL',
      enabled: true,
      order: order++,
      displayName: 'Tall Section: FAQ (4vh)',
      navLabel: 'FAQ',
      paddingTop: 80,
      paddingBottom: 80,
      background: 'white',
      content: {
        heading: 'Frequently Asked Questions',
        subheading: 'Everything you need to know about SONIC',
        body: `
          <div>
            <div class="accordion" id="faqAccordion">
              ${Array.from({ length: 20 }, (_, i) => `
                <div class="accordion-item mb-3">
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq${i}">
                      <strong>Question ${i + 1}:</strong> What are the benefits of fiber internet?
                    </button>
                  </h2>
                  <div id="faq${i}" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body">
                      <p class="mb-3">
                        Fiber-optic internet offers significantly faster speeds than traditional copper-based connections.
                        You can download large files in seconds, stream 4K content on multiple devices simultaneously,
                        and enjoy lag-free gaming experiences.
                      </p>
                      <ul class="mb-0">
                        <li>Speeds up to 1Gbps (1000 Mbps)</li>
                        <li>More reliable connection with less downtime</li>
                        <li>Better upload speeds for video calls and cloud backups</li>
                        <li>Future-proof technology that can scale with your needs</li>
                      </ul>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="text-center mt-5 pt-5">
              <p class="lead">Still have questions?</p>
              <button class="btn btn-primary btn-lg">Contact Support</button>
            </div>
          </div>
        `,
        layout: 'text-only',
        layoutPreset: 'centered'
      },
      createdBy: admin.id,
    },
  });

  // 10. Extra Tall Section #2 - Pricing Comparison Table (3.5 viewport heights)
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'NORMAL',
      enabled: true,
      order: order++,
      displayName: 'Tall Section: Pricing Table (3.5vh)',
      navLabel: 'Pricing',
      paddingTop: 100,
      paddingBottom: 100,
      background: 'lightblue',
      content: {
        heading: 'Compare All Plans',
        subheading: 'Find the perfect plan for your needs and budget',
        body: `
          <div>
            <div class="table-responsive">
              <table class="table table-hover table-bordered align-middle">
                <thead class="table-primary">
                  <tr>
                    <th scope="col" class="fw-bold">Plan Name</th>
                    <th scope="col" class="text-center">Speed</th>
                    <th scope="col" class="text-center">Upload</th>
                    <th scope="col" class="text-center">Data Cap</th>
                    <th scope="col" class="text-center">Router</th>
                    <th scope="col" class="text-center">Support</th>
                    <th scope="col" class="text-center">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${Array.from({ length: 25 }, (_, i) => {
                    const speeds = [10, 20, 50, 100, 200, 500, 1000];
                    const speed = speeds[i % speeds.length];
                    const price = 299 + (i * 50);
                    return `
                      <tr>
                        <td><strong>Fiber ${speed}Mbps ${i > 12 ? 'Business' : 'Home'}</strong></td>
                        <td class="text-center"><span class="badge bg-primary">${speed} Mbps</span></td>
                        <td class="text-center"><span class="badge bg-success">${speed / 2} Mbps</span></td>
                        <td class="text-center"><i class="bi bi-infinity text-primary"></i> Unlimited</td>
                        <td class="text-center"><i class="bi bi-check-circle-fill text-success"></i> Free</td>
                        <td class="text-center">${i > 12 ? 'Priority 24/7' : 'Standard 24/7'}</td>
                        <td class="text-center fw-bold text-primary">R${price}/mo</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="row g-4 mt-5">
              <div class="col-md-4">
                <div class="card border-primary">
                  <div class="card-body text-center">
                    <i class="bi bi-shield-check fs-1 text-primary mb-3"></i>
                    <h5 class="card-title">99.9% Uptime SLA</h5>
                    <p class="card-text text-muted">All plans include our industry-leading uptime guarantee</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-success">
                  <div class="card-body text-center">
                    <i class="bi bi-calendar-x fs-1 text-success mb-3"></i>
                    <h5 class="card-title">No Contracts</h5>
                    <p class="card-text text-muted">Cancel anytime with 30 days notice, no penalties</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-info">
                  <div class="card-body text-center">
                    <i class="bi bi-tools fs-1 text-info mb-3"></i>
                    <h5 class="card-title">Free Installation</h5>
                    <p class="card-text text-muted">Professional setup within 48 hours at no extra cost</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
        layout: 'text-only',
        layoutPreset: 'centered'
      },
      createdBy: admin.id,
    },
  });

  // ============================================
  // FOOTER SECTION
  // ============================================
  await prisma.section.create({
    data: {
      pageId: landingPage.id,
      type: 'FOOTER',
      enabled: true,
      order: 999999,
      displayName: 'Footer Section',
      paddingTop: 60,
      paddingBottom: 40,
      background: 'gray',
      content: {
        logo: '/images/sonic-logo.png',
        tagline: 'Connecting the Overberg since 2010',
        companyInfo: {
          name: 'SONIC',
          address: '123 Main Road, Hermanus, 7200',
          phone: '+27 28 123 4567',
          email: 'info@sonicinternet.co.za',
          position: 'top-left'
        },
        columns: [
          {
            id: 'col-1',
            title: 'Company',
            links: [
              { text: 'About Us', href: '/about' },
              { text: 'Coverage Map', href: '/coverage' },
              { text: 'Contact', href: '/contact' },
              { text: 'Careers', href: '/careers' }
            ]
          },
          {
            id: 'col-2',
            title: 'Services',
            links: [
              { text: 'Home Fiber', href: '/services/home' },
              { text: 'Business Fiber', href: '/services/business' },
              { text: 'Support', href: '/support' },
              { text: 'Check Coverage', href: '/coverage' }
            ]
          },
          {
            id: 'col-3',
            title: 'Legal',
            links: [
              { text: 'Terms of Service', href: '/terms' },
              { text: 'Privacy Policy', href: '/privacy' },
              { text: 'Acceptable Use', href: '/aup' },
              { text: 'POPIA Compliance', href: '/popia' }
            ]
          }
        ],
        copyright: '© 2026 SONIC (Pty) Ltd. All rights reserved. Registration: 2010/123456/07',
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com/sonicinternet', icon: 'bi-facebook' },
          { platform: 'twitter', url: 'https://twitter.com/sonicinternet', icon: 'bi-twitter-x' },
          { platform: 'instagram', url: 'https://instagram.com/sonicinternet', icon: 'bi-instagram' },
          { platform: 'linkedin', url: 'https://linkedin.com/company/sonicinternet', icon: 'bi-linkedin' }
        ]
      },
      createdBy: admin.id,
    },
  });

  console.log(`✅ Created ${order + 1} richly-styled sections with Bootstrap formatting`);
  console.log('🎉 Comprehensive seed complete with production-ready content!');
  console.log('\n📊 Section Breakdown:');
  console.log('   - 1 Hero carousel with animated overlay');
  console.log('   - 2 Text-only sections (centered hero + split column plans)');
  console.log('   - 2 Text-image sections (feature list + overlay coverage map)');
  console.log('   - 1 Grid section (6 feature cards)');
  console.log('   - 3 CTA sections (banner, card, fullwidth styles)');
  console.log('   - 2 TALL sections (3-4 viewport heights for inner scroll testing)');
  console.log('   - 1 Footer section (4-column layout)');
  console.log('\n🔐 Login Credentials:');
  console.log('   Username: admin');
  console.log('   Password: sonic2026');
  console.log('   URL: http://localhost:3000/admin/login');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
