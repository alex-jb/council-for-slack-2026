import Link from "next/link";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginTop: "2rem" }}>
    <h2 style={{ fontSize: "1.25rem", color: "#F5F5F5", marginBottom: "0.75rem" }}>{title}</h2>
    <div style={{ color: "#B8BCC4", lineHeight: 1.6 }}>{children}</div>
  </section>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <code
    style={{
      background: "#1A1A1A",
      padding: "0.125rem 0.5rem",
      borderRadius: 4,
      fontSize: "0.9em",
      color: "#E5E7EB",
    }}
  >
    {children}
  </code>
);

export default function SupportPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#F5F5F5",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "3rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#7C3AED", textDecoration: "none", fontSize: "0.875rem" }}>
          ← council-for-slack
        </Link>
        <h1 style={{ fontSize: "2rem", marginTop: "1.5rem", marginBottom: "0.5rem" }}>Support</h1>
        <p style={{ color: "#888", fontSize: "0.875rem" }}>
          One-line: file a GitHub issue and Alex (the solo author) will get back within 24h ET hours.
        </p>

        <Section title="Quick reference">
          <p>Three commands cover everything Council does.</p>
          <ul>
            <li>
              <Code>/council [decision] | [optional context]</Code> — runs a 5-voice deliberation.
              The pipe character separates the question from the ground truth you want the council to
              consider. Example:{" "}
              <Code>/council ship the discount on the enterprise deal? | $400K ACV, 9-month sales cycle</Code>
            </li>
            <li>
              <Code>/council :engineer [decision]</Code> — switches the persona roster. Domains:
              {" "}<Code>founder</Code> (default), <Code>engineer</Code>, <Code>investor</Code>,
              {" "}<Code>career</Code>, <Code>product</Code>, <Code>quant</Code>.
            </li>
            <li>
              <Code>/council-audit</Code> — opens your workspace's calibration history with a
              meta-metric at the top (<Code>excellent</Code> &lt; 0.10, <Code>good</Code>,
              {" "}<Code>fair</Code>, <Code>needs-work</Code>). Click ✅ Happened / ❌ Did not happen
              on any verdict to lock in the Brier score.
            </li>
          </ul>
        </Section>

        <Section title="How to file an issue">
          The fastest path is{" "}
          <a
            href="https://github.com/alex-jb/council-for-slack-2026/issues/new"
            style={{ color: "#7C3AED" }}
          >
            github.com/alex-jb/council-for-slack-2026/issues/new
          </a>
          . Include:
          <ul>
            <li>Your Slack workspace name (not user ID) for cross-reference</li>
            <li>The slash command you typed (redact sensitive context if needed)</li>
            <li>What you expected vs what happened</li>
            <li>Screenshot if there was a UI error</li>
          </ul>
          For sensitive or security-related reports, email{" "}
          <a href="mailto:xji1@mail.yu.edu" style={{ color: "#7C3AED" }}>xji1@mail.yu.edu</a>{" "}
          directly. Do not file a public issue for security disclosures.
        </Section>

        <Section title="Common questions">
          <p style={{ marginBottom: "0.75rem" }}>
            <strong style={{ color: "#F5F5F5" }}>The 5 voices all agreed. Did I just get one model
            five times?</strong>
            <br />
            No — each voice is a separately-conditioned Sonnet 4.6 call with a domain-tuned system
            prompt and persona quote bank. Convergence (agreement_score &gt; 0.85) means the
            question is structurally low-ambiguity, which is itself the signal you want.
          </p>
          <p style={{ marginBottom: "0.75rem" }}>
            <strong style={{ color: "#F5F5F5" }}>What's a Brier score?</strong>
            <br />
            <Code>BS = (forecast − outcome)²</Code>. Lower is better. 0 is perfect, 0.25 is chance.
            A go verdict represents 0.80 probability of "happened", so if it didn't happen, the
            Brier is <Code>(0.80 − 0)² = 0.64</Code>. Track this over time and your judgment
            calibrates.
          </p>
          <p style={{ marginBottom: "0.75rem" }}>
            <strong style={{ color: "#F5F5F5" }}>I want a custom persona roster.</strong>
            <br />
            That's already in the underlying engine (<Code>council-diff</Code> has a{" "}
            <Code>custom</Code> domain). The Slack surface doesn't expose it yet — file an issue
            with the use case and it'll likely ship within a week.
          </p>
          <p style={{ marginBottom: "0.75rem" }}>
            <strong style={{ color: "#F5F5F5" }}>Can I export my decision history?</strong>
            <br />
            Not yet via UI, but a CSV export endpoint is on the roadmap. In the meantime, email{" "}
            <a href="mailto:xji1@mail.yu.edu" style={{ color: "#7C3AED" }}>xji1@mail.yu.edu</a> and
            we'll generate one.
          </p>
        </Section>

        <Section title="Response time">
          Alex (the solo author) is on Eastern Time and responds to issues within 24h on weekdays,
          48h on weekends. Security reports get an acknowledgement within 6h. There is no on-call
          rotation — this is a hackathon entry, but production-grade and actively used by the
          author's own workspace daily.
        </Section>

        <Section title="Uninstall">
          Slack: <strong>Settings → Manage apps → Council → Remove app from workspace.</strong>
          <br />
          The OAuth row is auto-marked uninstalled and the bot token is invalidated immediately.
          See{" "}
          <Link href="/privacy" style={{ color: "#7C3AED" }}>
            Privacy
          </Link>{" "}
          for what happens to your historical decisions.
        </Section>

        <Section title="Source">
          Everything Council does is open source under MIT at{" "}
          <a
            href="https://github.com/alex-jb/council-for-slack-2026"
            style={{ color: "#7C3AED" }}
          >
            github.com/alex-jb/council-for-slack-2026
          </a>
          . You can audit the exact code that handles your decisions, or fork it and run your own
          copy.
        </Section>
      </div>
    </main>
  );
}
