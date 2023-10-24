import { Action, ActionPanel, LaunchProps, List, popToRoot, showHUD, AI } from "@raycast/api";
import { useEffect, useState } from "react";

import { downloadLatex, getDisplayLatex } from "./api";
import { DEFAULT_ICON, ExportType, QuickLatexArguments, makeDonwloadDir, toClipboard } from "./utils";

function latexPrompt(userInput: string) {
  const PROMPT = `
Give the LaTeX syntax for a user input. Make sure that your answer is only the LaTeX syntax and no other explaining text or symbols.

For example:
User Input: "truth symbol logic"
Your Answer: \\top

User Input: "logical and"
Your Answer: \\land

User Input: "${userInput}"
Your Answer:
`;

  return AI.ask(PROMPT);
}

export default function CommandWithCustoEmptyView(props: LaunchProps<{ arguments: QuickLatexArguments }>) {
  const [searchText, setSearchText] = useState(props.arguments.latex ?? "");

  useEffect(() => {
    makeDonwloadDir();

    async function setAI() {
      if (props.arguments.ai) {
        setSearchText("Wait for AI...")
        const answer = await latexPrompt(props.arguments.ai);
        setSearchText(answer);
      }
    }

    setAI();
  }, []);

  const icon = searchText == "" ? DEFAULT_ICON : getDisplayLatex(searchText);

  return (
    <List onSearchTextChange={setSearchText} searchText={searchText}>
      <List.EmptyView
        icon={icon}
        actions={
          <ActionPanel>
            {Object.values(ExportType).map((exportType) => (
              <Action
                key={exportType}
                title={"Copy as " + exportType.toUpperCase()}
                onAction={() => {
                  downloadLatex(exportType, searchText)
                    .then((path: string) => {
                      toClipboard(path);
                      popToRoot();
                      showHUD("Copied to clipboard.");
                    })
                    .catch(() => {
                      showHUD("No internet connection. Or something else.");
                    });
                }}
              />
            ))}
          </ActionPanel>
        }
      />
    </List>
  );
}
