# MCP Server for FVWM3

Model Context Protocol (MCP) server providing access to FVWM3 window manager configuration, state, and control capabilities. This server enables LLMs to interact with FVWM3 for configuration generation, debugging, window management, and development assistance.

## Features

### Resources
Access to FVWM3 configuration files, documentation, scripts, and runtime state:

- **Configuration files**: Live and repository versions of FVWM config
- **Documentation**: Architecture docs, shortcuts reference, smart tiling technical docs
- **Scripts**: Smart tiling, monitor setup, keyboard layout toggle
- **Runtime state**: Current monitors, windows, desktops, tile states
- **Debug logs**: Smart tiling debug information

### Tools
Executable tools for FVWM3 control and queries:

- `fvwm_execute`: Execute any FVWM command via FvwmCommand
- `fvwm_get_window_info`: Get window details (geometry, class, desktop)
- `fvwm_get_monitor_layout`: Query current monitor configuration
- `fvwm_test_function`: Check if FVWM function exists
- `fvwm_restart`: Restart FVWM3 to apply changes
- `fvwm_validate_config`: Basic configuration syntax validation
- `fvwm_get_keybindings`: List all keyboard bindings
- `smart_tile_debug`: View smart tiling debug logs
- `smart_tile_state`: View or clear window tiling states
- `fvwm_get_desktop_info`: Get current desktop and page info

### Prompts
Templates for generating FVWM3 configurations:

- `create-window-function`: Generate new window manipulation functions
- `add-keybinding`: Create keybindings with conflict checking
- `create-tiling-script`: Generate bash scripts for tiling operations
- `debug-fvwm-issue`: Systematic debugging guide
- `create-menu`: Generate FVWM menu configurations

## Installation

### Prerequisites

- Node.js 18 or higher
- FVWM3 window manager (version 1.1.5+)
- `xrandr` for monitor detection
- `FvwmCommand` for FVWM control

### Build from Source

```bash
# Clone the repository
git clone https://github.com/elsanchez/mcp-server-fvwm3.git
cd mcp-server-fvwm3

# Install dependencies
npm install

# Build
npm run build

# The server binary will be at build/index.js
```

### Development Mode

```bash
# Watch mode (rebuild on changes)
npm run watch

# Run in development mode with source maps
npm run dev
```

## Configuration

### Claude Desktop

Add to your Claude Desktop configuration file:

**macOS/Linux**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "fvwm3": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-fvwm3/build/index.js"]
    }
  }
}
```

### Other MCP Clients

The server uses stdio transport and follows the MCP specification. Configure according to your client's documentation.

## Usage Examples

### Accessing Resources

```typescript
// Read main FVWM configuration
const config = await readResource("fvwm://config/main");

// Get smart tiling documentation
const docs = await readResource("fvwm://docs/smart-tiling");

// Check current monitor layout
const monitors = await readResource("fvwm://state/monitors");

// View tile states for all windows
const states = await readResource("fvwm://state/tile-states");
```

### Using Tools

```typescript
// Execute FVWM command
await executeTool("fvwm_execute", {
  command: "Restart"
});

// Get info about specific window
await executeTool("fvwm_get_window_info", {
  window_id: "0x9200005"
});

// View last 100 lines of debug log
await executeTool("smart_tile_debug", {
  lines: 100
});

// Clear all tile states
await executeTool("smart_tile_state", {
  action: "clear"
});
```

### Using Prompts

```typescript
// Generate a new window function
await getPrompt("create-window-function", {
  function_name: "MoveToCenterAndResize",
  description: "move the window to the center of the current monitor and resize to 80% width and height"
});

// Add a keybinding with conflict checking
await getPrompt("add-keybinding", {
  key_combo: "Super_L+m",
  action: "maximize the current window on its current monitor",
  context: "W"
});

// Debug an issue
await getPrompt("debug-fvwm-issue", {
  issue_description: "windows are not tiling correctly on the second monitor"
});
```

## Architecture

### Directory Structure

```
mcp-server-fvwm3/
├── src/
│   ├── index.ts       # Main server entry point
│   ├── resources.ts   # Resource handlers
│   ├── tools.ts       # Tool implementations
│   └── prompts.ts     # Prompt templates
├── build/             # Compiled JavaScript (generated)
├── package.json       # npm configuration
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

### Resource URIs

All resources use the `fvwm://` URI scheme:

