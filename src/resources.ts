/**
 * Resources Module - Provides access to FVWM3 configuration, documentation, and state
 */

import { readFile } from "fs/promises";
import { exec } from "child_process";
import { promisify } from "util";
import { homedir } from "os";
import path from "path";

const execAsync = promisify(exec);

/**
 * List of all available resources
 */
export async function getResources() {
  const home = homedir();

  return [
    // Configuration files
    {
      uri: "fvwm://config/main",
      name: "FVWM3 Main Configuration",
      description: "The complete FVWM3 configuration file (~/.fvwm/config)",
      mimeType: "text/plain",
    },
    {
      uri: "fvwm://config/repo",
      name: "FVWM3 Repository Configuration",
      description: "Version-controlled configuration from desktop-settings repo",
      mimeType: "text/plain",
    },

    // Documentation
    {
      uri: "fvwm://docs/claude",
      name: "CLAUDE.md Architecture Documentation",
      description: "Complete architecture documentation for FVWM3 setup",
      mimeType: "text/markdown",
    },
    {
      uri: "fvwm://docs/shortcuts",
      name: "Movement Shortcuts Documentation",
      description: "Spanish documentation of all movement shortcuts (ATAJOS-MOVIMIENTO.md)",
      mimeType: "text/markdown",
    },
    {
      uri: "fvwm://docs/smart-tiling",
      name: "Smart Tiling Technical Documentation",
      description: "Complete technical documentation of smart tiling system",
      mimeType: "text/markdown",
    },
    {
      uri: "fvwm://docs/readme",
      name: "FVWM3 Configuration README",
      description: "User-facing documentation and command reference",
      mimeType: "text/markdown",
    },

    // Scripts
    {
      uri: "fvwm://scripts/smart-tile",
      name: "Smart Tiling Script",
      description: "Main smart tiling implementation script",
      mimeType: "text/x-shellscript",
    },
    {
      uri: "fvwm://scripts/maximize-monitor",
      name: "Maximize Current Monitor Script",
      description: "Monitor-aware maximize script",
      mimeType: "text/x-shellscript",
    },
    {
      uri: "fvwm://scripts/monitor-setup",
      name: "Monitor Setup Script",
      description: "Multi-monitor configuration script",
      mimeType: "text/x-shellscript",
    },
    {
      uri: "fvwm://scripts/toggle-keyboard",
      name: "Keyboard Layout Toggle Script",
      description: "Toggle between US and LATAM keyboard layouts",
      mimeType: "text/x-shellscript",
    },

    // Runtime state
    {
      uri: "fvwm://state/monitors",
      name: "Current Monitor Layout",
      description: "Current monitor configuration from xrandr",
      mimeType: "text/plain",
    },
    {
      uri: "fvwm://state/windows",
      name: "Active Windows",
      description: "List of all active windows with geometry",
      mimeType: "application/json",
    },
    {
      uri: "fvwm://state/current-desktop",
      name: "Current Desktop State",
      description: "Current desktop and page information",
      mimeType: "application/json",
    },
    {
      uri: "fvwm://state/tile-states",
      name: "Tile State Files",
      description: "Current smart tiling state for all windows",
      mimeType: "application/json",
    },

    // Debug logs
    {
      uri: "fvwm://logs/smart-tile",
      name: "Smart Tiling Debug Log",
      description: "Debug log from smart tiling operations",
      mimeType: "text/plain",
    },
  ];
}

/**
 * Read a specific resource by URI
 */
