import type { GetServerSideProps } from "next";

interface Props {
  status: "ok" | "denied" | "error";
  team?: string;
  reason?: string;
  open?: string;
}

export default function InstalledPage({ status, team, reason, open }: Props) {
  const ok = status === "ok";
  const title = ok ? "Council installed to your workspace" : "Council install did not complete";
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0A0A0A",
        color: "#F5F5F5",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "2rem",
      }}
    >
      <div style={{ maxWidth: 560, textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          {ok ? "✅" : "⚠️"} {title}
        </h1>
        {ok && (
          <>
            <p style={{ fontSize: "1.125rem", color: "#A0A0A0", marginBottom: "1.5rem" }}>
              Council is now installed to <strong style={{ color: "#F5F5F5" }}>{team}</strong>.
            </p>
            <p style={{ marginBottom: "1.5rem" }}>
              Try it now in any channel:
              <br />
              <code style={{ background: "#1A1A1A", padding: "0.5rem 0.75rem", borderRadius: 6, display: "inline-block", marginTop: "0.5rem" }}>
                /council should we ship the calibration meta-metric demo this week?
              </code>
            </p>
            {open && (
              <a
                href={open}
                style={{
                  display: "inline-block",
                  background: "#4A154B",
                  color: "white",
                  padding: "0.75rem 1.5rem",
                  borderRadius: 6,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Open Slack →
              </a>
            )}
          </>
        )}
        {!ok && (
          <>
            <p style={{ fontSize: "1.125rem", color: "#A0A0A0", marginBottom: "1.5rem" }}>
              {reason ? `Slack returned: ${reason}` : "Something went wrong during install."}
            </p>
            <p style={{ marginBottom: "1.5rem", color: "#888" }}>
              You can retry the install from{" "}
              <a href="https://github.com/alex-jb/council-for-slack-2026" style={{ color: "#7C3AED" }}>
                the README install button
              </a>
              , or open an issue if it persists.
            </p>
          </>
        )}
        <div style={{ marginTop: "3rem", fontSize: "0.875rem", color: "#666" }}>
          <a href="https://github.com/alex-jb/council-for-slack-2026" style={{ color: "#7C3AED" }}>
            github.com/alex-jb/council-for-slack-2026
          </a>
        </div>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const status = (query.status as string) === "ok" ? "ok" : (query.status as string) === "denied" ? "denied" : "error";
  return {
    props: {
      status: status as Props["status"],
      team: (query.team as string) || null,
      reason: (query.reason as string) || null,
      open: (query.open as string) || null,
    } as unknown as Props,
  };
};
