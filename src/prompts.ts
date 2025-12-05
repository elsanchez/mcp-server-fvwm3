/**
 * Prompts Module - Provides templates for FVWM3 configuration generation
 */

/**
 * List of all available prompts
 */
export function getPrompts() {
  return [
    {
      name: "create-window-function",
      description: "Generate a new FVWM window manipulation function",
      arguments: [
        {
          name: "function_name",
          description: "Name for the new function (e.g., 'MoveToCenterAndResize')",
          required: true,
        },
        {
          name: "description",
          description: "What the function should do",
          required: true,
        },
      ],
    },
    {
      name: "add-keybinding",
      description: "Generate a keybinding with conflict checking",
      arguments: [
        {
          name: "key_combo",
          description: "Key combination (e.g., 'Super_L+m', 'Alt+Shift+w')",
          required: true,
        },
        {
          name: "action",
          description: "What the keybinding should do",
          required: true,
        },
        {
          name: "context",
          description: "Context where binding applies (default: 'A' for all)",
          required: false,
        },
      ],
    },
    {
      name: "create-tiling-script",
      description: "Generate a bash script for window tiling operations",
      arguments: [
        {
          name: "script_name",
          description: "Name for the script (e.g., 'quarter-tile')",
          required: true,
        },
        {
          name: "tiling_behavior",
          description: "Describe the tiling behavior (e.g., 'tile to top-left quarter')",
          required: true,
        },
      ],
    },
    {
      name: "debug-fvwm-issue",
      description: "Guide for debugging FVWM configuration issues",
      arguments: [
        {
          name: "issue_description",
          description: "Describe the problem you're experiencing",
          required: true,
        },
      ],
    },
    {
      name: "create-menu",
      description: "Generate an FVWM menu configuration",
      arguments: [
        {
          name: "menu_name",
          description: "Name for the menu (e.g., 'WindowOpsMenu')",
          required: true,
        },
        {
          name: "menu_items",
          description: "Comma-separated list of menu items",
          required: true,
        },
      ],
    },
  ];
}

/**
 * Get a specific prompt with arguments
 */
export async function getPrompt(name: string, args: any) {
  switch (name) {
    case "create-window-function": {
      const { function_name, description } = args;
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Create a new FVWM3 window function called "${function_name}" that ${description}.

The function should:
1. Follow FVWM3 best practices
2. Use DestroyFunc to allow reloading
3. Use proper FVWM expansion variables (e.g., $[w.id], $[w.x], $[w.width])
4. Include comments explaining the logic
5. Handle edge cases appropriately

Current FVWM3 setup context:
- 3 monitors: DP-4 (1920x1080+0+0), HDMI-0 (1920x1080+1920+0), DP-2 (1920x1080+3840+0)
- Desktop layout: 4 desktops (Principal, Web, Desarrollo, Media), 2x2 pages each
- Panel reserves 120px on right edge (EwmhBaseStruts 0 120 0 0)
- Focus policy: ClickToFocus

Provide the complete function definition ready to be added to ~/.fvwm/config.`,
            },
          },
        ],
      };
    }

    case "add-keybinding": {
      const { key_combo, action, context = "A" } = args;
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Create a keybinding for ${key_combo} that ${action}.

Requirements:
1. Check for conflicts with existing keybindings in the configuration
2. Use proper FVWM Key syntax: Key <keyname> <context> <modifiers> <action>
3. Context: ${context} (R=root window, W=application window, A=all)
4. Follow the project's keybinding conventions:
   - Super (Mod4) for system/WM operations
   - Alt for desktop/window movement
   - Ctrl+Alt for window positioning (shuffle, grow)

Current keybinding scheme:
- Alt+q/w/a/s: Navigate to desktops
- Alt+Shift+Q/W/A/S: Send window to desktop
- Alt+Ctrl+q/w/a/s: Move window and follow
- Super+Enter: Terminal
- Super+W: Browser
- Super+E: Editor
- Super+Space: Toggle keyboard layout
- Super+Arrow keys: Smart tiling

Provide:
1. The complete Key command
2. List of any conflicts found
3. Suggested alternatives if conflicts exist`,
            },
          },
        ],
      };
    }

    case "create-tiling-script": {
      const { script_name, tiling_behavior } = args;
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Create a bash script called "${script_name}.sh" that ${tiling_behavior}.

The script should:
1. Follow the smart tiling architecture pattern from smart-tile.sh
2. Use xrandr to detect monitor geometry
3. Handle multi-monitor setups correctly
4. Use FVWM expansion variables passed as arguments
5. Generate ResizeMove commands with absolute pixel coordinates
6. Include debug logging to ~/.fvwm/smart-tile-debug.log
7. Manage state in ~/.fvwm/tile-state/ if needed

Monitor setup:
- DP-4: 1920x1080+0+0 (left)
- HDMI-0: 1920x1080+1920+0 (center, primary)
- DP-2: 1920x1080+3840+0 (right)

Script should accept FVWM variables as arguments:
\$1 = window_id (e.g., 0x9200005)
\$2 = window_x
\$3 = window_y
\$4 = window_width
\$5 = window_height

Output should be FVWM commands that can be used with PipeRead.

Provide:
1. Complete bash script with shebang
2. FVWM function definition to call the script
3. Example keybinding
4. Usage instructions`,
            },
          },
        ],
      };
    }

    case "debug-fvwm-issue": {
      const { issue_description } = args;
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `I'm experiencing an issue with FVWM3: ${issue_description}

Please provide a systematic debugging approach:

1. **Information Gathering**
   - What FVWM resources to check (fvwm://config/main, fvwm://logs/*, etc.)
   - What tools to use (fvwm_get_window_info, fvwm_get_keybindings, etc.)
   - What logs to examine

2. **Diagnostic Steps**
   - Commands to run for diagnosis
   - Expected vs actual output
   - Common causes for this type of issue

3. **Testing**
   - How to test in isolation
   - How to verify the fix
   - How to avoid breaking other functionality

4. **Common Solutions**
   - Based on similar issues in FVWM3
   - Configuration fixes
   - Workarounds if no direct fix exists

Current setup context:
- FVWM3 version: 1.1.5
- 3 monitors, 4 desktops, ClickToFocus
- Smart tiling system installed
- Custom keybindings using QWAS scheme
- RightPanel on primary monitor

Provide step-by-step debugging instructions.`,
            },
          },
        ],
      };
    }

    case "create-menu": {
      const { menu_name, menu_items } = args;
      const items = menu_items.split(",").map((item: string) => item.trim());
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Create an FVWM menu called "${menu_name}" with the following items:
${items.map((item: string, idx: number) => `${idx + 1}. ${item}`).join("\n")}

The menu should:
1. Use DestroyMenu to allow reloading
2. Follow the project's color scheme (Dracula/Nord inspired dark theme):
   - Colorset 0: Background (#282a36)
   - Colorset 1: Inactive elements (#44475a)
   - Colorset 2: Active highlights (#8be9fd)
3. Include appropriate icons if available
4. Have proper spacing and separators
5. Use meaningful shortcuts/accelerators

Menu syntax:
DestroyMenu <menu_name>
AddToMenu <menu_name> "Title" Title
+ "Item Text" Action
+ "" Nop  # Separator

Provide:
1. Complete menu definition
2. Suggested keybinding to open the menu
3. Example of how to add it to the root menu
4. Usage notes`,
            },
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}
