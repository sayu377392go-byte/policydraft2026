/** 見出し(##)・箇条書き(-)・段落だけを扱う軽量レンダラー。HTML は解釈しない */
export function SimpleMarkdown({ source }: { source: string }) {
  const blocks = source.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[15px] leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{l.slice(2)}</li>
              ))}
            </ul>
          );
        }
        if (lines[0].startsWith("## ")) {
          return (
            <div key={i} className="space-y-2">
              <h2 className="mt-4 border-l-4 border-teal-400 pl-3 text-lg font-bold">{lines[0].slice(3)}</h2>
              {lines.length > 1 && <SimpleMarkdown source={lines.slice(1).join("\n")} />}
            </div>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {block}
          </p>
        );
      })}
    </div>
  );
}