export async function readResource(uri: string) {
  const home = homedir();

  try {
    let content: string;

    switch (uri) {
      // Configuration files
      case "fvwm://config/main":
        content = await readFile(path.join(home, ".fvwm/config"), "utf-8");
        return {
          contents: [
            {
              uri,
              mimeType: "text/plain",
              text: content,
            },
          ],
        };

      case "fvwm://config/repo":
        content = await readFile(
          path.join(home, "repo/utils/desktop-settings/fvwm3rc/config"),
          "utf-8"
        );
        return {
          contents: [
            {
              uri,
              mimeType: "text/plain",
              text: content,
            },
          ],
        };

      // Documentation
      case "fvwm://docs/claude":
        content = await readFile(
          path.join(home, "repo/utils/desktop-settings/CLAUDE.md"),
          "utf-8"
        );
        return {
          contents: [
            {
              uri,
              mimeType: "text/markdown",
              text: content,
            },
          ],
        };

      case "fvwm://docs/shortcuts":
        content = await readFile(
          path.join(home, ".fvwm/ATAJOS-MOVIMIENTO.md"),
          "utf-8"
        );
        return {
          contents: [
            {
              uri,
              mimeType: "text/markdown",
              text: content,
            },
          ],
        };

      case "fvwm://docs/smart-tiling":
        content = await readFile(
          path.join(home, "repo/utils/desktop-settings/fvwm3rc/scripts/README-SMART-TILING.md"),
          "utf-8"
        );
        return {
          contents: [
            {
              uri,
              mimeType: "text/markdown",
              text: content,
            },
          ],
        };

      case "fvwm://docs/readme":
        content = await readFile(
          path.join(home, "repo/utils/desktop-settings/fvwm3rc/README.md"),
          "utf-8"
        );
        return {
          contents: [
            {
              uri,
              mimeType: "text/markdown",
              text: content,
            },
          ],
        };

      // Scripts
      case "fvwm://scripts/smart-tile":
        content = await readFile(
          path.join(home, ".fvwm/scripts/smart-tile.sh"),
          "utf-8"
        );
        return {
          contents: [
            {
              uri,
              mimeType: "text/x-shellscript",
              text: content,
            },
          ],
        };

      case "fvwm://scripts/maximize-monitor":
        content = await readFile(
          path.join(home, ".fvwm/scripts/maximize-current-monitor.sh"),
          "utf-8"
        );
        return {
          contents: [
            {
              uri,
              mimeType: "text/x-shellscript",
              text: content,
            },
          ],
        };

      case "fvwm://scripts/monitor-setup":
        content = await readFile(
          path.join(home, ".fvwm/scripts/monitor-setup.sh"),
          "utf-8"
        );
        return {
          contents: [
            {
              uri,
              mimeType: "text/x-shellscript",
              text: content,
            },
          ],
        };

      case "fvwm://scripts/toggle-keyboard":
        content = await readFile(
          path.join(home, ".fvwm/scripts/toggle-keyboard-layout.sh"),
          "utf-8"
        );
        return {
          contents: [
            {
              uri,
              mimeType: "text/x-shellscript",
              text: content,
            },
          ],
        };

      // Runtime state
      case "fvwm://state/monitors":
        const { stdout: xrandrOutput } = await execAsync("xrandr --query");
        return {
          contents: [
            {
              uri,
              mimeType: "text/plain",
              text: xrandrOutput,
            },
          ],
        };

      case "fvwm://state/windows":
        const { stdout: windowList } = await execAsync(
          'FvwmCommand "All (CurrentPage) Echo $[w.id] $[w.name] $[w.x] $[w.y] $[w.width] $[w.height]"'
        );
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify({ windows: windowList.trim().split("\n") }, null, 2),
            },
          ],
        };

      case "fvwm://state/current-desktop":
        const { stdout: deskInfo } = await execAsync(
          'FvwmCommand "Echo desk=$[desk.n] page=$[page.nx]x$[page.ny]"'
        );
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify({ state: deskInfo.trim() }, null, 2),
            },
          ],
        };

      case "fvwm://state/tile-states":
        const tileStateDir = path.join(home, ".fvwm/tile-state");
        try {
          const { stdout: files } = await execAsync(`ls ${tileStateDir}`);
          const states: Record<string, string> = {};

          for (const file of files.trim().split("\n")) {
            if (file) {
              const stateContent = await readFile(
                path.join(tileStateDir, file),
                "utf-8"
              );
              states[file] = stateContent.trim();
            }
          }

          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(states, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify({}, null, 2),
              },
            ],
          };
        }

      // Debug logs
      case "fvwm://logs/smart-tile":
        try {
          content = await readFile(
            path.join(home, ".fvwm/smart-tile-debug.log"),
            "utf-8"
          );
        } catch {
          content = "No debug log found";
        }
        return {
          contents: [
            {
              uri,
              mimeType: "text/plain",
              text: content,
            },
          ],
        };

      default:
        throw new Error(`Unknown resource URI: ${uri}`);
    }
  } catch (error) {
    throw new Error(`Failed to read resource ${uri}: ${error}`);
  }
}
