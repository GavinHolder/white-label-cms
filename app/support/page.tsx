import Image from "next/image";

export default function SupportPage() {
  return (
    <main className="w-full bg-white py-20">
      <div className="mx-auto max-w-5xl px-4">
        {/* Page Title */}
        {/* Image Header */}
        <div className="flex justify-center">
          <Image
            src="/images/sonicsupport2.jpg"
            alt="Sonic Support"
            width={600}
            height={400}
            className="rounded-2xl shadow-lg"
            priority
          />
        </div>
        <p className="mt-4 text-lg text-gray-600">
          Need help with your SONIC connection? We’ve got your back —
          minus the hold music and "the ice-cream machine is broken” attitude.
        </p>

        {/* Contact Options */}
        <section className="mt-12 justify-items-center">
          <h2 className="text-2xl font-semibold text-gray-900">Contact Us</h2>

          <div className="mt-6 space-y-4 text-gray-700">
            <p>
              <strong>Phone:</strong> 028 271 5494
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:support@sonic.co.za"
                className="text-red-600 hover:underline"
              >
                support@sonic.co.za
              </a>
            </p>
            <p>
              <strong>Office Hours:</strong> Monday–Friday, 08:00–17:00
            </p>
          </div>
        </section>

        {/* Troubleshooting Checklist */}
        <section className="mt-16 justify-items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Quick Troubleshooting
          </h2>
          <p className="mt-2 text-gray-600">
            Before contacting support, try these quick checks — they solve 80%
            of issues without waiting for a callback.
          </p>

          <ul className="mt-6 list-disc space-y-3 pl-6 text-gray-700">
            <li>
              Check if your router is powered on and all cables are firmly
              connected.
            </li>
            <li>
              Restart your router (turn it off for 30 seconds, then back on).
            </li>
            <li>
              Ensure your account is active and not suspended for billing.
            </li>
            <li>Check if only one device is affected or your whole network.</li>
            <li>
              Verify if there’s an outage in your area (call us if unsure).
            </li>
          </ul>
        </section>

        {/* When to Contact Support */}
        <section className="mt-16 justify-items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            When Should You Contact Us?
          </h2>

          <ul className="mt-6 list-disc space-y-3 pl-6 text-gray-700">
            <li>Your internet is down and rebooting didn’t help.</li>
            <li>You’re experiencing slow speeds or high latency.</li>
            <li>Your wireless link is unstable or dropping.</li>
            <li>You need help with fibre installation or upgrades.</li>
            <li>You want to change your package or update account details.</li>
          </ul>
        </section>

        {/* Final CTA */}
        <section className="mt-20 text-center">
          <a
            href="mailto:support@sonic.co.za"
            className="inline-block rounded bg-red-600 px-8 py-3 font-semibold text-white hover:bg-red-700"
          >
            Contact Support
          </a>
        </section>
      </div>
    </main>
  );
}