- `fvwm://config/*` - Configuration files
- `fvwm://docs/*` - Documentation files
- `fvwm://scripts/*` - Bash scripts
- `fvwm://state/*` - Runtime state (dynamic)
- `fvwm://logs/*` - Debug and error logs

### FVWM3 Context

This server is designed for a specific FVWM3 setup:

- **Monitors**: 3 displays (DP-4, HDMI-0, DP-2) in horizontal arrangement
- **Desktops**: 4 virtual desktops with 2x2 pages each
- **Smart Tiling**: Windows 11-style snap with monitor cycling
- **Keybinding Scheme**: QWAS for desktop navigation
- **Theme**: Dracula/Nord inspired dark theme

See `fvwm://docs/claude` for complete architecture documentation.

## Development

### Project Structure

- **Resources**: Read-only access to files and runtime state
  - File-based: Direct file system reads
  - Runtime: Execute commands and parse output

- **Tools**: Execute operations with side effects
  - FVWM commands via `FvwmCommand`
  - System queries via shell commands
  - State management

- **Prompts**: LLM-oriented templates
  - Context-aware code generation
  - Best practices included
  - Current setup details embedded

### Adding New Resources

1. Add resource definition to `getResources()` in `src/resources.ts`
2. Implement handler in `readResource()` switch statement
3. Use appropriate MIME type (text/plain, application/json, etc.)

### Adding New Tools

1. Add tool definition to `getTools()` in `src/tools.ts`
2. Define input schema with JSON Schema
3. Implement handler in `executeTool()` switch statement
4. Return `{ content: [{ type: "text", text: "..." }] }`

### Adding New Prompts

1. Add prompt definition to `getPrompts()` in `src/prompts.ts`
2. Define arguments with descriptions
3. Implement template in `getPrompt()` switch statement
4. Include relevant context from FVWM3 setup

## Known Limitations

1. **FVWM3 Required**: Server assumes FVWM3 is installed and running
2. **File Paths**: Hardcoded to `~/.fvwm/` and `~/repo/utils/desktop-settings/`
3. **Monitor Setup**: Hardcoded monitor names (DP-4, HDMI-0, DP-2)
4. **No Config Validation**: Basic syntax checking only, not full validation
5. **Security**: Executes shell commands - use in trusted environments only

## Security Considerations

This server executes shell commands and FVWM commands with user privileges:

- Only use in trusted environments
- Review generated commands before execution
- Avoid exposing to untrusted networks
- File system access is limited to user's home directory

## Troubleshooting

### Server Won't Start

```bash
# Check Node.js version
node --version  # Should be 18+

# Check build output
npm run build

# Run in dev mode to see errors
npm run dev
```

### FvwmCommand Not Found

```bash
# Check FVWM3 installation
which FvwmCommand
fvwm3 --version

# Ensure FVWM3 is running
ps aux | grep fvwm3
```

### Resource Not Found

- Verify file paths in `src/resources.ts` match your setup
- Check that FVWM3 config exists at `~/.fvwm/config`
- Ensure desktop-settings repo is at `~/repo/utils/desktop-settings/`

### Tool Execution Fails

- Check that FvwmCommand is accessible
- Verify FVWM3 is running and responsive
- Check debug logs: `tail -f ~/.fvwm/smart-tile-debug.log`

## Contributing

This is a personal project tailored to a specific FVWM3 setup. If you want to adapt it:

1. Fork the repository
2. Update file paths in `resources.ts` and `tools.ts`
3. Modify monitor names in tool implementations
4. Adjust prompts to match your setup
5. Update documentation

## License

MIT License - See LICENSE file for details

## Related Projects

- [FVWM3](https://github.com/fvwmorg/fvwm3) - F? Virtual Window Manager
- [Model Context Protocol](https://modelcontextprotocol.io/) - Protocol specification
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) - TypeScript SDK

## References

- [FVWM3 Documentation](https://www.fvwm.org/Archive/Manpages/fvwm3.html)
- [FVWM3 Commands Manual](https://www.fvwm.org/Archive/Manpages/fvwm3commands.html)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Claude Desktop MCP Guide](https://modelcontextprotocol.io/quickstart/user)

## Author

elsanchez

## Version History

- **1.0.0** (2025-12-05)
  - Initial release
  - Resources: Configuration, documentation, scripts, state
  - Tools: 10 FVWM control and query tools
  - Prompts: 5 configuration generation templates
  - Smart tiling system integration
