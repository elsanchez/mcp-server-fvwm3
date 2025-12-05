/**
 * Tools Module - Provides executable tools for FVWM3 control and queries
 */

import { exec } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { homedir } from "os";
import path from "path";

const execAsync = promisify(exec);

/**
 * List of all available tools
 */
export function getTools() {
  return [
    {
      name: "fvwm_execute",
      description: "Execute an FVWM command using FvwmCommand",
      inputSchema: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "The FVWM command to execute (e.g., 'Restart', 'Move 100p 100p')",
          },
        },
        required: ["command"],
      },
    },
    {
      name: "fvwm_get_window_info",
      description: "Get detailed information about a specific window or all windows",
      inputSchema: {
        type: "object",
        properties: {
          window_id: {
            type: "string",
            description: "Window ID in hex format (e.g., '0x9200005'). If not provided, returns all windows.",
          },
        },
      },
    },
    {
      name: "fvwm_get_monitor_layout",
      description: "Get current monitor layout and geometry from xrandr",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "fvwm_test_function",
      description: "Check if a specific FVWM function exists in the configuration",
      inputSchema: {
        type: "object",
        properties: {
          function_name: {
            type: "string",
            description: "Name of the FVWM function to check (e.g., 'SmartTileLeft')",
          },
        },
        required: ["function_name"],
      },
    },
    {
      name: "fvwm_restart",
      description: "Restart FVWM3 to apply configuration changes",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "fvwm_validate_config",
      description: "Validate FVWM3 configuration syntax without restarting",
      inputSchema: {
        type: "object",
        properties: {
          config_path: {
            type: "string",
            description: "Path to config file to validate. Defaults to ~/.fvwm/config",
          },
        },
      },
    },
    {
      name: "fvwm_get_keybindings",
      description: "List all keyboard bindings from the configuration",
      inputSchema: {
        type: "object",
        properties: {
          filter: {
            type: "string",
            description: "Optional filter string to search for specific bindings",
          },
        },
      },
    },
    {
      name: "smart_tile_debug",
      description: "View the smart tiling debug log (last N lines)",
      inputSchema: {
        type: "object",
        properties: {
          lines: {
            type: "number",
            description: "Number of lines to retrieve from the end of the log. Default: 50",
          },
        },
      },
    },
    {
      name: "smart_tile_state",
      description: "View or clear smart tiling state for windows",
      inputSchema: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["view", "clear"],
            description: "Action to perform: 'view' to see states, 'clear' to reset all states",
          },
          window_id: {
            type: "string",
            description: "Optional window ID to view/clear specific window state",
          },
        },
        required: ["action"],
      },
    },
    {
      name: "fvwm_get_desktop_info",
      description: "Get information about the current desktop and page",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ];
}

/**
 * Execute a tool by name
 */
