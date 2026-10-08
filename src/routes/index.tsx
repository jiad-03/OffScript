import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFrame } from "@/components/SiteFrame";
import { IdentityCard } from "@/components/IdentityCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OffScript — One real personality, many online identities" },
      { name: "description", content: "Craft authentic social bios, usernames and a LinkedIn-ready professional profile from your real interests and strengths." },
      { property: "og:title", content: "OffScript — The Internet Identity Toolkit" },
      { property: "og:description", content: "One real personality. Multiple online identities. Bios, headlines and an identity card in minutes." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <SiteFrame>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pt-12 md:grid-cols-12 md:px-10 md:pt-20">
        <div className="md:col-span-7">
          <p className="kicker text-wine">Issue 01 — For your twenties</p>
          <h1 className="mt-6 text-6xl leading-[0.92] sm:text-7xl lg:text-8xl">
            One real you.<br /><span className="italic text-wine">Many rooms</span> online.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
            Answer a few honest questions. Get bios for your socials, a headline for LinkedIn and an identity card — all written from what you actually told us. Nothing invented.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link to="/create" className="btn btn-primary">Create my identity →</Link>
            <Link to="/results" search={{ sample: true }} className="btn btn-outline">See a sample</Link>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">About 3 minutes · No sign-up · Nothing stored</p>
        </div>
        <div className="md:col-span-5">
          <div className="mx-auto max-w-sm rotate-[1.5deg]">
            <IdentityCard name="Maya Ren" tagline="Curious by nature, film photography by choice." tags={["film photography", "typography", "curious"]} motif="circle" handle="@maya.film" />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5 md:px-10">
        <div className="flex items-baseline justify-between border-b border-foreground pb-3">
          <h2 className="text-3xl sm:text-4xl">Same person, two registers</h2>
          <span className="kicker text-muted-foreground">Example</span>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-2">
          <article className="bg-background py-8 md:pr-10">
            <p className="kicker text-wine">Social</p>
            <p className="mt-4 font-display text-3xl leading-snug">"Quietly curious about film photography and typography. Calm, a little playful. Learning in public."</p>
            <p className="mt-4 text-sm text-muted-foreground">@maya.film · @typebymaya</p>
          </article>
          <article className="bg-background py-8 md:pl-10">
            <p className="kicker text-wine">Professional</p>
            <p className="mt-4 font-display text-3xl leading-snug">UX design | Visual storytelling & listening | Interested in typography</p>
            <p className="mt-4 text-sm text-muted-foreground">LinkedIn headline · About section · Portfolio intro</p>
          </article>
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-10 px-5 md:grid-cols-3 md:px-10">
        {[
          ["01", "Tell it straight", "Interests, strengths, personality, tone, goals. Skip what you don't want to share."],
          ["02", "Read it back", "Three bios, usernames, a tagline, a headline and an About — based only on your answers."],
          ["03", "Take it with you", "Copy any line, regenerate variations, or save your identity card as an image."],
        ].map(([n, t, d]) => (
          <div key={n} className="border-t border-foreground pt-5">
            <span className="font-display text-5xl italic text-wine">{n}</span>
            <h3 className="mt-3 text-2xl">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
    </SiteFrame>
  );
}
