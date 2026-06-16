import Link from "next/link";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginTop: "2rem" }}>
    <h2 style={{ fontSize: "1.25rem", color: "#F5F5F5", marginBottom: "0.75rem" }}>{title}</h2>
    <div style={{ color: "#B8BCC4", lineHeight: 1.6 }}>{children}</div>
  </section>
);

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: "2rem", marginTop: "1.5rem", marginBottom: "0.5rem" }}>Privacy Policy</h1>
        <p style={{ color: "#888", fontSize: "0.875rem" }}>Last updated 2026-06-16</p>

        <Section title="What Council is">
          Council is a Slack app that runs a 5-voice AI deliberation on decisions you type in a channel,
          then keeps a Brier-scored calibration log of your judgment over time. It is open source
          (MIT, <a href="https://github.com/alex-jb/council-for-slack-2026" style={{ color: "#7C3AED" }}>repo</a>)
          and built by one solo founder (Alex Ji).
        </Section>

        <Section title="What Council stores">
          When you install Council, we store:
          <ul>
            <li><code>workspace_id</code> + <code>workspace_name</code> (from Slack OAuth)</li>
            <li><code>bot_token</code> (so Council can post in your channel)</li>
            <li><code>installed_by_user_id</code> (the Slack user who clicked Install)</li>
            <li>The scopes you granted (e.g. <code>commands</code>, <code>chat:write</code>)</li>
          </ul>
          When you use <code>/council</code>, we additionally store:
          <ul>
            <li>The decision question and optional context you typed</li>
            <li>The 5-voice deliberation result (verdict, agreement score, per-voice quotes)</li>
            <li>Your resolution (Happened / Did not happen) when you click those buttons</li>
            <li>The computed Brier score</li>
          </ul>
        </Section>

        <Section title="Where it's stored">
          All data lives in a single Supabase Postgres project (us-east region).
          Row-level security on the <code>council.installations</code> and <code>council.decisions</code> tables
          is set to <code>deny-all</code> — every read and write goes through 7 SECURITY DEFINER RPCs
          that explicitly scope to your workspace. The application never holds a service-role key.
        </Section>

        <Section title="Who can see your decisions">
          Only members of your Slack workspace can see decisions logged from that workspace.
          The <code>/council-audit</code> command is gated to the same workspace.
          There is no global "all decisions" view, nor a server-side aggregation that crosses workspaces.
          The author (Alex Ji) has database admin access for debugging only and does not read
          decision content unless you explicitly request support.
        </Section>

        <Section title="What we send to Anthropic">
          Each <code>/council</code> fire sends your decision + context to Anthropic's Claude API
          (Sonnet 4.6 by default; Mythos Fable-5 as opt-in Oracle for split councils).
          Anthropic's standard retention applies. If you set <code>safeMode: true</code> in
          council-diff (the underlying engine), all Mythos calls downgrade to Sonnet 4.6
          (zero data retention). See
          {" "}<a href="https://www.anthropic.com/legal/privacy" style={{ color: "#7C3AED" }}>Anthropic's privacy policy</a>.
        </Section>

        <Section title="What we don't do">
          <ul>
            <li>No sale of data to any third party</li>
            <li>No advertising network integrations</li>
            <li>No cross-workspace analytics (workspace stats are scoped per workspace)</li>
            <li>No DM scanning — Council only reads channels you explicitly post in</li>
            <li>No retention beyond what's needed for the <code>/council-audit</code> history</li>
          </ul>
        </Section>

        <Section title="How to delete your data">
          Uninstall the app from Slack (Settings → Manage apps → Council → Remove).
          The OAuth row is marked <code>uninstalled_at = now()</code> and the bot_token is invalidated.
          To purge your decision history entirely, email{" "}
          <a href="mailto:xji1@mail.yu.edu" style={{ color: "#7C3AED" }}>xji1@mail.yu.edu</a> with
          your workspace_id and we will hard-delete rows within 7 days.
        </Section>

        <Section title="Changes to this policy">
          We will revise this page if storage practices change. The "Last updated" date at the top
          reflects the most recent change. Material changes will also be announced in the GitHub
          README CHANGELOG.
        </Section>

        <Section title="Contact">
          Author: Alex Ji (<a href="mailto:xji1@mail.yu.edu" style={{ color: "#7C3AED" }}>xji1@mail.yu.edu</a>)
          <br />
          Issues: <a href="https://github.com/alex-jb/council-for-slack-2026/issues" style={{ color: "#7C3AED" }}>github.com/alex-jb/council-for-slack-2026/issues</a>
        </Section>
      </div>
    </main>
  );
}
