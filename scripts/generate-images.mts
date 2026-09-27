/**
 * サイト掲載用の画像を OpenAI の画像生成 API で作成する。
 *
 *   OPENAI_API_KEY=sk-... npm run images:generate            # 未生成の画像だけ作る
 *   OPENAI_API_KEY=sk-... npm run images:generate -- --force  # すべて作り直す
 *   OPENAI_API_KEY=sk-... npm run images:generate -- hero     # 指定した画像だけ作る
 *
 * 画像は public/images/<name>.webp に保存し、src/lib/site-images.ts を更新する。
 * モデルは OPENAI_IMAGE_MODEL で変更できる(既定: gpt-image-2。使えない場合は gpt-image-1 で再試行)。
 */
import { existsSync, readdirSync, writeFileSync } from "node:fs";

type Spec = { name: string; size: "1536x1024" | "1024x1024" | "1024x1536"; prompt: string };

const STYLE =
  "Soft, airy, optimistic editorial style. Pale sky blue, white and mint-teal palette, gentle natural morning light, " +
  "slight haze, shallow depth of field. No text, no letters, no logos, no flags, no recognizable real people.";

const SPECS: Spec[] = [
  {
    name: "hero",
    size: "1536x1024",
    prompt:
      "Wide background photo for the hero section of a Japanese civic-tech website. A blurred, dreamy view of central Tokyo " +
      "with a stately white stone parliament-like building with a stepped central tower in the middle distance, " +
      "modern glass office buildings on both sides, green trees along a wide avenue in the foreground. " +
      "Strong bokeh blur so that text can be placed on top; bright center, calm composition. " + STYLE,
  },
  {
    name: "draft-youth-housing",
    size: "1536x1024",
    prompt: "Photo of a bright modern Japanese city skyline with apartment buildings at dusk, suggesting young people's housing. " + STYLE,
  },
  {
    name: "draft-local-transport",
    size: "1536x1024",
    prompt: "Photo of a small local train running through green rice fields in rural Japan, with mountains behind. " + STYLE,
  },
  {
    name: "draft-education-equality",
    size: "1536x1024",
    prompt: "Photo of diverse Japanese university students discussing around a table in a bright seminar room, faces not in sharp focus. " + STYLE,
  },
  {
    name: "draft-renewable-energy",
    size: "1536x1024",
    prompt: "Photo of wind turbines and solar panels on green hills under a clear blue sky in Japan. " + STYLE,
  },
  {
    name: "og",
    size: "1536x1024",
    prompt:
      "Abstract illustration of many soft translucent speech bubbles flowing toward a softly glowing government building, " +
      "symbolizing citizens' voices shaping policy. Minimal, clean, lots of empty space. " + STYLE,
  },
];

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("OPENAI_API_KEY を設定してください");
  process.exit(1);
}
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));
const outDir = new URL("../public/images/", import.meta.url);
const models = [...new Set([process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2", "gpt-image-1"])];

async function generate(spec: Spec): Promise<Buffer> {
  let lastError = "";
  for (const model of models) {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: spec.prompt, size: spec.size, quality: "high", output_format: "webp", n: 1 }),
    });
    const json = (await res.json()) as { data?: { b64_json?: string }[]; error?: { message: string; code?: string } };
    const b64 = json.data?.[0]?.b64_json;
    if (res.ok && b64) {
      console.log(`  model: ${model}`);
      return Buffer.from(b64, "base64");
    }
    lastError = `${res.status} ${json.error?.message ?? "unknown error"}`;
    // モデルが使えない場合だけ次のモデルで再試行する
    if (!/model/i.test(json.error?.message ?? "") && json.error?.code !== "model_not_found") break;
  }
  throw new Error(lastError);
}

let failed = 0;
for (const spec of SPECS) {
  if (only.length && !only.includes(spec.name)) continue;
  const file = new URL(`${spec.name}.webp`, outDir);
  if (existsSync(file) && !force) {
    console.log(`skip ${spec.name}(生成済み)`);
    continue;
  }
  console.log(`generate ${spec.name} ...`);
  try {
    writeFileSync(file, await generate(spec));
  } catch (e) {
    failed++;
    console.error(`  失敗: ${(e as Error).message}`);
  }
}

// site-images.ts を実在するファイルから作り直す
const names = readdirSync(outDir)
  .filter((f) => f.endsWith(".webp"))
  .map((f) => f.replace(/\.webp$/, ""))
  .sort();
writeFileSync(
  new URL("../src/lib/site-images.ts", import.meta.url),
  `// 自動生成: npm run images:generate(直接編集しない)
// OpenAI の画像生成 API で作成した画像のパス。未生成のものは含まれない。
export const SITE_IMAGES: Record<string, string> = {
${names.map((n) => `  ${JSON.stringify(n)}: "/images/${n}.webp",`).join("\n")}
};
`,
);
console.log(`src/lib/site-images.ts を更新しました(${names.length}件)`);
if (failed) process.exit(1);
