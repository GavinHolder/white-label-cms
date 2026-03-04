import Image from "next/image";

export default function CoveragePage() {
  return (
    <main className="w-full bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header Image */}
        <div className="flex justify-center">
          <Image
            src="/images/soniccoverage.jpg"
            alt="Sonic Coverage Map"
            width={800}
            height={300}
            className="h-auto w-full max-w-2xl rounded-lg"
            priority
          />
        </div>

        {/* Intro */}
        <p className="mt-8 text-lg text-gray-700">
          Sonic provides high‑speed Wireless and Fibre Internet across the
          Overberg region. Our network covers coastal towns, rural areas, farms,
          and growing communities — delivering fast, reliable connectivity where
          it matters most.
        </p>

        {/* Coverage Areas */}
        <section className="mt-16 w-full">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Areas We Cover
          </h2>

          <p className="mt-4 text-center text-gray-600">
            Coverage includes (but is not limited to) the following areas:
          </p>

          <div className="mt-10 grid gap-6 text-center md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-sky-600">Coastal</h3>
              <ul className="mt-3 space-y-1 text-gray-700">
                <li>Rooi Els</li>
                <li>Pringle Bay</li>
                <li>Betty’s Bay</li>
                <li>Kleinmond</li>
                <li>Fisherhaven</li>
                <li>Hawston</li>
                <li>Sandbaai</li>
                <li>Hermanus</li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-green-700">Inland</h3>
              <ul className="mt-3 space-y-1 text-gray-700">
                <li>Grabouw</li>
                <li>Botivier</li>
                <li>Napier</li>
                <li>Bredasdorp</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Map Embed */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Coverage Map
          </h2>

          <p className="mt-4 text-center text-gray-600">
            Use the map below to check if your area is covered.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d331651.7700042398!2d19.0000!3d-34.3500!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1dd1f0b0c0c0c0c0%3A0x0000000000000000!2sOverberg!5e0!3m2!1sen!2sza!4v0000000000000"
                width="100%"
                height="100%"
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 text-center">
          <a
            href="/support"
            className="inline-block rounded bg-red-600 px-8 py-3 font-semibold text-white hover:bg-red-700"
          >
            Not sure if you're covered?
          </a>
        </section>
      </div>
    </main>
  );
}
