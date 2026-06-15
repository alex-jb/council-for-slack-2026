import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Council — Slack-native LLM Council for high-stakes decisions</title>
        <meta
          name="description"
          content="5 personas debate. 1 Oracle adjudicates. Brier audits every voice. The production layer Karpathy's LLM Council was always missing."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main
        style={{
          minHeight: "100vh",
          background: "#0A0A0A",
          color: "#F0F0F0",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
          padding: "80px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ color: "#FFA500", fontSize: 72, margin: 0, letterSpacing: -2 }}>
          Council
        </h1>
        <p
          style={{
            fontSize: 22,
            maxWidth: 680,
            textAlign: "center",
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          The production layer Karpathy&apos;s LLM Council was always missing.
          <br />
          5 personas debate. Oracle adjudicates. Brier audits every voice.
        </p>
        <p style={{ color: "#888", marginTop: 48, fontSize: 14 }}>
          Built on{" "}
          <a
            href="https://github.com/alex-jb/council-diff"
            style={{ color: "#FFA500" }}
          >
            council-diff
          </a>{" "}
          v0.4.0. MIT.{" "}
          <a href="/api/health" style={{ color: "#666" }}>
            health
          </a>
        </p>
      </main>
    </>
  );
}