export async function executeTool(name: string, args: any) {
  const home = homedir();

  try {
    switch (name) {
      case "fvwm_execute": {
        const { command } = args;
        try {
          const { stdout, stderr } = await execAsync(`FvwmCommand "${command.replace(/"/g, '\\"')}"`);
          return {
            content: [
              {
                type: "text",
                text: stdout || stderr || "Command executed successfully",
              },
            ],
          };
        } catch (error: any) {
          // FvwmCommand may return non-zero exit code even when command succeeds
          // Check if the error contains actual error message
          if (error.stderr && error.stderr.trim()) {
            throw error;
          }
          return {
            content: [
              {
                type: "text",
                text: "Command executed (no output)",
              },
            ],
          };
        }
      }

      case "fvwm_get_window_info": {
        const { window_id } = args;
        let cmd: string;

        if (window_id) {
          cmd = `FvwmCommand "WindowId ${window_id} Echo id=$[w.id] name=\\"$[w.name]\\" class=$[w.class] desk=$[w.desk] x=$[w.x] y=$[w.y] w=$[w.width] h=$[w.height]"`;
        } else {
          cmd = `FvwmCommand 'All (CurrentPage) Echo id=$[w.id] name="$[w.name]" class=$[w.class] desk=$[w.desk] x=$[w.x] y=$[w.y] w=$[w.width] h=$[w.height]'`;
        }

        const { stdout } = await execAsync(cmd);
        return {
          content: [
            {
              type: "text",
              text: stdout || "No windows found",
            },
          ],
        };
      }

      case "fvwm_get_monitor_layout": {
        const { stdout } = await execAsync("xrandr --query | grep ' connected'");
        return {
          content: [
            {
              type: "text",
              text: stdout,
            },
          ],
        };
      }

      case "fvwm_test_function": {
        const { function_name } = args;
        const config = await readFile(path.join(home, ".fvwm/config"), "utf-8");
        const functionExists = config.includes(`DestroyFunc ${function_name}`) ||
                              config.includes(`AddToFunc ${function_name}`);

        return {
          content: [
            {
              type: "text",
              text: functionExists
                ? `Function '${function_name}' exists in configuration`
                : `Function '${function_name}' NOT found in configuration`,
            },
          ],
        };
      }

      case "fvwm_restart": {
        try {
          await execAsync('FvwmCommand "Restart"');
        } catch (error: any) {
          // Restart command may cause FvwmCommand to exit before getting response
          // This is expected behavior, not an error
        }
        return {
          content: [
            {
              type: "text",
              text: "FVWM3 restart command sent",
            },
          ],
        };
      }

      case "fvwm_validate_config": {
        const configPath = args.config_path || path.join(home, ".fvwm/config");
        try {
          // fvwm3 doesn't have a built-in config validator, so we check basic syntax
          const config = await readFile(configPath, "utf-8");
          const lines = config.split("\n");
          const errors: string[] = [];

          // Basic syntax checks
          lines.forEach((line, idx) => {
            const lineNum = idx + 1;
            const trimmed = line.trim();

            // Check for unmatched quotes
            const doubleQuotes = (trimmed.match(/"/g) || []).length;
            if (doubleQuotes % 2 !== 0) {
              errors.push(`Line ${lineNum}: Unmatched double quotes`);
            }

            // Check for common typos
            if (trimmed.match(/^(DestroyFun|AddToFun|DestroyMen|AddToMen)\s/)) {
              errors.push(`Line ${lineNum}: Possible typo in command`);
            }
          });

          return {
            content: [
              {
                type: "text",
                text: errors.length === 0
                  ? `Configuration appears valid (${lines.length} lines checked)`
                  : `Found ${errors.length} potential issues:\n${errors.join("\n")}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error reading config: ${error}`,
              },
            ],
          };
        }
      }

      case "fvwm_get_keybindings": {
        const { filter } = args;
        const config = await readFile(path.join(home, ".fvwm/config"), "utf-8");
        const lines = config.split("\n");
        const bindings = lines
          .filter((line) => line.trim().startsWith("Key "))
          .filter((line) => !filter || line.includes(filter));

        return {
          content: [
            {
              type: "text",
              text: bindings.length > 0
                ? bindings.join("\n")
                : "No keybindings found" + (filter ? ` matching '${filter}'` : ""),
            },
          ],
        };
      }

      case "smart_tile_debug": {
        const lines = args.lines || 50;
        try {
          const { stdout } = await execAsync(
            `tail -n ${lines} ${path.join(home, ".fvwm/smart-tile-debug.log")}`
          );
          return {
            content: [
              {
                type: "text",
                text: stdout || "Debug log is empty",
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: "Debug log not found or empty",
              },
            ],
          };
        }
      }

      case "smart_tile_state": {
        const { action, window_id } = args;
        const stateDir = path.join(home, ".fvwm/tile-state");

        if (action === "view") {
          try {
            if (window_id) {
              const state = await readFile(path.join(stateDir, window_id), "utf-8");
              return {
                content: [
                  {
                    type: "text",
                    text: `Window ${window_id}: ${state}`,
                  },
                ],
              };
            } else {
              const { stdout: files } = await execAsync(`ls -1 ${stateDir} 2>/dev/null || echo ""`);
              if (!files.trim()) {
                return {
                  content: [
                    {
                      type: "text",
                      text: "No tile states found",
                    },
                  ],
                };
              }

              const states: string[] = [];
              for (const file of files.trim().split("\n")) {
                if (file) {
                  const state = await readFile(path.join(stateDir, file), "utf-8");
                  states.push(`${file}: ${state.trim()}`);
                }
              }

              return {
                content: [
                  {
                    type: "text",
                    text: states.join("\n"),
                  },
                ],
              };
            }
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: "No tile states found",
                },
              ],
            };
          }
        } else if (action === "clear") {
          try {
            if (window_id) {
              await execAsync(`rm -f ${path.join(stateDir, window_id)}`);
              return {
                content: [
                  {
                    type: "text",
                    text: `Cleared state for window ${window_id}`,
                  },
                ],
              };
            } else {
              await execAsync(`rm -f ${stateDir}/*`);
              return {
                content: [
                  {
                    type: "text",
                    text: "Cleared all tile states",
                  },
                ],
              };
            }
          } catch (error) {
            return {
              content: [
                {
                  type: "text",
                  text: `Error clearing states: ${error}`,
                },
              ],
            };
          }
        }

        throw new Error(`Unknown action: ${action}`);
      }

      case "fvwm_get_desktop_info": {
        const { stdout } = await execAsync(
          'FvwmCommand "Echo desk=$[desk.n] page=$[page.nx]x$[page.ny] deskname=\\"$[desk.name$[desk.n]]\\""'
        );
        return {
          content: [
            {
              type: "text",
              text: stdout || "Unable to get desktop info",
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing tool '${name}': ${error}`,
        },
      ],
      isError: true,
    };
  }
}
